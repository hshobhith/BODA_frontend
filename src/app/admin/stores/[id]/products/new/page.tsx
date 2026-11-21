"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import { ROUTES } from "@/constants/routes";
import { ProductForm } from "@/features/seller/components/product-form";
import { useMyStore } from "@/features/seller/hooks";

/** Admin adds a product to a store on its seller's behalf — the seller's own add-product form. */
function AdminNewProductContent() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const autoScan = useSearchParams().get("scan") === "1";
  const storeQuery = useMyStore(true, id);
  const store = storeQuery.data;
  const backHref = `${ROUTES.adminStoreManage(id)}?tab=products`;

  if (!store) {
    return <Skeleton className="h-96 w-full" />;
  }

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <div className="flex flex-col gap-3">
        <Link
          href={backHref}
          className="flex w-fit items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          {store.name}
        </Link>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Add product</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Added to {store.name}. New products are active and visible to shoppers once the store is open.
          </p>
        </div>
      </div>
      <ProductForm
        storeId={store.id}
        storeType={store.storeType}
        storeDeliveryMode={store.deliverySettings?.mode}
        autoScan={autoScan}
        editHref={(productId) => ROUTES.adminStoreProductEdit(store.id, productId)}
        onSuccess={() => router.push(backHref)}
      />
    </div>
  );
}

export default function AdminNewProductPage() {
  return (
    <Suspense fallback={<Skeleton className="h-96 w-full" />}>
      <AdminNewProductContent />
    </Suspense>
  );
}
