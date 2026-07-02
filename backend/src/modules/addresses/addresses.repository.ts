import { Injectable } from '@nestjs/common';
import { Address, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AddressesRepository {
  constructor(private readonly prisma: PrismaService) {}

  findManyByUser(userId: string): Promise<Address[]> {
    return this.prisma.address.findMany({
      where: { userId, deletedAt: null },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });
  }

  findOne(userId: string, id: string): Promise<Address | null> {
    return this.prisma.address.findFirst({ where: { id, userId, deletedAt: null } });
  }

  create(userId: string, data: Prisma.AddressCreateWithoutUserInput): Promise<Address> {
    return this.prisma.address.create({ data: { ...data, user: { connect: { id: userId } } } });
  }

  update(id: string, data: Prisma.AddressUpdateInput): Promise<Address> {
    return this.prisma.address.update({ where: { id }, data });
  }

  softDelete(id: string): Promise<Address> {
    return this.prisma.address.update({ where: { id }, data: { deletedAt: new Date() } });
  }

  unsetDefaults(userId: string): Promise<Prisma.BatchPayload> {
    return this.prisma.address.updateMany({
      where: { userId, isDefault: true, deletedAt: null },
      data: { isDefault: false },
    });
  }

  countForUser(userId: string): Promise<number> {
    return this.prisma.address.count({ where: { userId, deletedAt: null } });
  }
}
