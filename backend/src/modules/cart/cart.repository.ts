import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

export const cartInclude = {
  items: {
    include: {
      product: { include: { images: { orderBy: { position: 'asc' } }, inventory: true } },
    },
    orderBy: { createdAt: 'asc' },
  },
  coupon: true,
} satisfies Prisma.CartInclude;

export type CartWithItems = Prisma.CartGetPayload<{ include: typeof cartInclude }>;

export type CartProduct = Prisma.ProductGetPayload<{ include: { inventory: true } }>;

@Injectable()
export class CartRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getOrCreate(userId: string): Promise<CartWithItems> {
    const existing = await this.prisma.cart.findUnique({
      where: { userId },
      include: cartInclude,
    });
    if (existing) return existing;
    return this.prisma.cart.create({ data: { userId }, include: cartInclude });
  }

  findByUser(userId: string): Promise<CartWithItems | null> {
    return this.prisma.cart.findUnique({ where: { userId }, include: cartInclude });
  }

  reload(cartId: string): Promise<CartWithItems> {
    return this.prisma.cart.findUniqueOrThrow({ where: { id: cartId }, include: cartInclude });
  }

  findProduct(productId: string): Promise<CartProduct | null> {
    return this.prisma.product.findFirst({
      where: { id: productId, deletedAt: null },
      include: { inventory: true },
    });
  }

  findItem(cartId: string, productId: string) {
    return this.prisma.cartItem.findUnique({ where: { cartId_productId: { cartId, productId } } });
  }

  incrementItem(cartId: string, productId: string, quantity: number) {
    return this.prisma.cartItem.upsert({
      where: { cartId_productId: { cartId, productId } },
      create: { cartId, productId, quantity },
      update: { quantity: { increment: quantity } },
    });
  }

  setItemQuantity(cartId: string, productId: string, quantity: number) {
    return this.prisma.cartItem.update({
      where: { cartId_productId: { cartId, productId } },
      data: { quantity },
    });
  }

  removeItem(cartId: string, productId: string) {
    return this.prisma.cartItem.deleteMany({ where: { cartId, productId } });
  }

  clearItems(cartId: string) {
    return this.prisma.cartItem.deleteMany({ where: { cartId } });
  }

  setCoupon(cartId: string, couponId: string | null) {
    return this.prisma.cart.update({ where: { id: cartId }, data: { couponId } });
  }
}
