import { Injectable } from '@nestjs/common';
import { Coupon, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

const couponWithCount = {
  _count: { select: { usages: true } },
} satisfies Prisma.CouponInclude;

export type CouponWithCount = Prisma.CouponGetPayload<{ include: typeof couponWithCount }>;

@Injectable()
export class CouponsRepository {
  constructor(private readonly prisma: PrismaService) {}

  findByCode(code: string): Promise<Coupon | null> {
    return this.prisma.coupon.findFirst({ where: { code: code.toUpperCase(), deletedAt: null } });
  }

  findById(id: string): Promise<CouponWithCount | null> {
    return this.prisma.coupon.findFirst({
      where: { id, deletedAt: null },
      include: couponWithCount,
    });
  }

  list(): Promise<CouponWithCount[]> {
    return this.prisma.coupon.findMany({
      where: { deletedAt: null },
      include: couponWithCount,
      orderBy: { createdAt: 'desc' },
    });
  }

  create(data: Prisma.CouponCreateInput): Promise<CouponWithCount> {
    return this.prisma.coupon.create({ data, include: couponWithCount });
  }

  update(id: string, data: Prisma.CouponUpdateInput): Promise<CouponWithCount> {
    return this.prisma.coupon.update({ where: { id }, data, include: couponWithCount });
  }

  softDelete(id: string): Promise<Coupon> {
    return this.prisma.coupon.update({ where: { id }, data: { deletedAt: new Date() } });
  }

  countUsages(couponId: string): Promise<number> {
    return this.prisma.couponUsage.count({ where: { couponId } });
  }

  countUserUsages(couponId: string, userId: string): Promise<number> {
    return this.prisma.couponUsage.count({ where: { couponId, userId } });
  }
}
