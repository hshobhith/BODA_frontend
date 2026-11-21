"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ROUTES } from "@/constants/routes";
import { ProductForm } from "@/features/seller/components/product-form";
import { useMyStore, useSellerProduct } from "@/features/seller/hooks";

/** Admin edits a product of a store on its seller's behalf — the seller's own edit form. */
export default function AdminEditProductPage() {
  const { id, productId } = useParams<{ id: string; productId: string }>();
  const router = useRouter();
  const storeQuery = useMyStore(true, id);
  const productQuery = useSellerProduct(productId);
  const backHref = `${ROUTES.adminStoreManage(id)}?tab=products`;

  if (storeQuery.isLoading || productQuery.isLoading) {
    return <Skeleton className="h-96 w-full" />;
  }

  const store = storeQuery.data;
  const product = productQuery.data;

  // A product id from another store in the URL shouldn't be edited under this one.
  if (!store || !product || (product.store?.id && product.store.id !== store.id)) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-center">
        <h1 className="text-xl font-semibold text-foreground">Product not found</h1>
        <Button onClick={() => router.push(backHref)}>Back to products</Button>
      </div>
    );
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
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Edit product</h1>
          <p className="mt-1 text-sm text-muted-foreground">{product.name}</p>
        </div>
      </div>
      <ProductForm
        storeId={store.id}
        storeType={product.store?.storeType ?? store.storeType}
        storeDeliveryMode={store.deliverySettings?.mode}
        product={product}
        editHref={(otherId) => ROUTES.adminStoreProductEdit(store.id, otherId)}
        onSuccess={() => router.push(backHref)}
      />
    </div>
  );
}
