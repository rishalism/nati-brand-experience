import { useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  DollarSign,
  ShoppingCart,
  Clock,
  Users,
  Package,
  TrendingUp,
} from "lucide-react";
import type { OrderStatus } from "@nati/shared";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useDashboard } from "@/features/analytics/analytics.hooks";

const RANGES = [
  { value: "7", label: "Last 7 days" },
  { value: "30", label: "Last 30 days" },
  { value: "90", label: "Last 90 days" },
];

const STATUS_COLORS: Record<OrderStatus, string> = {
  PENDING: "#f59e0b",
  PAID: "#10b981",
  PROCESSING: "#3b82f6",
  SHIPPED: "#6366f1",
  DELIVERED: "#22c55e",
  CANCELLED: "#ef4444",
  REFUNDED: "#a855f7",
};

const money = (n: number, cents = false) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: cents ? 2 : 0,
  }).format(n);

const shortDate = (iso: string) => {
  const [, m, d] = iso.split("-");
  return `${m}/${d}`;
};

const PRIMARY = "hsl(var(--primary))";
const MUTED = "hsl(var(--muted-foreground))";

const tooltipStyle = {
  backgroundColor: "hsl(var(--popover))",
  border: "1px solid hsl(var(--border))",
  borderRadius: 8,
  color: "hsl(var(--popover-foreground))",
  fontSize: 12,
};

const StatTile = ({
  label,
  value,
  sub,
  icon: Icon,
}: {
  label: string;
  value: string;
  sub?: string;
  icon: React.ComponentType<{ className?: string }>;
}) => (
  <div className="rounded-lg border border-border bg-card p-5">
    <div className="flex items-center justify-between">
      <p className="text-sm text-muted-foreground">{label}</p>
      <Icon className="h-4 w-4 text-muted-foreground" />
    </div>
    <p className="mt-2 font-heading text-2xl text-foreground">{value}</p>
    {sub && <p className="mt-1 text-xs text-muted-foreground">{sub}</p>}
  </div>
);

const ChartCard = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="rounded-lg border border-border bg-card p-5">
    <h2 className="mb-4 text-sm font-medium text-foreground">{title}</h2>
    {children}
  </div>
);

