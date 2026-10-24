"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCategoryTree } from "@/features/categories/hooks";
import { useDebounce } from "@/hooks/use-debounce";
import { ROUTES } from "@/constants/routes";
import type { Category } from "@/types/category";

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "rating", label: "Top Rated" },
] as const;

const ALL_CATEGORIES_VALUE = "all";

function flattenCategories(categories: Category[]): { id: string; label: string }[] {
  const result: { id: string; label: string }[] = [];
  for (const category of categories) {
    result.push({ id: category.id, label: category.name });
    for (const child of category.children) {
      result.push({ id: child.id, label: `— ${child.name}` });
    }
  }
  return result;
}

/**
 * Category / brand / price / sort controls for the product browse page.
 * Reads and writes URL search params directly (rather than lifting state to
 * the parent) so filtered views stay shareable/bookmarkable links.
 */
export function ProductFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: categoryTree } = useCategoryTree();
  const categoryOptions = flattenCategories(categoryTree ?? []);

  const categoryId = searchParams.get("categoryId") ?? ALL_CATEGORIES_VALUE;
  const sortBy = searchParams.get("sortBy") ?? "newest";

  const [brand, setBrand] = useState(searchParams.get("brand") ?? "");
  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") ?? "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") ?? "");

  const debouncedBrand = useDebounce(brand, 400);
  const debouncedMinPrice = useDebounce(minPrice, 400);
  const debouncedMaxPrice = useDebounce(maxPrice, 400);

  function updateParams(updates: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (value === null || value === "" || value === ALL_CATEGORIES_VALUE) {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    }
    // Any filter change should reset pagination.
    params.delete("page");
    router.push(`${ROUTES.products}?${params.toString()}`);
  }

  // Sync debounced text/number filters to the URL once the user pauses typing.
  useEffect(() => {
    if (debouncedBrand !== (searchParams.get("brand") ?? "")) {
      updateParams({ brand: debouncedBrand || null });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedBrand]);

  useEffect(() => {
    if (debouncedMinPrice !== (searchParams.get("minPrice") ?? "")) {
      updateParams({ minPrice: debouncedMinPrice || null });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedMinPrice]);

  useEffect(() => {
    if (debouncedMaxPrice !== (searchParams.get("maxPrice") ?? "")) {
      updateParams({ maxPrice: debouncedMaxPrice || null });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedMaxPrice]);

  const hasActiveFilters =
    searchParams.has("categoryId") ||
    searchParams.has("brand") ||
    searchParams.has("minPrice") ||
    searchParams.has("maxPrice") ||
    (searchParams.has("sortBy") && searchParams.get("sortBy") !== "newest");

  function clearFilters() {
    setBrand("");
    setMinPrice("");
    setMaxPrice("");
    const params = new URLSearchParams(searchParams.toString());
    const search = params.get("search");
    router.push(search ? `${ROUTES.products}?search=${encodeURIComponent(search)}` : ROUTES.products);
  }

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-border bg-card p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-foreground">Filters</h2>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" className="h-7 gap-1 px-2 text-xs" onClick={clearFilters}>
            <X className="size-3.5" />
            Clear
          </Button>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="filter-category">Category</Label>
        <Select
          value={categoryId}
          onValueChange={(value) => updateParams({ categoryId: value })}
        >
          <SelectTrigger id="filter-category" className="w-full">
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_CATEGORIES_VALUE}>All categories</SelectItem>
            {categoryOptions.map((option) => (
              <SelectItem key={option.id} value={option.id}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="filter-brand">Brand</Label>
        <Input
          id="filter-brand"
          placeholder="e.g. Nestlé"
          value={brand}
          onChange={(e) => setBrand(e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label>Price range</Label>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            inputMode="decimal"
            min={0}
            placeholder="Min"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            aria-label="Minimum price"
          />
          <span className="text-muted-foreground">–</span>
          <Input
            type="number"
            inputMode="decimal"
            min={0}
            placeholder="Max"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            aria-label="Maximum price"
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="filter-sort">Sort by</Label>
        <Select value={sortBy} onValueChange={(value) => updateParams({ sortBy: value })}>
          <SelectTrigger id="filter-sort" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
