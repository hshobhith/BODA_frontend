import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ORDER_STATUS_META, orderStatusLabel, type OrderStatus } from "@/types/order";
import type { StoreType } from "@/types/store";

/**
 * Shared, color-coded status badge — used across the customer order pages,
 * seller order management, and admin order oversight so status always reads
 * the same everywhere in the app. Pass `storeType` so restaurant orders read
 * "Preparing"/"Ready" instead of "Processing"/"Packed".
 */
export function OrderStatusBadge({
  status,
  storeType,
  className,
}: {
  status: OrderStatus;
  storeType?: StoreType | null;
  className?: string;
}) {
  const colorClass = ORDER_STATUS_META[status]?.className ?? "bg-muted text-muted-foreground";

  return (
    <Badge variant="secondary" className={cn(colorClass, "border-0 font-medium", className)}>
      {orderStatusLabel(status, storeType)}
    </Badge>
  );
}
