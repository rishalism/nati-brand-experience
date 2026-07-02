import { Injectable } from '@nestjs/common';
import { Brand, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class BrandsRepository {
  constructor(private readonly prisma: PrismaService) {}

  findMany(): Promise<Brand[]> {
    return this.prisma.brand.findMany({ where: { deletedAt: null }, orderBy: { name: 'asc' } });
  }

  findById(id: string): Promise<Brand | null> {
    return this.prisma.brand.findFirst({ where: { id, deletedAt: null } });
  }

  findBySlug(slug: string): Promise<Brand | null> {
    return this.prisma.brand.findFirst({ where: { slug, deletedAt: null } });
  }

  async slugExists(slug: string): Promise<boolean> {
    return (await this.prisma.brand.count({ where: { slug } })) > 0;
  }

  create(data: Prisma.BrandCreateInput): Promise<Brand> {
    return this.prisma.brand.create({ data });
  }

  update(id: string, data: Prisma.BrandUpdateInput): Promise<Brand> {
    return this.prisma.brand.update({ where: { id }, data });
  }

  softDelete(id: string): Promise<Brand> {
    return this.prisma.brand.update({ where: { id }, data: { deletedAt: new Date() } });
  }
}
