import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

export const productInclude = {
  brand: true,
  category: true,
  inventory: true,
  images: { orderBy: { position: 'asc' } },
} satisfies Prisma.ProductInclude;

export type ProductWithRelations = Prisma.ProductGetPayload<{ include: typeof productInclude }>;

@Injectable()
export class ProductsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async paginate(params: {
    where: Prisma.ProductWhereInput;
    orderBy: Prisma.ProductOrderByWithRelationInput;
    skip: number;
    take: number;
  }): Promise<{ items: ProductWithRelations[]; total: number }> {
    const [items, total] = await this.prisma.$transaction([
      this.prisma.product.findMany({
        where: params.where,
        include: productInclude,
        orderBy: params.orderBy,
        skip: params.skip,
        take: params.take,
      }),
      this.prisma.product.count({ where: params.where }),
    ]);
    return { items, total };
  }

  findById(id: string): Promise<ProductWithRelations | null> {
    return this.prisma.product.findFirst({
      where: { id, deletedAt: null },
      include: productInclude,
    });
  }

  findBySlug(slug: string): Promise<ProductWithRelations | null> {
    return this.prisma.product.findFirst({
      where: { slug, deletedAt: null },
      include: productInclude,
    });
  }

  async slugExists(slug: string): Promise<boolean> {
    return (await this.prisma.product.count({ where: { slug } })) > 0;
  }

  create(data: Prisma.ProductCreateInput): Promise<ProductWithRelations> {
    return this.prisma.product.create({ data, include: productInclude });
  }

  update(id: string, data: Prisma.ProductUpdateInput): Promise<ProductWithRelations> {
    return this.prisma.product.update({ where: { id }, data, include: productInclude });
  }

  softDelete(id: string): Promise<ProductWithRelations> {
    return this.prisma.product.update({
      where: { id },
      data: { deletedAt: new Date() },
      include: productInclude,
    });
  }

  createMovementForNew(inventoryId: string, quantity: number): Promise<unknown> {
    return this.prisma.inventoryMovement.create({
      data: { inventoryId, delta: quantity, reason: 'RESTOCK', note: 'Initial stock' },
    });
  }

  // --- images ---
  addImage(data: Prisma.ProductImageUncheckedCreateInput) {
    return this.prisma.productImage.create({ data });
  }

  findImage(productId: string, imageId: string) {
    return this.prisma.productImage.findFirst({ where: { id: imageId, productId } });
  }

  countImages(productId: string): Promise<number> {
    return this.prisma.productImage.count({ where: { productId } });
  }

  deleteImage(imageId: string) {
    return this.prisma.productImage.delete({ where: { id: imageId } });
  }

  async setPrimaryImage(productId: string, imageId: string): Promise<void> {
    await this.prisma.$transaction([
      this.prisma.productImage.updateMany({ where: { productId }, data: { isPrimary: false } }),
      this.prisma.productImage.update({ where: { id: imageId }, data: { isPrimary: true } }),
    ]);
  }
}
