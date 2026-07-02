import { Injectable, NotFoundException } from '@nestjs/common';
import { Brand as BrandEntity } from '@prisma/client';
import type { Brand } from '@nati/shared';
import { uniqueSlug } from '../../common/utils/slug.util';
import { BrandsRepository } from './brands.repository';
import type { CreateBrandDto, UpdateBrandDto } from './dto/brand.dto';

@Injectable()
export class BrandsService {
  constructor(private readonly repo: BrandsRepository) {}

  private toView(b: BrandEntity): Brand {
    return {
      id: b.id,
      name: b.name,
      slug: b.slug,
      description: b.description,
      logoUrl: b.logoUrl,
      createdAt: b.createdAt.toISOString(),
      updatedAt: b.updatedAt.toISOString(),
    };
  }

  async list(): Promise<Brand[]> {
    return (await this.repo.findMany()).map((b) => this.toView(b));
  }

  private async getEntity(id: string): Promise<BrandEntity> {
    const brand = await this.repo.findById(id);
    if (!brand) throw new NotFoundException('Brand not found');
    return brand;
  }

  async get(id: string): Promise<Brand> {
    return this.toView(await this.getEntity(id));
  }

  async create(dto: CreateBrandDto): Promise<Brand> {
    const slug = await uniqueSlug(dto.name, (s) => this.repo.slugExists(s));
    const brand = await this.repo.create({
      name: dto.name,
      slug,
      description: dto.description,
      logoUrl: dto.logoUrl,
    });
    return this.toView(brand);
  }

  async update(id: string, dto: UpdateBrandDto): Promise<Brand> {
    await this.getEntity(id);
    const brand = await this.repo.update(id, {
      name: dto.name,
      description: dto.description,
      logoUrl: dto.logoUrl,
    });
    return this.toView(brand);
  }

  async remove(id: string): Promise<void> {
    await this.getEntity(id);
    await this.repo.softDelete(id);
  }
}