const Dashboard = () => {
  const [days, setDays] = useState("30");
  const { data, isLoading, isFetching, isError } = useDashboard(Number(days));

  const totals = data?.totals;
  const sales = data?.sales ?? [];
  const statusBreakdown = data?.statusBreakdown ?? [];
  const topProducts = data?.topProducts ?? [];
  const recentOrders = data?.recentOrders ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl tracking-wider text-foreground">Dashboard</h1>
          <p className="flex items-center gap-2 text-muted-foreground">
            Overview of your store.
            <span className="inline-flex items-center gap-1 text-xs text-emerald-500">
              <span
                className={`h-2 w-2 rounded-full bg-emerald-500 ${isFetching ? "animate-pulse" : ""}`}
              />
              Live
            </span>
          </p>
        </div>
        <Select value={days} onValueChange={setDays}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {RANGES.map((r) => (
              <SelectItem key={r.value} value={r.value}>
                {r.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isError ? (
        <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-6 text-sm text-destructive">
          Couldn’t load analytics. Retrying automatically…
        </div>
      ) : isLoading ? (
        <div className="rounded-lg border border-border bg-card p-12 text-center text-muted-foreground">
          Loading analytics…
        </div>
      ) : (
        <>
          {/* KPI tiles */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <StatTile
              label="Revenue"
              value={money(totals?.revenue ?? 0)}
              sub={`Avg order ${money(totals?.averageOrderValue ?? 0, true)}`}
              icon={DollarSign}
            />
            <StatTile label="Orders" value={String(totals?.orders ?? 0)} icon={ShoppingCart} />
            <StatTile
              label="Pending"
              value={String(totals?.pendingOrders ?? 0)}
              sub="Awaiting action"
              icon={Clock}
            />
            <StatTile label="Customers" value={String(totals?.customers ?? 0)} icon={Users} />
            <StatTile label="Products" value={String(totals?.products ?? 0)} icon={Package} />
          </div>

          {/* Revenue over time */}
          <ChartCard title="Revenue over time">
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={sales} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
                <defs>
                  <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={PRIMARY} stopOpacity={0.35} />
                    <stop offset="95%" stopColor={PRIMARY} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis
                  dataKey="date"
                  tickFormatter={shortDate}
                  tick={{ fontSize: 11, fill: MUTED }}
                  minTickGap={24}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: MUTED }}
                  tickFormatter={(v) => money(v)}
                  axisLine={false}
                  tickLine={false}
                  width={64}
                />
                <Tooltip
                  contentStyle={tooltipStyle}
                  labelFormatter={shortDate}
                  formatter={(v: number) => [money(v, true), "Revenue"]}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke={PRIMARY}
                  strokeWidth={2}
                  fill="url(#rev)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Orders per day + status breakdown */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <ChartCard title="Orders per day">
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={sales} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="hsl(var(--border))"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="date"
                      tickFormatter={shortDate}
                      tick={{ fontSize: 11, fill: MUTED }}
                      minTickGap={24}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      allowDecimals={false}
                      tick={{ fontSize: 11, fill: MUTED }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={tooltipStyle}
                      labelFormatter={shortDate}
                      formatter={(v: number) => [v, "Orders"]}
                      cursor={{ fill: "hsl(var(--muted))" }}
                    />
                    <Bar dataKey="orders" fill={PRIMARY} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>
            </div>

            <ChartCard title="Orders by status">
              {statusBreakdown.length === 0 ? (
                <p className="py-16 text-center text-sm text-muted-foreground">No orders yet.</p>
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie
                      data={statusBreakdown}
                      dataKey="count"
                      nameKey="status"
                      innerRadius={55}
                      outerRadius={90}
                      paddingAngle={2}
                    >
                      {statusBreakdown.map((s) => (
                        <Cell key={s.status} fill={STATUS_COLORS[s.status]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle} formatter={(v: number, n) => [v, n]} />
                  </PieChart>
                </ResponsiveContainer>
              )}
              <div className="mt-2 flex flex-wrap gap-3">
                {statusBreakdown.map((s) => (
                  <span
                    key={s.status}
                    className="flex items-center gap-1.5 text-xs text-muted-foreground"
                  >
                    <span
                      className="h-2.5 w-2.5 rounded-sm"
                      style={{ backgroundColor: STATUS_COLORS[s.status] }}
                    />
                    {s.status} ({s.count})
                  </span>
                ))}
              </div>
            </ChartCard>
          </div>

          {/* Top products + recent orders */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <ChartCard title="Top products">
              {topProducts.length === 0 ? (
                <p className="py-16 text-center text-sm text-muted-foreground">No sales yet.</p>
              ) : (
                <ResponsiveContainer width="100%" height={40 + topProducts.length * 44}>
                  <BarChart
                    data={topProducts}
                    layout="vertical"
                    margin={{ top: 0, right: 16, left: 8, bottom: 0 }}
                  >
                    <XAxis type="number" hide />
                    <YAxis
                      type="category"
                      dataKey="name"
                      width={120}
                      tick={{ fontSize: 11, fill: MUTED }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={tooltipStyle}
                      formatter={(v: number, n) => [n === "revenue" ? money(v, true) : v, n]}
                      cursor={{ fill: "hsl(var(--muted))" }}
                    />
                    <Bar dataKey="quantity" fill={PRIMARY} radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </ChartCard>

            <div className="rounded-lg border border-border bg-card p-5">
              <h2 className="mb-4 flex items-center gap-2 text-sm font-medium text-foreground">
                <TrendingUp className="h-4 w-4" /> Recent orders
              </h2>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentOrders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground">
                        No orders yet.
                      </TableCell>
                    </TableRow>
                  ) : (
                    recentOrders.map((o) => (
                      <TableRow key={o.orderNumber}>
                        <TableCell className="font-medium">{o.orderNumber}</TableCell>
                        <TableCell>{o.customer}</TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            style={{
                              borderColor: STATUS_COLORS[o.status],
                              color: STATUS_COLORS[o.status],
                            }}
                          >
                            {o.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">{money(o.total, true)}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
