"use client";

import { useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { MapPin, RefreshCw, Search as SearchIcon } from "lucide-react";

import { PaginationControls } from "@/components/shared/pagination-controls";
import { StoreCardSkeleton } from "@/components/shared/store-card-skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BROWSE_RADIUS_KM } from "@/constants/config";
import { ROUTES } from "@/constants/routes";
import { NoStoresNearby } from "@/features/stores/components/no-stores-nearby";
import { StoreCard } from "@/features/stores/components/store-card";
import { useNearbyStores, useSearchStores } from "@/features/stores/hooks";
import { useGeolocation } from "@/hooks/use-geolocation";
import { STORE_TYPE_META, type StoreType } from "@/types/store";

const PAGE_SIZE = 12;

const TYPE_FILTERS: { value: StoreType | null; label: string }[] = [
  { value: null, label: "All" },
  { value: "retail", label: "Shops" },
  { value: "restaurant", label: "Restaurants" },
  { value: "pharmacy", label: "Pharmacies" },
];

function parseStoreType(value: string | null): StoreType | undefined {
  return value && value in STORE_TYPE_META ? (value as StoreType) : undefined;
}

/** Client view for `/stores`: search bar + results grid + pagination. */
export function StoresView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const q = searchParams.get("q") ?? "";
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const storeType = parseStoreType(searchParams.get("type"));

  const [queryInput, setQueryInput] = useState(q);
  const geolocation = useGeolocation();

  const searchResults = useSearchStores({ q, storeType, page, limit: PAGE_SIZE });
  const nearbyResults = useNearbyStores(
    {
      lat: geolocation.lat ?? 0,
      lng: geolocation.lng ?? 0,
      radiusKm: BROWSE_RADIUS_KM,
      storeType,
      page,
      limit: PAGE_SIZE,
    },
    { enabled: !q && geolocation.status === "success" }
  );

  const isSearching = q.length > 0;
  const activeResult = isSearching ? searchResults : nearbyResults;
  const showLocationPrompt =
    !isSearching && (geolocation.status === "error" || geolocation.status === "unsupported");

  function updateParams(updates: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (value === null || value === "") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    }
    router.push(`${ROUTES.stores}?${params.toString()}`);
  }

  function handleSearchSubmit(e: FormEvent) {
    e.preventDefault();
    updateParams({ q: queryInput.trim() || null, page: null });
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Stores</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Search for a store, or browse what&apos;s delivering near you.
        </p>
      </div>

      <form onSubmit={handleSearchSubmit} className="relative max-w-xl">
        <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          value={queryInput}
          onChange={(e) => setQueryInput(e.target.value)}
          placeholder="Search stores by name"
          className="h-10 rounded-full pl-9"
          aria-label="Search stores"
        />
      </form>

      <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by store type">
        {TYPE_FILTERS.map((filter) => {
          const active = (filter.value ?? undefined) === storeType;
          return (
            <Button
              key={filter.label}
              type="button"
              size="sm"
              variant={active ? "default" : "outline"}
              className="rounded-full"
              aria-pressed={active}
              onClick={() => updateParams({ type: filter.value, page: null })}
            >
              {filter.label}
            </Button>
          );
        })}
      </div>

      {showLocationPrompt ? (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-border bg-muted/40 py-10 text-center">
          <MapPin className="size-6 text-muted-foreground" />
          <p className="max-w-sm text-sm text-muted-foreground">
            Enable location access to see stores near you, or search by name above.
          </p>
          <Button size="sm" variant="outline" onClick={geolocation.request} className="gap-1.5">
            <RefreshCw className="size-3.5" />
            Enable location
          </Button>
        </div>
      ) : (!isSearching && geolocation.status === "idle") ||
        (!isSearching && geolocation.status === "loading") ||
        activeResult.isLoading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: PAGE_SIZE }).map((_, i) => (
            <StoreCardSkeleton key={i} />
          ))}
        </div>
      ) : activeResult.isError ? (
        <p className="text-sm text-destructive">Couldn&apos;t load stores. Please try again.</p>
      ) : activeResult.data && activeResult.data.data.length > 0 ? (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {activeResult.data.data.map((store) => (
              <StoreCard key={store.id} store={store} />
            ))}
          </div>
          <PaginationControls
            page={page}
            totalPages={activeResult.data.meta.totalPages}
            onPageChange={(nextPage) => updateParams({ page: String(nextPage) })}
            className="pt-2"
          />
        </>
      ) : isSearching ? (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-border py-12 text-center">
          <p className="text-sm text-muted-foreground">No stores found for &quot;{q}&quot;.</p>
        </div>
      ) : storeType ? (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-border py-12 text-center">
          <p className="text-sm text-muted-foreground">
            No {TYPE_FILTERS.find((filter) => filter.value === storeType)?.label.toLowerCase()} found
            near you.
          </p>
        </div>
      ) : (
        <NoStoresNearby />
      )}
    </div>
  );
}
