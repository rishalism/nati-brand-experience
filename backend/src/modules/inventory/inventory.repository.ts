import { Injectable } from '@nestjs/common';
import { Inventory, InventoryMovement, InventoryMovementReason, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class InventoryRepository {
  constructor(private readonly prisma: PrismaService) {}

  findByProductId(productId: string): Promise<Inventory | null> {
    return this.prisma.inventory.findUnique({ where: { productId } });
  }

  /** Applies a stock delta and records a movement in one transaction. */
  async applyMovement(params: {
    inventoryId: string;
    newQuantity: number;
    delta: number;
    reason: InventoryMovementReason;
    note?: string;
    referenceId?: string;
    createdBy?: string;
  }): Promise<Inventory> {
    const [inventory] = await this.prisma.$transaction([
      this.prisma.inventory.update({
        where: { id: params.inventoryId },
        data: { quantity: params.newQuantity },
      }),
      this.prisma.inventoryMovement.create({
        data: {
          inventoryId: params.inventoryId,
          delta: params.delta,
          reason: params.reason,
          note: params.note,
          referenceId: params.referenceId,
          createdBy: params.createdBy,
        },
      }),
    ]);
    return inventory;
  }

  listMovements(inventoryId: string, take = 50): Promise<InventoryMovement[]> {
    return this.prisma.inventoryMovement.findMany({
      where: { inventoryId },
      orderBy: { createdAt: 'desc' },
      take,
    });
  }

  updateThreshold(productId: string, lowStockThreshold: number): Promise<Inventory> {
    return this.prisma.inventory.update({
      where: { productId },
      data: { lowStockThreshold },
    });
  }

  create(data: Prisma.InventoryCreateInput): Promise<Inventory> {
    return this.prisma.inventory.create({ data });
  }
}
