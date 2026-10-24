"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import type { GeolocationState } from "@/hooks/use-geolocation";

import {
  productsApi,
  type ProductListParams,
  type StoreProductListParams,
} from "./api";

export const productKeys = {
  all: ["products"] as const,
  list: (params?: ProductListParams) => [...productKeys.all, "list", params ?? {}] as const,
  byStore: (storeId: string, params?: StoreProductListParams) =>
    [...productKeys.all, "store", storeId, params ?? {}] as const,
  detail: (idOrSlug: string) => [...productKeys.all, "detail", idOrSlug] as const,
};

export function useProducts(filters?: ProductListParams, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: productKeys.list(filters),
    queryFn: () => productsApi.list(filters),
    enabled: options?.enabled ?? true,
    placeholderData: keepPreviousData,
  });
}

/**
 * Products from stores within `radiusKm` of the shopper, so a listing never
 * shows a store's products where the store itself isn't listed. Waits for the
 * location lookup to settle (render `isPending` as loading); without a
 * location (denied or unsupported) it lists every store's products.
 */
export function useNearbyProducts(
  filters: ProductListParams,
  location: GeolocationState,
  radiusKm: number
) {
  const settled = location.status !== "idle" && location.status !== "loading";
  const near =
    location.status === "success" && location.lat !== null && location.lng !== null
      ? { lat: location.lat, lng: location.lng, radiusKm }
      : {};
  return useProducts({ ...filters, ...near }, { enabled: settled });
}

export function useStoreProducts(storeId: string | undefined, params?: StoreProductListParams) {
  return useQuery({
    queryKey: productKeys.byStore(storeId ?? "", params),
    queryFn: () => productsApi.getByStore(storeId as string, params),
    enabled: Boolean(storeId),
    placeholderData: keepPreviousData,
  });
}

export function useProduct(idOrSlug: string | undefined) {
  return useQuery({
    queryKey: productKeys.detail(idOrSlug ?? ""),
    queryFn: () => productsApi.getByIdOrSlug(idOrSlug as string),
    enabled: Boolean(idOrSlug),
  });
}
