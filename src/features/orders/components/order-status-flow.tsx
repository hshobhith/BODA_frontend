import { Fragment } from "react";
import { ChevronRight } from "lucide-react";

import type { FulfillmentType, OrderStatus } from "@/types/order";
import { OrderStatusBadge } from "./order-status-badge";

// The usual happy path per fulfillment type (backend ORDER_STATUS_FLOW):
// pickup orders skip the delivery-only hops and go Packed -> Delivered.
// "Shipped" is left out here as it's an optional hop before Out for delivery.
const FLOWS: Record<FulfillmentType, OrderStatus[]> = {
  delivery: ["new", "processing", "packed", "out_for_delivery", "delivered"],
  pickup: ["new", "processing", "packed", "delivered"],
};

const LABELS: Record<FulfillmentType, string> = {
  delivery: "Delivery",
  pickup: "Pickup",
};

// Restaurants use the same statuses with kitchen wording (Preparing / Ready).
const RESTAURANT_FLOW: OrderStatus[] = ["new", "processing", "packed", "out_for_delivery", "delivered"];

/** Read-only illustration of how an order moves through statuses, for help/marketing pages. */
export function OrderStatusFlow() {
  return (
    <div className="flex flex-col gap-3 rounded-lg border bg-muted/30 p-4">
      {(Object.keys(FLOWS) as FulfillmentType[]).map((fulfillment) => (
        <div key={fulfillment} className="flex flex-wrap items-center gap-1.5">
          <span className="w-16 shrink-0 text-xs font-medium text-muted-foreground">
            {LABELS[fulfillment]}
          </span>
          {FLOWS[fulfillment].map((status, i) => (
            <Fragment key={status}>
              {i > 0 && (
                <ChevronRight className="size-3.5 text-muted-foreground" aria-hidden />
              )}
              <OrderStatusBadge status={status} />
            </Fragment>
          ))}
        </div>
      ))}
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="w-16 shrink-0 text-xs font-medium text-muted-foreground">Restaurant</span>
        {RESTAURANT_FLOW.map((status, i) => (
          <Fragment key={status}>
            {i > 0 && <ChevronRight className="size-3.5 text-muted-foreground" aria-hidden />}
            <OrderStatusBadge status={status} storeType="restaurant" />
          </Fragment>
        ))}
      </div>
    </div>
  );
}
