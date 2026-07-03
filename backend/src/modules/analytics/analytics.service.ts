import { Injectable } from '@nestjs/common';
import {
  ORDER_STATUS,
  ROLES,
  type DashboardStats,
  type OrderStatus,
  type RecentOrder,
  type SalesPoint,
  type StatusCount,
  type TopProduct,
} from '@nati/shared';
import { PrismaService } from '../../prisma/prisma.service';

/** Order states that count as captured revenue (paid; excludes pending,
 * cancelled and refunded). */
const REVENUE_STATUSES: OrderStatus[] = [
  ORDER_STATUS.PAID,
  ORDER_STATUS.PROCESSING,
  ORDER_STATUS.SHIPPED,
  ORDER_STATUS.DELIVERED,
];

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  /** Aggregates everything the admin dashboard needs in one round of parallel
   * queries. `days` bounds the sales time series. */
  async dashboard(days: number): Promise<DashboardStats> {
    const since = new Date();
    since.setHours(0, 0, 0, 0);
    since.setDate(since.getDate() - (days - 1));

    const [
      revenueAgg,
      ordersCount,
      pendingCount,
      customersCount,
      productsCount,
      windowOrders,
      statusGroups,
      topItems,
      recent,
    ] = await Promise.all([
      this.prisma.order.aggregate({
        _sum: { total: true },
        where: { deletedAt: null, status: { in: REVENUE_STATUSES } },
      }),
      this.prisma.order.count({ where: { deletedAt: null } }),
      this.prisma.order.count({ where: { deletedAt: null, status: ORDER_STATUS.PENDING } }),
      this.prisma.user.count({
        where: { deletedAt: null, roles: { some: { role: { name: ROLES.CUSTOMER } } } },
      }),
      this.prisma.product.count({ where: { deletedAt: null } }),
      this.prisma.order.findMany({
        where: { deletedAt: null, placedAt: { gte: since } },
        select: { total: true, placedAt: true, status: true },
      }),
      this.prisma.order.groupBy({
        by: ['status'],
        _count: { _all: true },
        where: { deletedAt: null },
      }),
      this.prisma.orderItem.groupBy({
        by: ['name'],
        _sum: { quantity: true, lineTotal: true },
        orderBy: { _sum: { quantity: 'desc' } },
        take: 5,
      }),
      this.prisma.order.findMany({
        where: { deletedAt: null },
        orderBy: { placedAt: 'desc' },
        take: 5,
        select: {
          orderNumber: true,
          total: true,
          status: true,
          placedAt: true,
          recipientName: true,
        },
      }),
    ]);

    const revenue = this.num(revenueAgg._sum.total);

    const totals = {
      revenue,
      orders: ordersCount,
      customers: customersCount,
      products: productsCount,
      pendingOrders: pendingCount,
      averageOrderValue: ordersCount > 0 ? revenue / ordersCount : 0,
    };

    const sales = this.buildSeries(windowOrders, since, days);

    const statusBreakdown: StatusCount[] = statusGroups.map((g) => ({
      status: g.status as OrderStatus,
      count: g._count._all,
    }));

    const topProducts: TopProduct[] = topItems.map((t) => ({
      name: t.name,
      quantity: t._sum.quantity ?? 0,
      revenue: this.num(t._sum.lineTotal),
    }));

    const recentOrders: RecentOrder[] = recent.map((o) => ({
      orderNumber: o.orderNumber,
      total: this.num(o.total),
      status: o.status as OrderStatus,
      placedAt: o.placedAt.toISOString(),
      customer: o.recipientName,
    }));

    return { totals, sales, statusBreakdown, topProducts, recentOrders };
  }

  /** Buckets orders into per-day revenue/orders, zero-filling every day in the
   * window so the chart has a continuous x-axis. */
  private buildSeries(
    orders: { total: unknown; placedAt: Date; status: string }[],
    since: Date,
    days: number,
  ): SalesPoint[] {
    const buckets = new Map<string, { revenue: number; orders: number }>();
    for (let i = 0; i < days; i++) {
      const d = new Date(since);
      d.setDate(since.getDate() + i);
      buckets.set(this.dayKey(d), { revenue: 0, orders: 0 });
    }
    for (const o of orders) {
      const bucket = buckets.get(this.dayKey(o.placedAt));
      if (!bucket) continue;
      bucket.orders += 1;
      if (REVENUE_STATUSES.includes(o.status as OrderStatus)) {
        bucket.revenue += this.num(o.total);
      }
    }
    return [...buckets.entries()].map(([date, v]) => ({ date, ...v }));
  }

  private dayKey(d: Date): string {
    return d.toISOString().slice(0, 10);
  }

  /** Prisma Decimal | number | null → number. */
  private num(v: unknown): number {
    if (v == null) return 0;
    return typeof v === 'number' ? v : Number(v.toString());
  }
}
