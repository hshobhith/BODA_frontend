"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Bike, Clock3, ShoppingBag, Truck } from "lucide-react";

import { PaginationControls } from "@/components/shared/pagination-controls";
import { ProductCardSkeleton } from "@/components/shared/product-card-skeleton";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { ROUTES } from "@/constants/routes";
import { FoodTypeMark } from "@/features/products/components/product-badges";
import { ProductCard } from "@/features/products/components/product-card";
import { useStoreProducts } from "@/features/products/hooks";
import { StoreHeader } from "@/features/stores/components/store-header";
import { StoreHoursPanel } from "@/features/stores/components/store-hours-panel";
import { StoreReviews } from "@/features/stores/components/store-reviews";
import { useStore } from "@/features/stores/hooks";
import type { StoreDeliverySettings } from "@/types/store";

const PRODUCTS_PAGE_SIZE = 12;

function DeliveryInfoPanel({ settings }: { settings: StoreDeliverySettings }) {
  const rows = [
    {
      icon: settings.mode === "pickup_only" ? ShoppingBag : Truck,
      label: "Delivery mode",
      value:
        settings.mode === "both"
          ? "Delivery & pickup"
          : settings.mode === "pickup_only"
            ? "Pickup only"
            : "Delivery only",
    },
    settings.deliveryRadiusKm != null && {
      icon: Bike,
      label: "Delivery radius",
      value: `${settings.deliveryRadiusKm} km`,
    },
    settings.deliveryFee != null && {
      icon: Truck,
      label: "Delivery fee",
      value: settings.deliveryFee > 0 ? `₹${settings.deliveryFee}` : "Free",
    },
    settings.freeDeliveryThreshold != null && {
      icon: Truck,
      label: "Free delivery over",
      value: `₹${settings.freeDeliveryThreshold}`,
    },
    settings.deliverySpeed && {
      icon: Clock3,
      label: "Delivery speed",
      value: settings.deliverySpeed,
    },
  ].filter(Boolean) as { icon: typeof Truck; label: string; value: string }[];

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border p-4">
      <div className="mb-1 text-sm font-semibold text-foreground">Delivery</div>
      <dl className="flex flex-col gap-2">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center justify-between gap-3 text-sm">
            <dt className="flex items-center gap-1.5 text-muted-foreground">
              <row.icon className="size-4" />
              {row.label}
            </dt>
            <dd className="font-medium text-foreground capitalize">{row.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function StoreDetailSkeleton() {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
      <Skeleton className="h-32 w-full rounded-lg sm:h-48" />
      <div className="flex items-end gap-4">
        <Skeleton className="-mt-10 size-20 rounded-xl sm:-mt-12 sm:size-24" />
        <div className="flex flex-1 flex-col gap-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
    </div>
  );
}

export default function StoreDetailPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const [productsPage, setProductsPage] = useState(1);
  const [vegOnly, setVegOnly] = useState(false);

  const storeQuery = useStore(slug);
  const productsQuery = useStoreProducts(storeQuery.data?.id, {
    page: productsPage,
    limit: PRODUCTS_PAGE_SIZE,
    foodType: vegOnly ? "veg" : undefined,
  });

  if (storeQuery.isLoading) {
    return <StoreDetailSkeleton />;
  }

  if (storeQuery.isError || !storeQuery.data) {
    return (
      <div className="mx-auto flex w-full max-w-7xl flex-col items-center gap-3 px-4 py-16 text-center">
        <h1 className="text-xl font-semibold text-foreground">Store not found</h1>
        <p className="text-sm text-muted-foreground">
          This store may have been removed or the link is incorrect.
        </p>
        <Button asChild size="sm" className="store-mode:hidden!">
          <Link href={ROUTES.stores}>Browse all stores</Link>
        </Button>
      </div>
    );
  }

  const store = storeQuery.data;

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
      <StoreHeader store={store} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr]">
        <aside className="flex flex-col gap-4">
          {store.deliverySettings && <DeliveryInfoPanel settings={store.deliverySettings} />}
          {store.workingHours && store.workingHours.length > 0 && (
            <StoreHoursPanel workingHours={store.workingHours} />
          )}
        </aside>

        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-foreground">
              {store.storeType === "restaurant" ? "Menu" : "Products"}
            </h2>
            {store.storeType === "restaurant" && (
              <div className="flex items-center gap-2">
                <Switch
                  id="veg-only"
                  checked={vegOnly}
                  onCheckedChange={(checked) => {
                    setVegOnly(checked);
                    setProductsPage(1);
                  }}
                />
                <Label htmlFor="veg-only" className="flex items-center gap-1.5 font-normal">
                  <FoodTypeMark foodType="veg" />
                  Veg only
                </Label>
              </div>
            )}
          </div>
          {productsQuery.isLoading ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : productsQuery.isError ? (
            <p className="text-sm text-destructive">Couldn&apos;t load products.</p>
          ) : productsQuery.data && productsQuery.data.data.length > 0 ? (
            <>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                {productsQuery.data.data.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
              <PaginationControls
                page={productsPage}
                totalPages={productsQuery.data.meta.totalPages}
                onPageChange={setProductsPage}
              />
            </>
          ) : (
            <Card className="items-center py-10 text-center text-sm text-muted-foreground">
              {vegOnly
                ? "No veg items on the menu right now."
                : "This store hasn't listed any products yet."}
            </Card>
          )}
        </div>
      </div>

      <StoreReviews storeId={store.id} avgRating={store.avgRating} reviewCount={store.reviewCount} />
    </div>
  );
}
