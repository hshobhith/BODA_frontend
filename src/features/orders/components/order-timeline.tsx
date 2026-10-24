import { Check } from "lucide-react";

import { OrderStatusBadge } from "./order-status-badge";
import { cn } from "@/lib/utils";
import type { OrderStatusHistoryEntry } from "@/types/order";
import type { StoreType } from "@/types/store";

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function OrderTimeline({
  history,
  storeType,
}: {
  history: OrderStatusHistoryEntry[];
  storeType?: StoreType | null;
}) {
  if (history.length === 0) {
    return <p className="text-sm text-muted-foreground">No status updates yet.</p>;
  }

  return (
    <ol className="flex flex-col gap-0">
      {history.map((entry, index) => {
        const isLast = index === history.length - 1;
        return (
          <li key={entry.id} className="relative flex gap-3 pb-6 last:pb-0">
            {!isLast && (
              <span
                className="absolute top-6 left-[11px] h-full w-px bg-border"
                aria-hidden
              />
            )}
            <span
              className={cn(
                "z-10 flex size-6 shrink-0 items-center justify-center rounded-full",
                isLast ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              )}
            >
              <Check className="size-3.5" />
            </span>
            <div className="flex flex-col gap-1 pt-0.5">
              <div className="flex flex-wrap items-center gap-2">
                <OrderStatusBadge status={entry.status} storeType={storeType} />
                <span className="text-xs text-muted-foreground">
                  {formatDateTime(entry.createdAt)}
                </span>
              </div>
              {entry.note && <p className="text-sm text-muted-foreground">{entry.note}</p>}
              {entry.changedBy && (
                <p className="text-xs text-muted-foreground">by {entry.changedBy.fullName}</p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
