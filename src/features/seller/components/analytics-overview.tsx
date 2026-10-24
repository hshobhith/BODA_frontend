"use client";

import { useMemo } from "react";
import Link from "next/link";
import { AlertTriangle, IndianRupee, PackageSearch, ShoppingBag } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ROUTES } from "@/constants/routes";
import { ORDER_STATUS_META, type Order, type OrderStatus } from "@/types/order";
import { useLowStockProducts, useSellerOrders } from "../hooks";

const TREND_DAYS = 14;

interface DayBucket {
  date: string;
  label: string;
  revenue: number;
}

/**
 * Builds the last `TREND_DAYS` calendar days (oldest first), each filled
 * with the sum of `total` for paid orders placed that day. Days with no
 * orders still appear as zero-height bars so the x-axis stays a consistent
 * timeline rather than only showing days that happened to have sales.
 */
function buildRevenueTrend(orders: Order[]): DayBucket[] {
  const byDay = new Map<string, number>();
  for (const order of orders) {
    if (order.paymentStatus !== "paid") continue;
    const key = order.placedAt.slice(0, 10);
    byDay.set(key, (byDay.get(key) ?? 0) + order.total);
  }

  const days: DayBucket[] = [];
  const today = new Date();
  for (let i = TREND_DAYS - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    days.push({
      date: key,
      label: d.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
      revenue: byDay.get(key) ?? 0,
    });
  }
  return days;
}

function RevenueTrendChart({ trend }: { trend: DayBucket[] }) {
  const max = Math.max(1, ...trend.map((d) => d.revenue));

  return (
    <div className="flex h-40 items-end gap-1.5">
      {trend.map((day) => (
        <div key={day.date} className="group flex flex-1 flex-col items-center gap-1">
          <div
            className="flex w-full items-end justify-center"
            style={{ height: "128px" }}
            title={`${day.label}: ₹${day.revenue.toFixed(2)}`}
          >
            <div
              className="w-full rounded-t-sm bg-primary/70 transition-colors group-hover:bg-primary"
              style={{ height: `${Math.max(2, (day.revenue / max) * 100)}%` }}
            />
          </div>
          <span className="text-[9px] text-muted-foreground">{day.label}</span>
        </div>
      ))}
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 py-4">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="size-5" />
        </span>
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-xl font-semibold text-foreground">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

interface AnalyticsOverviewProps {
  storeId: string;
}

/**
 * Client-computed analytics — there's no dedicated seller analytics
 * endpoint, so this fetches up to 100 recent orders via the existing
 * `GET /orders/seller/mine` and derives revenue/status counts/trend in the
 * browser. Deliberately doesn't show a "best sellers" chart: Phase 1 has no
 * per-product sale-count tracking, so that would just be fabricated data.
 * Low stock is the one metric here that's genuinely backed by a real
 * endpoint (`GET /products/store/:storeId/low-stock`).
 */
export function AnalyticsOverview({ storeId }: AnalyticsOverviewProps) {
  const ordersQuery = useSellerOrders({ limit: 100 });
  const lowStockQuery = useLowStockProducts(storeId);

  const orders = useMemo(() => ordersQuery.data?.data ?? [], [ordersQuery.data]);

  const totalRevenue = useMemo(
    () => orders.filter((o) => o.paymentStatus === "paid").reduce((sum, o) => sum + o.total, 0),
    [orders]
  );

  const statusCounts = useMemo(() => {
    const counts = new Map<OrderStatus, number>();
    for (const order of orders) {
      counts.set(order.status, (counts.get(order.status) ?? 0) + 1);
    }
    return counts;
  }, [orders]);

  const trend = useMemo(() => buildRevenueTrend(orders), [orders]);

  const lowStockProducts = lowStockQuery.data ?? [];

  if (ordersQuery.isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={IndianRupee} label="Revenue (paid orders)" value={`₹${totalRevenue.toFixed(2)}`} />
        <StatCard icon={ShoppingBag} label="Total orders" value={String(orders.length)} />
        <StatCard
          icon={ShoppingBag}
          label="Awaiting action"
          value={String((statusCounts.get("new") ?? 0) + (statusCounts.get("processing") ?? 0))}
        />
        <StatCard icon={ShoppingBag} label="Delivered" value={String(statusCounts.get("delivered") ?? 0)} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Revenue — last {TREND_DAYS} days</CardTitle>
          </CardHeader>
          <CardContent>
            {totalRevenue === 0 ? (
              <p className="text-sm text-muted-foreground">No paid orders yet.</p>
            ) : (
              <RevenueTrendChart trend={trend} />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Orders by status</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {orders.length === 0 ? (
              <p className="text-sm text-muted-foreground">No orders yet.</p>
            ) : (
              Array.from(statusCounts.entries())
                .sort((a, b) => b[1] - a[1])
                .map(([status, count]) => (
                  <div key={status} className="flex items-center justify-between text-sm">
                    <Badge variant="secondary" className={ORDER_STATUS_META[status]?.className}>
                      {ORDER_STATUS_META[status]?.label ?? status}
                    </Badge>
                    <span className="font-medium text-foreground">{count}</span>
                  </div>
                ))
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <AlertTriangle className="size-4 text-amber-500" />
            Low stock
          </CardTitle>
        </CardHeader>
        <CardContent>
          {lowStockQuery.isLoading ? (
            <Skeleton className="h-16 w-full" />
          ) : lowStockProducts.length === 0 ? (
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <PackageSearch className="size-4" />
              Nothing running low right now.
            </p>
          ) : (
            <ul className="flex flex-col divide-y divide-border">
              {lowStockProducts.map((product) => (
                <li key={product.id} className="flex items-center justify-between gap-3 py-2 text-sm">
                  <Link
                    href={ROUTES.sellerProductEdit(product.id)}
                    className="truncate font-medium text-foreground hover:underline"
                  >
                    {product.name}
                  </Link>
                  <Badge variant="destructive">{product.stockQuantity} left</Badge>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
