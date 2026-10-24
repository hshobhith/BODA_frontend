"use client";

import Link from "next/link";
import { Plus, ScanBarcode } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ROUTES } from "@/constants/routes";
import { ProductTable } from "@/features/seller/components/product-table";
import { useMyStore, useSelectedStoreId } from "@/features/seller/hooks";

export default function SellerProductsPage() {
  const selectedStoreId = useSelectedStoreId();
  const storeQuery = useMyStore(Boolean(selectedStoreId), selectedStoreId);
  const store = storeQuery.data;

  if (!store) {
    return <Skeleton className="h-96 w-full" />;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Products</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage what shoppers see when they browse {store.name}.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline">
            <Link href={`${ROUTES.sellerProductNew}?scan=1`}>
              <ScanBarcode className="size-4" />
              Scan barcode
            </Link>
          </Button>
          <Button asChild>
            <Link href={ROUTES.sellerProductNew}>
              <Plus className="size-4" />
              Add product
            </Link>
          </Button>
        </div>
      </div>

      <ProductTable storeId={store.id} />
    </div>
  );
}
