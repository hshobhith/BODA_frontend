"use client";

import { CircleDot, Loader2 } from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useUpdateStoreStatus } from "../hooks";
import { STORE_STATUS_OPTIONS } from "../schemas";
import type { Store, StoreStatus } from "@/types/store";

const STATUS_STYLES: Record<string, string> = {
  open: "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  closed: "border-destructive/40 bg-destructive/10 text-destructive",
  temporarily_closed: "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-400",
  vacation: "border-sky-500/40 bg-sky-500/10 text-sky-700 dark:text-sky-400",
};

interface StoreStatusToggleProps {
  store: Store;
}

/**
 * Prominent, always-visible open/closed switcher — designed for a seller to
 * flip in one tap from a phone at the counter, not buried in a settings tab.
 */
export function StoreStatusToggle({ store }: StoreStatusToggleProps) {
  const updateStatus = useUpdateStoreStatus(store.id);
  const status = store.status ?? "open";
  const styles = STATUS_STYLES[status] ?? STATUS_STYLES.open;

  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-3 rounded-xl border-2 p-4",
        styles
      )}
    >
      <div className="flex items-center gap-2 font-semibold">
        <CircleDot className="size-5" />
        <span>Store status</span>
        {updateStatus.isPending && <Loader2 className="size-4 animate-spin" />}
      </div>
      <Select
        value={status}
        disabled={updateStatus.isPending}
        onValueChange={(value) => updateStatus.mutate({ status: value as StoreStatus })}
      >
        <SelectTrigger className="w-48 border-current bg-background font-medium text-foreground">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {STORE_STATUS_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
