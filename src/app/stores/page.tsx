import type { Metadata } from "next";
import { Suspense } from "react";

import { StoreCardSkeleton } from "@/components/shared/store-card-skeleton";
import { StoresView } from "./stores-view";

export const metadata: Metadata = {
  title: "Stores",
  description: "Search and browse stores delivering near you.",
};

function StoresPageFallback() {
  return (
    <div className="mx-auto grid w-full max-w-7xl grid-cols-2 gap-4 px-4 py-8 sm:grid-cols-3 sm:px-6 lg:grid-cols-4 lg:px-8">
      {Array.from({ length: 8 }).map((_, i) => (
        <StoreCardSkeleton key={i} />
      ))}
    </div>
  );
}

export default function StoresPage() {
  // StoresView reads `?q=`/`?page=` via useSearchParams, so it needs a
  // Suspense boundary to allow static prerendering of the rest of the page.
  return (
    <Suspense fallback={<StoresPageFallback />}>
      <StoresView />
    </Suspense>
  );
}
