import { Injectable, NotFoundException } from '@nestjs/common';
import type { WishlistItemView } from '@nati/shared';
import { WishlistRepository, type WishlistWithItems } from './wishlist.repository';

@Injectable()
export class WishlistService {
  constructor(private readonly repo: WishlistRepository) {}

  private buildView(wishlist: WishlistWithItems): WishlistItemView[] {
    return wishlist.items.map((item) => {
      const available = item.product.inventory
        ? item.product.inventory.quantity - item.product.inventory.reserved
        : 0;
      const primary =
        item.product.images.find((i) => i.isPrimary)?.url ?? item.product.images[0]?.url ?? null;
      return {
        id: item.id,
        addedAt: item.createdAt.toISOString(),
        product: {
          id: item.product.id,
          name: item.product.name,
          slug: item.product.slug,
          price: item.product.price.toNumber(),
          compareAtPrice: item.product.compareAtPrice
            ? item.product.compareAtPrice.toNumber()
            : null,
          primaryImage: primary,
          inStock: available > 0,
        },
      };
    });
  }

  async get(userId: string): Promise<WishlistItemView[]> {
    return this.buildView(await this.repo.getOrCreate(userId));
  }

  async add(userId: string, productId: string): Promise<WishlistItemView[]> {
    const wishlist = await this.repo.getOrCreate(userId);
    const product = await this.repo.findProduct(productId);
    if (!product || product.status !== 'ACTIVE')
      throw new NotFoundException('Product not available');
    await this.repo.addItem(wishlist.id, productId);
    return this.buildView(await this.repo.reload(wishlist.id));
  }

  async remove(userId: string, productId: string): Promise<WishlistItemView[]> {
    const wishlist = await this.repo.getOrCreate(userId);
    await this.repo.removeItem(wishlist.id, productId);
    return this.buildView(await this.repo.reload(wishlist.id));
  }

  async toggle(userId: string, productId: string): Promise<WishlistItemView[]> {
    const wishlist = await this.repo.getOrCreate(userId);
    const existing = await this.repo.findItem(wishlist.id, productId);
    if (existing) {
      await this.repo.removeItem(wishlist.id, productId);
    } else {
      const product = await this.repo.findProduct(productId);
      if (!product || product.status !== 'ACTIVE') {
        throw new NotFoundException('Product not available');
      }
      await this.repo.addItem(wishlist.id, productId);
    }
    return this.buildView(await this.repo.reload(wishlist.id));
  }
}
