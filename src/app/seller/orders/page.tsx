"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RecordOfflineSaleDialog } from "@/features/seller/components/record-offline-sale-dialog";
import { SellerOrderTable } from "@/features/seller/components/seller-order-table";
import { useSelectedStoreId } from "@/features/seller/hooks";
import type { OrderStatus } from "@/types/order";

const STATUS_TABS: { value: OrderStatus | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "new", label: "New" },
  { value: "processing", label: "Processing" },
  { value: "packed", label: "Packed" },
  { value: "shipped", label: "Shipped" },
  { value: "out_for_delivery", label: "Out for delivery" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
];

export default function SellerOrdersPage() {
  const [status, setStatus] = useState<OrderStatus | "all">("all");
  const [posDialogOpen, setPosDialogOpen] = useState(false);
  const selectedStoreId = useSelectedStoreId();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Orders</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Track and update orders placed with your store.
          </p>
        </div>
        <Button variant="outline" onClick={() => setPosDialogOpen(true)}>
          <Plus className="size-4" />
          Record offline sale
        </Button>
      </div>

      <Tabs value={status} onValueChange={(value) => setStatus(value as OrderStatus | "all")}>
        <TabsList className="flex-wrap">
          {STATUS_TABS.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <SellerOrderTable status={status === "all" ? undefined : status} storeId={selectedStoreId} />

      <RecordOfflineSaleDialog
        storeId={selectedStoreId}
        open={posDialogOpen}
        onOpenChange={setPosDialogOpen}
      />
    </div>
  );
}
