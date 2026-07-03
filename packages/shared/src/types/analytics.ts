import type { OrderStatus } from "../constants/enums";

/** Headline KPI tiles for the admin dashboard. */
export interface DashboardTotals {
  revenue: number;
  orders: number;
  customers: number;
  products: number;
  pendingOrders: number;
  averageOrderValue: number;
}

/** One day in the sales time series (zero-filled for days with no orders). */
export interface SalesPoint {
  date: string; // YYYY-MM-DD
  revenue: number;
  orders: number;
}

export interface StatusCount {
  status: OrderStatus;
  count: number;
}

export interface TopProduct {
  name: string;
  quantity: number;
  revenue: number;
}

export interface RecentOrder {
  orderNumber: string;
  total: number;
  status: OrderStatus;
  placedAt: string;
  customer: string;
}

/** Full payload for GET /analytics/dashboard. */
export interface DashboardStats {
  totals: DashboardTotals;
  sales: SalesPoint[];
  statusBreakdown: StatusCount[];
  topProducts: TopProduct[];
  recentOrders: RecentOrder[];
}
