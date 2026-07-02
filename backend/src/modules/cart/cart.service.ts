import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import type { CartLineItem, CartView } from '@nati/shared';
import { CouponsService } from '../coupons/coupons.service';
import { CartRepository, type CartProduct, type CartWithItems } from './cart.repository';

const round2 = (n: number): number => Math.round(n * 100) / 100;

@Injectable()
export class CartService {
  constructor(
    private readonly repo: CartRepository,
    private readonly coupons: CouponsService,
  ) {}

  async getCart(userId: string): Promise<CartView> {
    const cart = await this.repo.getOrCreate(userId);
    return this.buildView(userId, cart);
  }

  private availableStock(product: CartProduct): number {
    if (!product.inventory) return 0;
    return product.inventory.quantity - product.inventory.reserved;
  }

  async addItem(userId: string, productId: string, quantity: number): Promise<CartView> {
    const cart = await this.repo.getOrCreate(userId);
    const product = await this.repo.findProduct(productId);
    if (!product || product.status !== 'ACTIVE') {
      throw new NotFoundException('Product not available');
    }

    const current = await this.repo.findItem(cart.id, productId);
    const desired = (current?.quantity ?? 0) + quantity;
    if (desired > this.availableStock(product)) {
      throw new BadRequestException('Not enough stock available');
    }

    await this.repo.incrementItem(cart.id, productId, quantity);
    return this.buildView(userId, await this.repo.reload(cart.id));
  }

  async updateItem(userId: string, productId: string, quantity: number): Promise<CartView> {
    const cart = await this.repo.getOrCreate(userId);
    if (quantity <= 0) {
      await this.repo.removeItem(cart.id, productId);
      return this.buildView(userId, await this.repo.reload(cart.id));
    }

    const product = await this.repo.findProduct(productId);
    if (!product) throw new NotFoundException('Product not available');
    if (quantity > this.availableStock(product)) {
      throw new BadRequestException('Not enough stock available');
    }

    const existing = await this.repo.findItem(cart.id, productId);
    if (!existing) throw new NotFoundException('Item not in cart');

    await this.repo.setItemQuantity(cart.id, productId, quantity);
    return this.buildView(userId, await this.repo.reload(cart.id));
  }

  async removeItem(userId: string, productId: string): Promise<CartView> {
    const cart = await this.repo.getOrCreate(userId);
    await this.repo.removeItem(cart.id, productId);
    return this.buildView(userId, await this.repo.reload(cart.id));
  }

  async clear(userId: string): Promise<CartView> {
    const cart = await this.repo.getOrCreate(userId);
    await this.repo.clearItems(cart.id);
    await this.repo.setCoupon(cart.id, null);
    return this.buildView(userId, await this.repo.reload(cart.id));
  }

  /** Merges a guest cart (from the client) into the server cart, clamping each
   * line to available stock and skipping anything invalid. */
  async merge(userId: string, items: { productId: string; quantity: number }[]): Promise<CartView> {
    const cart = await this.repo.getOrCreate(userId);
    for (const item of items) {
      const product = await this.repo.findProduct(item.productId);
      if (!product || product.status !== 'ACTIVE') continue;
      const current = await this.repo.findItem(cart.id, item.productId);
      const available = this.availableStock(product);
      const target = Math.min((current?.quantity ?? 0) + item.quantity, available);
      if (target <= 0) continue;
      await this.repo
        .setItemQuantity(cart.id, item.productId, target)
        .catch(() => this.repo.incrementItem(cart.id, item.productId, target));
    }
    return this.buildView(userId, await this.repo.reload(cart.id));
  }

  async applyCoupon(userId: string, code: string): Promise<CartView> {
    const cart = await this.repo.getOrCreate(userId);
    const subtotal = this.computeSubtotal(cart);
    if (subtotal <= 0) throw new BadRequestException('Cart is empty');
    const { coupon } = await this.coupons.validateForUser(code, userId, subtotal);
    await this.repo.setCoupon(cart.id, coupon.id);
    return this.buildView(userId, await this.repo.reload(cart.id));
  }

  async removeCoupon(userId: string): Promise<CartView> {
    const cart = await this.repo.getOrCreate(userId);
    await this.repo.setCoupon(cart.id, null);
    return this.buildView(userId, await this.repo.reload(cart.id));
  }

  private computeSubtotal(cart: CartWithItems): number {
    return round2(
      cart.items.reduce((sum, item) => sum + item.product.price.toNumber() * item.quantity, 0),
    );
  }

  private async buildView(userId: string, cart: CartWithItems): Promise<CartView> {
    const items: CartLineItem[] = cart.items.map((item) => {
      const price = item.product.price.toNumber();
      const available = item.product.inventory
        ? item.product.inventory.quantity - item.product.inventory.reserved
        : 0;
      const primary =
        item.product.images.find((i) => i.isPrimary)?.url ?? item.product.images[0]?.url ?? null;
      return {
        id: item.id,
        productId: item.productId,
        name: item.product.name,
        slug: item.product.slug,
        price,
        quantity: item.quantity,
        lineTotal: round2(price * item.quantity),
        image: primary,
        inStock: available > 0,
        availableStock: available,
      };
    });

    const subtotal = round2(items.reduce((sum, i) => sum + i.lineTotal, 0));

    let discount = 0;
    let couponView: CartView['coupon'] = null;
    if (cart.coupon) {
      discount = await this.coupons.evaluate(cart.coupon, userId, subtotal);
      if (discount > 0) {
        couponView = {
          code: cart.coupon.code,
          discountType: cart.coupon.discountType,
          discountValue: cart.coupon.discountValue.toNumber(),
        };
      }
    }

    return {
      id: cart.id,
      items,
      itemCount: items.reduce((sum, i) => sum + i.quantity, 0),
      subtotal,
      discount,
      total: round2(subtotal - discount),
      coupon: couponView,
    };
  }
}
