"use client";

import { useRouter, useSearchParams } from "next/navigation";

import { PaginationControls } from "@/components/shared/pagination-controls";
import { ProductCardSkeleton } from "@/components/shared/product-card-skeleton";
import { CategorySidebarNav } from "@/features/categories/components/category-nav";
import { useCategoryTree } from "@/features/categories/hooks";
import { ProductCard } from "@/features/products/components/product-card";
import { ProductFilters } from "@/features/products/components/product-filters";
import { useNearbyProducts } from "@/features/products/hooks";
import { NoStoresNearby } from "@/features/stores/components/no-stores-nearby";
import { BROWSE_RADIUS_KM } from "@/constants/config";
import { ROUTES } from "@/constants/routes";
import { useGeolocation } from "@/hooks/use-geolocation";

const PAGE_SIZE = 20;

/** Client view for `/products`: sidebar filters + result grid + pagination. */
export function ProductsView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: categoryTree } = useCategoryTree();
  const geolocation = useGeolocation();

  const search = searchParams.get("search") ?? undefined;
  const categoryId = searchParams.get("categoryId") ?? undefined;
  const brand = searchParams.get("brand") ?? undefined;
  const minPrice = searchParams.get("minPrice");
  const maxPrice = searchParams.get("maxPrice");
  const sortBy = searchParams.get("sortBy") ?? undefined;
  const page = Math.max(1, Number(searchParams.get("page")) || 1);

  const products = useNearbyProducts(
    {
      search,
      categoryId,
      brand,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      sortBy,
      page,
      limit: PAGE_SIZE,
    },
    geolocation,
    BROWSE_RADIUS_KM
  );
  const isNearby = geolocation.status === "success";
  const hasFilters = Boolean(search || categoryId || brand || minPrice || maxPrice);

  function goToPage(nextPage: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(nextPage));
    router.push(`${ROUTES.products}?${params.toString()}`);
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          {search ? `Results for "${search}"` : "All products"}
        </h1>
        {products.data && (
          <p className="mt-1 text-sm text-muted-foreground">
            {products.data.meta.total.toLocaleString()} products found
            {isNearby && " near you"}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[240px_1fr]">
        <aside className="flex flex-col gap-6">
          {categoryTree && categoryTree.length > 0 && (
            <CategorySidebarNav categories={categoryTree} activeCategoryId={categoryId} />
          )}
          <ProductFilters />
        </aside>

        <div className="flex flex-col gap-4">
          {products.isPending ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: PAGE_SIZE }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : products.isError ? (
            <p className="text-sm text-destructive">Couldn&apos;t load products. Please try again.</p>
          ) : products.data && products.data.data.length > 0 ? (
            <>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
                {products.data.data.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
              <PaginationControls
                page={page}
                totalPages={products.data.meta.totalPages}
                onPageChange={goToPage}
                className="pt-2"
              />
            </>
          ) : isNearby && !hasFilters ? (
            <NoStoresNearby title="No products available in your area yet" />
          ) : (
            <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-border py-16 text-center">
              <p className="text-sm text-muted-foreground">
                No products matched your filters. Try adjusting them.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
