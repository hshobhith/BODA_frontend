"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { Skeleton } from "@/components/ui/skeleton";
import { ROUTES } from "@/constants/routes";
import { ProductForm } from "@/features/seller/components/product-form";
import { useMyStore, useSelectedStoreId } from "@/features/seller/hooks";

function NewSellerProductContent() {
  const router = useRouter();
  // `?scan=1` (the "Scan barcode" button on the products page) opens the camera straight away.
  const autoScan = useSearchParams().get("scan") === "1";
  const selectedStoreId = useSelectedStoreId();
  const storeQuery = useMyStore(Boolean(selectedStoreId), selectedStoreId);
  const store = storeQuery.data;

  if (!store) {
    return <Skeleton className="h-96 w-full" />;
  }

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Add product</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          New products start out active and visible to shoppers immediately.
        </p>
      </div>
      <ProductForm
        storeId={store.id}
        storeType={store.storeType}
        storeDeliveryMode={store.deliverySettings?.mode}
        autoScan={autoScan}
        onSuccess={() => router.push(ROUTES.sellerProducts)}
      />
    </div>
  );
}

export default function NewSellerProductPage() {
  return (
    <Suspense fallback={<Skeleton className="h-96 w-full" />}>
      <NewSellerProductContent />
    </Suspense>
  );
}
