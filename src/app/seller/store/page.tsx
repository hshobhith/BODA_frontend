"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DeliverySettingsForm } from "@/features/seller/components/delivery-settings-form";
import { StoreSettingsForm } from "@/features/seller/components/store-settings-form";
import { StoreStatusToggle } from "@/features/seller/components/store-status-toggle";
import { WorkingHoursEditor } from "@/features/seller/components/working-hours-editor";
import { useMyStore, useSelectedStoreId } from "@/features/seller/hooks";

export default function SellerStorePage() {
  const selectedStoreId = useSelectedStoreId();
  const storeQuery = useMyStore(Boolean(selectedStoreId), selectedStoreId);
  const store = storeQuery.data;

  if (!store) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Store settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your store&apos;s details, hours, and delivery options.
        </p>
      </div>

      <StoreStatusToggle store={store} />

      <Tabs defaultValue="basic">
        <TabsList>
          <TabsTrigger value="basic">Basic info</TabsTrigger>
          <TabsTrigger value="hours">Working hours</TabsTrigger>
          <TabsTrigger value="delivery">Delivery settings</TabsTrigger>
        </TabsList>
        <TabsContent value="basic" className="pt-4">
          <StoreSettingsForm store={store} />
        </TabsContent>
        <TabsContent value="hours" className="pt-4">
          <WorkingHoursEditor storeId={store.id} />
        </TabsContent>
        <TabsContent value="delivery" className="pt-4">
          <DeliverySettingsForm store={store} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
