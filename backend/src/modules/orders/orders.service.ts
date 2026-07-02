import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { OrderStatus, PaymentStatus, Prisma } from '@prisma/client';
import { randomBytes } from 'node:crypto';
import type {
  CheckoutResult,
  Invoice,
  OrderAddress,
  OrderSummary,
  OrderView,
  PaginatedData,
} from '@nati/shared';
import { PrismaService } from '../../prisma/prisma.service';
import { paginate as toPage } from '../../common/utils/pagination.util';
import { CartService } from '../cart/cart.service';
import { EmailService } from '../email/email.service';
import { PaymentsService } from '../payments/payments.service';
import { OrdersRepository, type OrderWithRelations } from './orders.repository';
import type { CheckoutDto } from './dto/checkout.dto';
import type { VerifyRazorpayDto } from './dto/verify-razorpay.dto';

const FREE_SHIPPING_THRESHOLD = 50;
const FLAT_SHIPPING = 5;
const round2 = (n: number): number => Math.round(n * 100) / 100;

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly repo: OrdersRepository,
    private readonly cart: CartService,
    private readonly payments: PaymentsService,
    private readonly email: EmailService,
  ) {}

  // --- mapping ---
  private toAddress(o: OrderWithRelations): OrderAddress {
    return {
      recipientName: o.recipientName,
      line1: o.line1,
      line2: o.line2,
      city: o.city,
      state: o.state,
      postalCode: o.postalCode,
      country: o.country,
      phone: o.phone,
    };
  }

  private toView(o: OrderWithRelations): OrderView {
    return {
      id: o.id,
      orderNumber: o.orderNumber,
      status: o.status,
      currency: o.currency,
      subtotal: o.subtotal.toNumber(),
      discount: o.discount.toNumber(),
      shipping: o.shipping.toNumber(),
      total: o.total.toNumber(),
      couponCode: o.couponCode,
      address: this.toAddress(o),
      items: o.items.map((i) => ({
        id: i.id,
        productId: i.productId,
        name: i.name,
        sku: i.sku,
        unitPrice: i.unitPrice.toNumber(),
        quantity: i.quantity,
        lineTotal: i.lineTotal.toNumber(),
        image: i.image,
      })),
      payment: o.payment
        ? {
            provider: o.payment.provider,
            status: o.payment.status,
            amount: o.payment.amount.toNumber(),
            providerOrderId: o.payment.providerOrderId,
            providerPaymentId: o.payment.providerPaymentId,
          }
        : null,
      placedAt: o.placedAt.toISOString(),
      createdAt: o.createdAt.toISOString(),
      updatedAt: o.updatedAt.toISOString(),
    };
  }

  private toSummary(o: OrderWithRelations): OrderSummary {
    return {
      id: o.id,
      orderNumber: o.orderNumber,
      status: o.status,
      total: o.total.toNumber(),
      currency: o.currency,
      itemCount: o.items.reduce((sum, i) => sum + i.quantity, 0),
      placedAt: o.placedAt.toISOString(),
    };
  }

  private generateOrderNumber(): string {
    return `NATI-${Date.now().toString(36).toUpperCase()}-${randomBytes(2).toString('hex').toUpperCase()}`;
  }

  private async resolveAddress(userId: string, dto: CheckoutDto): Promise<OrderAddress> {
    if (dto.addressId) {
      const address = await this.prisma.address.findFirst({
        where: { id: dto.addressId, userId, deletedAt: null },
      });
      if (!address) throw new BadRequestException('Address not found');
      return {
        recipientName: address.recipientName,
        line1: address.line1,
        line2: address.line2,
        city: address.city,
        state: address.state,
        postalCode: address.postalCode,
        country: address.country,
        phone: address.phone,
      };
    }
    if (!dto.shippingAddress) throw new BadRequestException('Shipping address required');
    return {
      recipientName: dto.shippingAddress.recipientName,
      line1: dto.shippingAddress.line1,
      line2: dto.shippingAddress.line2 ?? null,
      city: dto.shippingAddress.city,
      state: dto.shippingAddress.state,
      postalCode: dto.shippingAddress.postalCode,
      country: dto.shippingAddress.country,
      phone: dto.shippingAddress.phone ?? null,
    };
  }

  async checkout(userId: string, dto: CheckoutDto): Promise<CheckoutResult> {
    const cartView = await this.cart.getCart(userId);
    if (cartView.items.length === 0) throw new BadRequestException('Your cart is empty');

    // Re-check stock before creating the order.
    for (const item of cartView.items) {
      if (item.quantity > item.availableStock) {
        throw new BadRequestException(`Not enough stock for ${item.name}`);
      }
    }

    const address = await this.resolveAddress(userId, dto);
    const cartRow = await this.prisma.cart.findUnique({ where: { userId } });

    const subtotal = cartView.subtotal;
    const discount = cartView.discount;
    const shipping = subtotal - discount >= FREE_SHIPPING_THRESHOLD ? 0 : FLAT_SHIPPING;
    const total = round2(subtotal - discount + shipping);

    // Ensure the requested method is available before we create anything.
    this.payments.getProvider(dto.paymentMethod);

    const order = await this.prisma.order.create({
      data: {
        orderNumber: this.generateOrderNumber(),
        userId,
        status: 'PENDING',
        currency: 'USD',
        subtotal,
        discount,
        shipping,
        total,
        couponId: cartView.coupon ? cartRow?.couponId : null,
        couponCode: cartView.coupon?.code ?? null,
        recipientName: address.recipientName,
        line1: address.line1,
        line2: address.line2,
        city: address.city,
        state: address.state,
        postalCode: address.postalCode,
        country: address.country,
        phone: address.phone,
        items: {
          create: cartView.items.map((i) => ({
            productId: i.productId,
            name: i.name,
            unitPrice: new Prisma.Decimal(i.price),
            quantity: i.quantity,
            lineTotal: new Prisma.Decimal(i.lineTotal),
            image: i.image,
          })),
        },
        payment: {
          create: {
            provider: dto.paymentMethod,
            status: 'PENDING',
            amount: total,
            currency: 'USD',
          },
        },
      },
      include: { items: true, payment: true, invoice: true },
    });

    if (dto.paymentMethod === 'COD') {
      const fulfilled = await this.fulfill(order.id, userId, {
        orderStatus: 'PROCESSING',
        paymentStatus: 'PENDING',
      });
      return { order: fulfilled, razorpay: null };
    }

    // RAZORPAY: create a gateway order; fulfillment happens after verification.
    const provider = this.payments.getProvider('RAZORPAY');
    const amountMinor = Math.round(total * 100);
    const { providerOrderId } = await provider.createPaymentOrder({
      amountMinor,
      currency: 'USD',
      receipt: order.orderNumber,
    });
    await this.prisma.payment.update({
      where: { orderId: order.id },
      data: { providerOrderId },
    });

    return {
      order: this.toView(await this.repo.findById(order.id).then((o) => o as OrderWithRelations)),
      razorpay: {
        keyId: this.payments.razorpayKeyId ?? '',
        razorpayOrderId: providerOrderId ?? '',
        amount: amountMinor,
        currency: 'USD',
      },
    };
  }

  async verifyRazorpay(userId: string, dto: VerifyRazorpayDto): Promise<OrderView> {
    const order = await this.repo.findForUser(userId, dto.orderId);
    if (!order || !order.payment) throw new NotFoundException('Order not found');
    if (order.status !== 'PENDING') return this.toView(order); // already handled (idempotent)

    const provider = this.payments.getProvider('RAZORPAY');
    const valid =
      order.payment.providerOrderId === dto.razorpayOrderId &&
      provider.verifySignature({
        providerOrderId: dto.razorpayOrderId,
        providerPaymentId: dto.razorpayPaymentId,
        signature: dto.razorpaySignature,
      });

    if (!valid) {
      await this.prisma.payment.update({
        where: { orderId: order.id },
        data: { status: 'FAILED' },
      });
      throw new BadRequestException('Payment verification failed');
    }

    return this.fulfill(order.id, userId, {
      orderStatus: 'PAID',
      paymentStatus: 'CAPTURED',
      providerPaymentId: dto.razorpayPaymentId,
      rawPayload: { ...dto },
    });
  }

  /** Atomically decrements stock, records coupon usage, creates the invoice +
   * notification, and advances the order/payment status. Then clears the cart
   * and sends the confirmation email (non-fatal). */
  private async fulfill(
    orderId: string,
    userId: string,
    opts: {
      orderStatus: OrderStatus;
      paymentStatus: PaymentStatus;
      providerPaymentId?: string;
      rawPayload?: Prisma.InputJsonValue;
    },
  ): Promise<OrderView> {
    const order = await this.repo.findById(orderId);
    if (!order) throw new NotFoundException('Order not found');

    await this.prisma.$transaction(async (tx) => {
      for (const item of order.items) {
        if (!item.productId) continue;
        const inv = await tx.inventory.findUnique({ where: { productId: item.productId } });
        if (!inv) continue;
        const newQty = inv.quantity - item.quantity;
        if (newQty < 0) {
          throw new BadRequestException(`Insufficient stock for ${item.name}`);
        }
        await tx.inventory.update({ where: { id: inv.id }, data: { quantity: newQty } });
        await tx.inventoryMovement.create({
          data: {
            inventoryId: inv.id,
            delta: -item.quantity,
            reason: 'SALE',
            referenceId: orderId,
          },
        });
      }

      await tx.order.update({ where: { id: orderId }, data: { status: opts.orderStatus } });
      await tx.payment.update({
        where: { orderId },
        data: {
          status: opts.paymentStatus,
          providerPaymentId: opts.providerPaymentId,
          rawPayload: opts.rawPayload,
        },
      });

      if (order.couponId) {
        await tx.couponUsage.create({
          data: {
            couponId: order.couponId,
            userId,
            orderId,
            discountApplied: order.discount,
          },
        });
      }

      await tx.invoice.create({
        data: { orderId, invoiceNumber: `INV-${order.orderNumber}` },
      });

      await tx.notification.create({
        data: {
          userId,
          type: 'ORDER',
          title: 'Order confirmed',
          message: `Your order ${order.orderNumber} has been placed.`,
        },
      });
    });

    // Post-commit side effects (must not roll back the order).
    await this.cart.clear(userId);
    try {
      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      if (user) {
        await this.email.sendOrderConfirmation(user.email, {
          orderNumber: order.orderNumber,
          total: order.total.toNumber(),
          currency: order.currency,
        });
      }
    } catch (error) {
      this.logger.error(`Order confirmation email failed: ${(error as Error).message}`);
    }

    return this.toView(await this.repo.findById(orderId).then((o) => o as OrderWithRelations));
  }

  // --- customer reads ---
  async getUserOrders(
    userId: string,
    params: { page: number; limit: number; skip: number },
  ): Promise<PaginatedData<OrderSummary>> {
    const { items, total } = await this.repo.paginate({
      where: { userId, deletedAt: null },
      skip: params.skip,
      take: params.limit,
    });
    return toPage(
      items.map((o) => this.toSummary(o)),
      { page: params.page, limit: params.limit, total },
    );
  }

  async getUserOrder(userId: string, id: string): Promise<OrderView> {
    const order = await this.repo.findForUser(userId, id);
    if (!order) throw new NotFoundException('Order not found');
    return this.toView(order);
  }

  async getInvoice(userId: string, id: string): Promise<Invoice> {
    const order = await this.repo.findForUser(userId, id);
    if (!order || !order.invoice) throw new NotFoundException('Invoice not found');
    return {
      invoiceNumber: order.invoice.invoiceNumber,
      orderNumber: order.orderNumber,
      issuedAt: order.invoice.issuedAt.toISOString(),
      subtotal: order.subtotal.toNumber(),
      discount: order.discount.toNumber(),
      shipping: order.shipping.toNumber(),
      total: order.total.toNumber(),
      currency: order.currency,
      address: this.toAddress(order),
      items: order.items.map((i) => ({
        id: i.id,
        productId: i.productId,
        name: i.name,
        sku: i.sku,
        unitPrice: i.unitPrice.toNumber(),
        quantity: i.quantity,
        lineTotal: i.lineTotal.toNumber(),
        image: i.image,
      })),
    };
  }

  // --- admin ---
  async listAll(params: {
    page: number;
    limit: number;
    skip: number;
    status?: OrderStatus;
  }): Promise<PaginatedData<OrderSummary>> {
    const { items, total } = await this.repo.paginate({
      where: { deletedAt: null, ...(params.status ? { status: params.status } : {}) },
      skip: params.skip,
      take: params.limit,
    });
    return toPage(
      items.map((o) => this.toSummary(o)),
      { page: params.page, limit: params.limit, total },
    );
  }

  async getAdminOrder(id: string): Promise<OrderView> {
    const order = await this.repo.findById(id);
    if (!order) throw new NotFoundException('Order not found');
    return this.toView(order);
  }

  async updateStatus(id: string, status: OrderStatus): Promise<OrderView> {
    const order = await this.repo.findById(id);
    if (!order) throw new NotFoundException('Order not found');
    return this.toView(await this.repo.updateStatus(id, status));
  }
}
