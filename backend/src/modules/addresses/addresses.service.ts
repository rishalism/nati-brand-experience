import { Injectable, NotFoundException } from '@nestjs/common';
import { Address as AddressEntity } from '@prisma/client';
import type { Address } from '@nati/shared';
import { AddressesRepository } from './addresses.repository';
import type { CreateAddressDto, UpdateAddressDto } from './dto/create-address.dto';

@Injectable()
export class AddressesService {
  constructor(private readonly repo: AddressesRepository) {}

  private toView(a: AddressEntity): Address {
    return {
      id: a.id,
      userId: a.userId,
      label: a.label,
      recipientName: a.recipientName,
      line1: a.line1,
      line2: a.line2,
      city: a.city,
      state: a.state,
      postalCode: a.postalCode,
      country: a.country,
      phone: a.phone,
      isDefault: a.isDefault,
      createdAt: a.createdAt.toISOString(),
      updatedAt: a.updatedAt.toISOString(),
    };
  }

  async list(userId: string): Promise<Address[]> {
    const items = await this.repo.findManyByUser(userId);
    return items.map((a) => this.toView(a));
  }

  private async getOwned(userId: string, id: string): Promise<AddressEntity> {
    const address = await this.repo.findOne(userId, id);
    if (!address) throw new NotFoundException('Address not found');
    return address;
  }

  async get(userId: string, id: string): Promise<Address> {
    return this.toView(await this.getOwned(userId, id));
  }

  async create(userId: string, dto: CreateAddressDto): Promise<Address> {
    // First address is default; an explicit isDefault clears the previous one.
    const count = await this.repo.countForUser(userId);
    const makeDefault = dto.isDefault || count === 0;
    if (makeDefault) await this.repo.unsetDefaults(userId);

    const created = await this.repo.create(userId, {
      label: dto.label,
      recipientName: dto.recipientName,
      line1: dto.line1,
      line2: dto.line2,
      city: dto.city,
      state: dto.state,
      postalCode: dto.postalCode,
      country: dto.country,
      phone: dto.phone,
      isDefault: makeDefault,
    });
    return this.toView(created);
  }

  async update(userId: string, id: string, dto: UpdateAddressDto): Promise<Address> {
    await this.getOwned(userId, id);
    if (dto.isDefault) await this.repo.unsetDefaults(userId);
    const updated = await this.repo.update(id, dto);
    return this.toView(updated);
  }

  async setDefault(userId: string, id: string): Promise<Address> {
    await this.getOwned(userId, id);
    await this.repo.unsetDefaults(userId);
    return this.toView(await this.repo.update(id, { isDefault: true }));
  }

  async remove(userId: string, id: string): Promise<void> {
    await this.getOwned(userId, id);
    await this.repo.softDelete(id);
  }
}
