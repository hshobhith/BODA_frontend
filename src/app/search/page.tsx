import type { Metadata } from "next";
import { Suspense } from "react";

import { ProductCardSkeleton } from "@/components/shared/product-card-skeleton";
import { SearchView } from "./search-view";

export const metadata: Metadata = {
  title: "Search",
  description: "Search across stores and products on BODA.",
};

function SearchPageFallback() {
  return (
    <div className="mx-auto grid w-full max-w-7xl grid-cols-2 gap-4 px-4 py-8 sm:grid-cols-3 sm:px-6 lg:grid-cols-4 lg:px-8">
      {Array.from({ length: 8 }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

export default function SearchPage() {
  // SearchView reads `?q=` via useSearchParams, so it needs a Suspense
  // boundary to allow static prerendering of the rest of the page.
  return (
    <Suspense fallback={<SearchPageFallback />}>
      <SearchView />
    </Suspense>
  );
}
