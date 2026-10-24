import type { Metadata } from "next";
import { Suspense } from "react";

import { ProductCardSkeleton } from "@/components/shared/product-card-skeleton";
import { ProductsView } from "./products-view";

export const metadata: Metadata = {
  title: "Products",
  description: "Browse and filter products from stores near you.",
};

function ProductsPageFallback() {
  return (
    <div className="mx-auto grid w-full max-w-7xl grid-cols-2 gap-4 px-4 py-8 sm:grid-cols-3 sm:px-6 lg:grid-cols-4 lg:px-8">
      {Array.from({ length: 12 }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

export default function ProductsPage() {
  // ProductsView reads filters/pagination via useSearchParams, so it needs a
  // Suspense boundary to allow static prerendering of the rest of the page.
  return (
    <Suspense fallback={<ProductsPageFallback />}>
      <ProductsView />
    </Suspense>
  );
}
