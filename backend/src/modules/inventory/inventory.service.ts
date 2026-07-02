import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Inventory } from '@prisma/client';
import type { InventoryInfo, InventoryMovementReason as SharedReason } from '@nati/shared';
import { InventoryRepository } from './inventory.repository';

@Injectable()
export class InventoryService {
  constructor(private readonly repo: InventoryRepository) {}

  toInfo(inventory: Inventory | null): InventoryInfo {
    if (!inventory) {
      return { quantity: 0, reserved: 0, available: 0, lowStockThreshold: 0, inStock: false };
    }
    const available = inventory.quantity - inventory.reserved;
    return {
      quantity: inventory.quantity,
      reserved: inventory.reserved,
      available,
      lowStockThreshold: inventory.lowStockThreshold,
      inStock: available > 0,
    };
  }

  async getInfo(productId: string): Promise<InventoryInfo> {
    return this.toInfo(await this.repo.findByProductId(productId));
  }

  /** Adjusts stock by `delta` (positive or negative), recording the movement.
   * Rejects adjustments that would drive quantity below zero. */
  async adjust(
    productId: string,
    delta: number,
    reason: SharedReason,
    note: string | undefined,
    userId: string | undefined,
  ): Promise<InventoryInfo> {
    const inventory = await this.repo.findByProductId(productId);
    if (!inventory) throw new NotFoundException('Inventory not found for product');

    const newQuantity = inventory.quantity + delta;
    if (newQuantity < 0) {
      throw new BadRequestException('Adjustment would make stock negative');
    }

    const updated = await this.repo.applyMovement({
      inventoryId: inventory.id,
      newQuantity,
      delta,
      reason: reason,
      note,
      createdBy: userId,
    });
    return this.toInfo(updated);
  }

  async getMovements(productId: string) {
    const inventory = await this.repo.findByProductId(productId);
    if (!inventory) throw new NotFoundException('Inventory not found for product');
    const movements = await this.repo.listMovements(inventory.id);
    return movements.map((m) => ({
      id: m.id,
      delta: m.delta,
      reason: m.reason,
      note: m.note,
      createdAt: m.createdAt.toISOString(),
    }));
  }
}
