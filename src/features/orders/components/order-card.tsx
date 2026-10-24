import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { ROUTES } from "@/constants/routes";
import type { Order } from "@/types/order";
import { OrderStatusBadge } from "./order-status-badge";

export function OrderCard({ order }: { order: Order }) {
  return (
    <Link href={ROUTES.orderDetail(order.id)}>
      <Card className="transition-colors hover:border-primary/50">
        <CardContent className="flex flex-wrap items-center justify-between gap-3 py-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-medium text-foreground">{order.orderNumber}</span>
              <OrderStatusBadge status={order.status} storeType={order.store?.storeType} />
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {/* `GET /orders/seller/mine` (unlike `/orders/mine` and `/orders/:id`) doesn't
                  embed the `store` relation on each order — this card is reused for the
                  seller dashboard's recent-orders preview, so `store` is treated as optional
                  here even though the shared `Order` type says it's always present. */}
              {order.store?.name ? `${order.store.name} · ` : ""}
              {order.items.length} item
              {order.items.length === 1 ? "" : "s"} &middot;{" "}
              {new Date(order.placedAt).toLocaleDateString(undefined, { dateStyle: "medium" })}
            </p>
          </div>
          <span className="font-semibold text-foreground">&#8377;{order.total.toFixed(2)}</span>
        </CardContent>
      </Card>
    </Link>
  );
}
