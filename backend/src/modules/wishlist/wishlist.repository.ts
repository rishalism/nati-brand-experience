import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

export const wishlistInclude = {
  items: {
    include: {
      product: { include: { images: { orderBy: { position: 'asc' } }, inventory: true } },
    },
    orderBy: { createdAt: 'desc' },
  },
} satisfies Prisma.WishlistInclude;

export type WishlistWithItems = Prisma.WishlistGetPayload<{ include: typeof wishlistInclude }>;

@Injectable()
export class WishlistRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getOrCreate(userId: string): Promise<WishlistWithItems> {
    const existing = await this.prisma.wishlist.findUnique({
      where: { userId },
      include: wishlistInclude,
    });
    if (existing) return existing;
    return this.prisma.wishlist.create({ data: { userId }, include: wishlistInclude });
  }

  reload(id: string): Promise<WishlistWithItems> {
    return this.prisma.wishlist.findUniqueOrThrow({ where: { id }, include: wishlistInclude });
  }

  findProduct(productId: string) {
    return this.prisma.product.findFirst({
      where: { id: productId, deletedAt: null },
      include: { inventory: true },
    });
  }

  findItem(wishlistId: string, productId: string) {
    return this.prisma.wishlistItem.findUnique({
      where: { wishlistId_productId: { wishlistId, productId } },
    });
  }

  addItem(wishlistId: string, productId: string) {
    return this.prisma.wishlistItem.upsert({
      where: { wishlistId_productId: { wishlistId, productId } },
      create: { wishlistId, productId },
      update: {},
    });
  }

  removeItem(wishlistId: string, productId: string) {
    return this.prisma.wishlistItem.deleteMany({ where: { wishlistId, productId } });
  }
}
