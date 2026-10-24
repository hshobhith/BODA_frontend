"use client";

import { Plus, Store as StoreIcon } from "lucide-react";
import { useRouter } from "next/navigation";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { ROUTES } from "@/constants/routes";
import { useMyStores, useSelectedStoreId } from "@/features/seller/hooks";
import { useActiveStoreStore } from "@/store/active-store-store";

const ADD_STORE_VALUE = "__add_store__";

const STATUS_DOT: Record<string, string> = {
  open: "bg-emerald-500",
  closed: "bg-muted-foreground",
  temporarily_closed: "bg-amber-500",
  vacation: "bg-sky-500",
};

/**
 * Lets a seller who owns more than one store switch which one the dashboard
 * (Dashboard/Store settings/Products/Orders) is currently showing. Renders
 * nothing if the seller only has one store — no point surfacing a picker
 * with a single, un-switchable option.
 */
export function StoreSwitcher() {
  const router = useRouter();
  const storesQuery = useMyStores();
  const selectedStoreId = useSelectedStoreId();
  const setActiveStoreId = useActiveStoreStore((state) => state.setActiveStoreId);

  const stores = storesQuery.data ?? [];

  if (storesQuery.isLoading) {
    return <Skeleton className="h-9 w-full" />;
  }

  if (stores.length <= 1) {
    return (
      <button
        type="button"
        onClick={() => router.push(ROUTES.sellerStoresNew)}
        className="flex items-center gap-2 rounded-md border border-dashed border-border px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        <Plus className="size-3.5" />
        Add another store
      </button>
    );
  }

  return (
    <Select
      value={selectedStoreId}
      onValueChange={(value) => {
        if (value === ADD_STORE_VALUE) {
          router.push(ROUTES.sellerStoresNew);
          return;
        }
        setActiveStoreId(value);
      }}
    >
      <SelectTrigger className="w-full">
        <StoreIcon className="size-4 shrink-0 text-muted-foreground" />
        <SelectValue placeholder="Select a store" />
      </SelectTrigger>
      <SelectContent>
        {stores.map((store) => (
          <SelectItem key={store.id} value={store.id}>
            <span className="flex items-center gap-2">
              <span className={`size-2 shrink-0 rounded-full ${STATUS_DOT[store.status ?? "closed"] ?? "bg-muted-foreground"}`} />
              {store.name}
            </span>
          </SelectItem>
        ))}
        <SelectSeparator />
        <SelectItem value={ADD_STORE_VALUE}>
          <span className="flex items-center gap-2 text-muted-foreground">
            <Plus className="size-3.5" />
            Add another store
          </span>
        </SelectItem>
      </SelectContent>
    </Select>
  );
}
