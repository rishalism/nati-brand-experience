import { Injectable } from '@nestjs/common';
import { OrderStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

export const orderInclude = {
  items: true,
  payment: true,
  invoice: true,
} satisfies Prisma.OrderInclude;

export type OrderWithRelations = Prisma.OrderGetPayload<{ include: typeof orderInclude }>;

@Injectable()
export class OrdersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async paginate(params: {
    where: Prisma.OrderWhereInput;
    skip: number;
    take: number;
  }): Promise<{ items: OrderWithRelations[]; total: number }> {
    const [items, total] = await this.prisma.$transaction([
      this.prisma.order.findMany({
        where: params.where,
        include: orderInclude,
        orderBy: { createdAt: 'desc' },
        skip: params.skip,
        take: params.take,
      }),
      this.prisma.order.count({ where: params.where }),
    ]);
    return { items, total };
  }

  findForUser(userId: string, id: string): Promise<OrderWithRelations | null> {
    return this.prisma.order.findFirst({
      where: { id, userId, deletedAt: null },
      include: orderInclude,
    });
  }

  findById(id: string): Promise<OrderWithRelations | null> {
    return this.prisma.order.findFirst({ where: { id, deletedAt: null }, include: orderInclude });
  }

  updateStatus(id: string, status: OrderStatus): Promise<OrderWithRelations> {
    return this.prisma.order.update({ where: { id }, data: { status }, include: orderInclude });
  }
}
