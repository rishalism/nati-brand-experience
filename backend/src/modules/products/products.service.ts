import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import type { PaginatedData, Product, ProductQuery } from '@nati/shared';
import { paginate } from '../../common/utils/pagination.util';
import { uniqueSlug } from '../../common/utils/slug.util';
import { InventoryService } from '../inventory/inventory.service';
import {
  STORAGE_PROVIDER,
  type IStorageProvider,
  type UploadFile,
} from '../storage/storage-provider.interface';
import { ProductsRepository, type ProductWithRelations } from './products.repository';
import type { CreateProductDto, UpdateProductDto } from './dto/product.dto';

const SORTABLE = new Set(['price', 'name', 'createdAt']);

@Injectable()
export class ProductsService {
  constructor(
    private readonly repo: ProductsRepository,
    private readonly inventory: InventoryService,
    @Inject(STORAGE_PROVIDER) private readonly storage: IStorageProvider,
  ) {}

  private toView(p: ProductWithRelations): Product {
    const images = p.images.map((img) => ({
      id: img.id,
      url: img.url,
      alt: img.alt,
      position: img.position,
      isPrimary: img.isPrimary,
    }));
    const primary = images.find((i) => i.isPrimary) ?? images[0];
    return {
      id: p.id,
      name: p.name,
      slug: p.slug,
      description: p.description,
      price: p.price.toNumber(),
      compareAtPrice: p.compareAtPrice ? p.compareAtPrice.toNumber() : null,
      currency: p.currency,
      status: p.status,
      isFeatured: p.isFeatured,
      sku: p.sku,
      brand: p.brand ? { id: p.brand.id, name: p.brand.name, slug: p.brand.slug } : null,
      category: p.category
        ? { id: p.category.id, name: p.category.name, slug: p.category.slug }
        : null,
      images,
      primaryImage: primary?.url ?? null,
      inventory: this.inventory.toInfo(p.inventory),
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
    };
  }

  private buildWhere(query: ProductQuery, activeOnly: boolean): Prisma.ProductWhereInput {
    const where: Prisma.ProductWhereInput = { deletedAt: null };
    if (activeOnly) where.status = 'ACTIVE';
    else if (query.status) where.status = query.status;

    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
      ];
    }
    if (query.categorySlug) where.category = { slug: query.categorySlug };
    if (query.brandSlug) where.brand = { slug: query.brandSlug };
    if (query.featured !== undefined) where.isFeatured = query.featured;
    if (query.minPrice !== undefined || query.maxPrice !== undefined) {
      where.price = {
        ...(query.minPrice !== undefined ? { gte: query.minPrice } : {}),
        ...(query.maxPrice !== undefined ? { lte: query.maxPrice } : {}),
      };
    }
    if (query.inStock) where.inventory = { quantity: { gt: 0 } };
    return where;
  }

  async list(
    query: ProductQuery & { page: number; limit: number; skip: number },
    activeOnly: boolean,
  ): Promise<PaginatedData<Product>> {
    const sortBy = query.sortBy && SORTABLE.has(query.sortBy) ? query.sortBy : 'createdAt';
    const { items, total } = await this.repo.paginate({
      where: this.buildWhere(query, activeOnly),
      orderBy: { [sortBy]: query.sortOrder ?? 'desc' },
      skip: query.skip,
      take: query.limit,
    });
    return paginate(
      items.map((p) => this.toView(p)),
      { page: query.page, limit: query.limit, total },
    );
  }

  async getById(id: string): Promise<Product> {
    const product = await this.repo.findById(id);
    if (!product) throw new NotFoundException('Product not found');
    return this.toView(product);
  }

  async getBySlug(slug: string): Promise<Product> {
    const product = await this.repo.findBySlug(slug);
    if (!product || product.status !== 'ACTIVE') throw new NotFoundException('Product not found');
    return this.toView(product);
  }

  async create(dto: CreateProductDto): Promise<Product> {
    const slug = await uniqueSlug(dto.name, (s) => this.repo.slugExists(s));
    const initialStock = dto.initialStock ?? 0;
    try {
      const product = await this.repo.create({
        name: dto.name,
        slug,
        description: dto.description,
        price: new Prisma.Decimal(dto.price),
        compareAtPrice:
          dto.compareAtPrice !== undefined ? new Prisma.Decimal(dto.compareAtPrice) : null,
        currency: dto.currency ?? 'USD',
        sku: dto.sku,
        status: dto.status ?? 'DRAFT',
        isFeatured: dto.isFeatured ?? false,
        ...(dto.brandId ? { brand: { connect: { id: dto.brandId } } } : {}),
        ...(dto.categoryId ? { category: { connect: { id: dto.categoryId } } } : {}),
        inventory: { create: { quantity: initialStock } },
      });
      if (initialStock > 0 && product.inventory) {
        await this.repo.createMovementForNew(product.inventory.id, initialStock);
      }
      return this.toView(product);
    } catch (error) {
      throw this.mapWriteError(error);
    }
  }

  async update(id: string, dto: UpdateProductDto): Promise<Product> {
    await this.getById(id);
    try {
      const product = await this.repo.update(id, {
        name: dto.name,
        description: dto.description,
        price: dto.price !== undefined ? new Prisma.Decimal(dto.price) : undefined,
        compareAtPrice:
          dto.compareAtPrice !== undefined ? new Prisma.Decimal(dto.compareAtPrice) : undefined,
        currency: dto.currency,
        sku: dto.sku,
        status: dto.status,
        isFeatured: dto.isFeatured,
        ...(dto.brandId ? { brand: { connect: { id: dto.brandId } } } : {}),
        ...(dto.categoryId ? { category: { connect: { id: dto.categoryId } } } : {}),
      });
      return this.toView(product);
    } catch (error) {
      throw this.mapWriteError(error);
    }
  }

  async remove(id: string): Promise<void> {
    await this.getById(id);
    await this.repo.softDelete(id);
  }

  async uploadImage(productId: string, file: UploadFile): Promise<Product> {
    await this.getById(productId);
    const stored = await this.storage.upload(file, `products/${productId}`);
    const count = await this.repo.countImages(productId);
    await this.repo.addImage({
      productId,
      url: stored.url,
      storageKey: stored.key,
      position: count,
      isPrimary: count === 0,
    });
    return this.getById(productId);
  }

  async deleteImage(productId: string, imageId: string): Promise<void> {
    const image = await this.repo.findImage(productId, imageId);
    if (!image) throw new NotFoundException('Image not found');
    if (image.storageKey) await this.storage.delete(image.storageKey);
    await this.repo.deleteImage(imageId);
  }

  async setPrimaryImage(productId: string, imageId: string): Promise<Product> {
    const image = await this.repo.findImage(productId, imageId);
    if (!image) throw new NotFoundException('Image not found');
    await this.repo.setPrimaryImage(productId, imageId);
    return this.getById(productId);
  }

  private mapWriteError(error: unknown): Error {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return new ConflictException('A product with that SKU or slug already exists');
    }
    return error instanceof Error ? error : new Error('Product write failed');
  }
}
