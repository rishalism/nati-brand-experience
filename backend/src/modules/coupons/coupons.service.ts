import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Coupon as CouponEntity, Prisma } from '@prisma/client';
import type { Coupon } from '@nati/shared';
import { CouponsRepository, type CouponWithCount } from './coupons.repository';
import type { CreateCouponDto, UpdateCouponDto } from './dto/coupon.dto';

const round2 = (n: number): number => Math.round(n * 100) / 100;

@Injectable()
export class CouponsService {
  constructor(private readonly repo: CouponsRepository) {}

  private toView(c: CouponWithCount): Coupon {
    return {
      id: c.id,
      code: c.code,
      description: c.description,
      discountType: c.discountType,
      discountValue: c.discountValue.toNumber(),
      minSubtotal: c.minSubtotal ? c.minSubtotal.toNumber() : null,
      maxDiscount: c.maxDiscount ? c.maxDiscount.toNumber() : null,
      usageLimit: c.usageLimit,
      perUserLimit: c.perUserLimit,
      startsAt: c.startsAt ? c.startsAt.toISOString() : null,
      expiresAt: c.expiresAt ? c.expiresAt.toISOString() : null,
      isActive: c.isActive,
      usedCount: c._count.usages,
      createdAt: c.createdAt.toISOString(),
      updatedAt: c.updatedAt.toISOString(),
    };
  }

  /** Computes the discount amount for a coupon against a subtotal. */
  computeDiscount(coupon: CouponEntity, subtotal: number): number {
    const value = coupon.discountValue.toNumber();
    let discount =
      coupon.discountType === 'PERCENTAGE' ? (subtotal * value) / 100 : Math.min(value, subtotal);
    if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount.toNumber());
    return round2(Math.max(0, Math.min(discount, subtotal)));
  }

  /** Returns a rejection reason if the coupon can't be used, else null. */
  private async validityError(
    coupon: CouponEntity,
    userId: string,
    subtotal: number,
  ): Promise<string | null> {
    const now = new Date();
    if (!coupon.isActive) return 'Coupon is not active';
    if (coupon.startsAt && now < coupon.startsAt) return 'Coupon is not yet active';
    if (coupon.expiresAt && now > coupon.expiresAt) return 'Coupon has expired';
    if (coupon.minSubtotal && subtotal < coupon.minSubtotal.toNumber()) {
      return `Requires a minimum subtotal of ${coupon.minSubtotal.toString()}`;
    }
    if (coupon.usageLimit && (await this.repo.countUsages(coupon.id)) >= coupon.usageLimit) {
      return 'Coupon usage limit reached';
    }
    if (
      coupon.perUserLimit &&
      (await this.repo.countUserUsages(coupon.id, userId)) >= coupon.perUserLimit
    ) {
      return 'You have already used this coupon';
    }
    return null;
  }

  /** Validates a coupon by code for a user + subtotal, throwing on failure. */
  async validateForUser(
    code: string,
    userId: string,
    subtotal: number,
  ): Promise<{ coupon: CouponEntity; discount: number }> {
    const coupon = await this.repo.findByCode(code);
    if (!coupon) throw new BadRequestException('Invalid coupon code');
    const error = await this.validityError(coupon, userId, subtotal);
    if (error) throw new BadRequestException(error);
    return { coupon, discount: this.computeDiscount(coupon, subtotal) };
  }

  /** Non-throwing evaluation used when rendering a cart that already has a
   * coupon attached — returns 0 if the coupon is no longer valid. */
  async evaluate(coupon: CouponEntity, userId: string, subtotal: number): Promise<number> {
    const error = await this.validityError(coupon, userId, subtotal);
    return error ? 0 : this.computeDiscount(coupon, subtotal);
  }

  // --- admin ---
  async list(): Promise<Coupon[]> {
    return (await this.repo.list()).map((c) => this.toView(c));
  }

  async create(dto: CreateCouponDto): Promise<Coupon> {
    const existing = await this.repo.findByCode(dto.code);
    if (existing) throw new BadRequestException('Coupon code already exists');
    return this.toView(await this.repo.create(this.toData(dto)));
  }

  async update(id: string, dto: UpdateCouponDto): Promise<Coupon> {
    const existing = await this.repo.findById(id);
    if (!existing) throw new NotFoundException('Coupon not found');
    return this.toView(await this.repo.update(id, this.toData(dto)));
  }

  async remove(id: string): Promise<void> {
    const existing = await this.repo.findById(id);
    if (!existing) throw new NotFoundException('Coupon not found');
    await this.repo.softDelete(id);
  }

  private toData(dto: CreateCouponDto | UpdateCouponDto): Prisma.CouponUncheckedCreateInput {
    return {
      ...(dto.code !== undefined ? { code: dto.code.toUpperCase() } : {}),
      description: dto.description,
      ...(dto.discountType !== undefined ? { discountType: dto.discountType } : {}),
      ...(dto.discountValue !== undefined
        ? { discountValue: new Prisma.Decimal(dto.discountValue) }
        : {}),
      minSubtotal: dto.minSubtotal !== undefined ? new Prisma.Decimal(dto.minSubtotal) : undefined,
      maxDiscount: dto.maxDiscount !== undefined ? new Prisma.Decimal(dto.maxDiscount) : undefined,
      usageLimit: dto.usageLimit,
      perUserLimit: dto.perUserLimit,
      startsAt: dto.startsAt ? new Date(dto.startsAt) : undefined,
      expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : undefined,
      isActive: dto.isActive,
    } as Prisma.CouponUncheckedCreateInput;
  }
}
