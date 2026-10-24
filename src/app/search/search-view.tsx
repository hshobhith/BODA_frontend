"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { SearchX } from "lucide-react";

import { ProductCardSkeleton } from "@/components/shared/product-card-skeleton";
import { StoreCardSkeleton } from "@/components/shared/store-card-skeleton";
import { Button } from "@/components/ui/button";
import { BROWSE_RADIUS_KM } from "@/constants/config";
import { ROUTES } from "@/constants/routes";
import { ProductCard } from "@/features/products/components/product-card";
import { useNearbyProducts } from "@/features/products/hooks";
import { StoreCard } from "@/features/stores/components/store-card";
import { useSearchStores } from "@/features/stores/hooks";
import { useGeolocation } from "@/hooks/use-geolocation";

const PREVIEW_LIMIT = 8;

/**
 * Client view for `/search`.
 *
 * Design decision: `/search?q=...` is a combined stores + products results
 * page (rather than a thin redirect to `/products`) since a global header
 * search realistically needs to answer "is this a store I'm looking for, or
 * a product?" at once. It shows a preview grid of each, with a "view all"
 * link into the dedicated `/stores` or `/products` browse page (which
 * supports full filtering/pagination) for anyone who wants to dig in
 * further.
 */
export function SearchView() {
  const searchParams = useSearchParams();
  const q = searchParams.get("q")?.trim() ?? "";

  const stores = useSearchStores({ q, page: 1, limit: PREVIEW_LIMIT });
  const geolocation = useGeolocation();
  const products = useNearbyProducts(
    { search: q || undefined, page: 1, limit: PREVIEW_LIMIT },
    geolocation,
    BROWSE_RADIUS_KM
  );

  if (!q) {
    return (
      <div className="mx-auto flex w-full max-w-7xl flex-col items-center gap-2 px-4 py-16 text-center">
        <SearchX className="size-6 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          Enter a search term to find stores and products.
        </p>
      </div>
    );
  }

  const storeResults = stores.data?.data ?? [];
  const productResults = products.data?.data ?? [];
  const isLoading = stores.isLoading || products.isPending;
  const noResults =
    !isLoading && storeResults.length === 0 && productResults.length === 0;

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold tracking-tight text-foreground">
        Search results for &quot;{q}&quot;
      </h1>

      {noResults && (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-border py-16 text-center">
          <SearchX className="size-6 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            No stores or products matched &quot;{q}&quot;.
          </p>
        </div>
      )}

      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Stores</h2>
          {storeResults.length > 0 && (
            <Button asChild variant="ghost" size="sm">
              <Link href={`${ROUTES.stores}?q=${encodeURIComponent(q)}`}>View all</Link>
            </Button>
          )}
        </div>
        {stores.isLoading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <StoreCardSkeleton key={i} />
            ))}
          </div>
        ) : storeResults.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {storeResults.map((store) => (
              <StoreCard key={store.id} store={store} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No matching stores.</p>
        )}
      </section>

      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Products</h2>
          {productResults.length > 0 && (
            <Button asChild variant="ghost" size="sm">
              <Link href={`${ROUTES.products}?search=${encodeURIComponent(q)}`}>View all</Link>
            </Button>
          )}
        </div>
        {products.isPending ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : productResults.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {productResults.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            {geolocation.status === "success"
              ? "No matching products from stores near you."
              : "No matching products."}
          </p>
        )}
      </section>
    </div>
  );
}
