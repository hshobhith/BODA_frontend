"use client";

import { useParams, useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ROUTES } from "@/constants/routes";
import { ProductForm } from "@/features/seller/components/product-form";
import { useMyStore, useSelectedStoreId, useSellerProduct } from "@/features/seller/hooks";

export default function EditSellerProductPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const selectedStoreId = useSelectedStoreId();
  const storeQuery = useMyStore(Boolean(selectedStoreId), selectedStoreId);
  const productQuery = useSellerProduct(params.id);

  if (storeQuery.isLoading || productQuery.isLoading) {
    return <Skeleton className="h-96 w-full" />;
  }

  const store = storeQuery.data;
  const product = productQuery.data;

  if (!store || !product) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-center">
        <h1 className="text-xl font-semibold text-foreground">Product not found</h1>
        <Button onClick={() => router.push(ROUTES.sellerProducts)}>Back to products</Button>
      </div>
    );
  }

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Edit product</h1>
        <p className="mt-1 text-sm text-muted-foreground">{product.name}</p>
      </div>
      <ProductForm
        storeId={store.id}
        storeType={product.store?.storeType ?? store.storeType}
        storeDeliveryMode={store.deliverySettings?.mode}
        product={product}
        onSuccess={() => router.push(ROUTES.sellerProducts)}
      />
    </div>
  );
}
