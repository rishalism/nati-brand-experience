import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Category as CategoryEntity } from '@prisma/client';
import type { Category } from '@nati/shared';
import { uniqueSlug } from '../../common/utils/slug.util';
import { CategoriesRepository } from './categories.repository';
import type { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';

@Injectable()
export class CategoriesService {
  constructor(private readonly repo: CategoriesRepository) {}

  private toView(c: CategoryEntity): Category {
    return {
      id: c.id,
      name: c.name,
      slug: c.slug,
      description: c.description,
      parentId: c.parentId,
      imageUrl: c.imageUrl,
      createdAt: c.createdAt.toISOString(),
      updatedAt: c.updatedAt.toISOString(),
    };
  }

  async list(): Promise<Category[]> {
    return (await this.repo.findMany()).map((c) => this.toView(c));
  }

  private async getEntity(id: string): Promise<CategoryEntity> {
    const category = await this.repo.findById(id);
    if (!category) throw new NotFoundException('Category not found');
    return category;
  }

  async get(id: string): Promise<Category> {
    return this.toView(await this.getEntity(id));
  }

  private async assertParent(parentId?: string): Promise<void> {
    if (parentId && !(await this.repo.findById(parentId))) {
      throw new BadRequestException('Parent category not found');
    }
  }

  async create(dto: CreateCategoryDto): Promise<Category> {
    await this.assertParent(dto.parentId);
    const slug = await uniqueSlug(dto.name, (s) => this.repo.slugExists(s));
    const category = await this.repo.create({
      name: dto.name,
      slug,
      description: dto.description,
      imageUrl: dto.imageUrl,
      ...(dto.parentId ? { parent: { connect: { id: dto.parentId } } } : {}),
    });
    return this.toView(category);
  }

  async update(id: string, dto: UpdateCategoryDto): Promise<Category> {
    await this.getEntity(id);
    if (dto.parentId === id) throw new BadRequestException('A category cannot be its own parent');
    await this.assertParent(dto.parentId);
    const category = await this.repo.update(id, {
      name: dto.name,
      description: dto.description,
      imageUrl: dto.imageUrl,
      ...(dto.parentId ? { parent: { connect: { id: dto.parentId } } } : {}),
    });
    return this.toView(category);
  }

  async remove(id: string): Promise<void> {
    await this.getEntity(id);
    await this.repo.softDelete(id);
  }
}
