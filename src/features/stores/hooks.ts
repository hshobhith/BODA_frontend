"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { storesApi, type NearbyStoresParams, type SearchStoresParams } from "./api";

/** React Query cache keys for store data. */
export const storeKeys = {
  all: ["stores"] as const,
  nearby: (params: NearbyStoresParams) => [...storeKeys.all, "nearby", params] as const,
  search: (params: SearchStoresParams) => [...storeKeys.all, "search", params] as const,
  detail: (idOrSlug: string) => [...storeKeys.all, "detail", idOrSlug] as const,
};

export function useNearbyStores(params: NearbyStoresParams, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: storeKeys.nearby(params),
    queryFn: () => storesApi.getNearby(params),
    enabled: options?.enabled ?? (Number.isFinite(params.lat) && Number.isFinite(params.lng)),
    placeholderData: keepPreviousData,
  });
}

export function useSearchStores(params: SearchStoresParams) {
  return useQuery({
    queryKey: storeKeys.search(params),
    queryFn: () => storesApi.search(params),
    enabled: params.q.trim().length > 0,
    placeholderData: keepPreviousData,
  });
}

export function useStore(idOrSlug: string) {
  return useQuery({
    queryKey: storeKeys.detail(idOrSlug),
    queryFn: () => storesApi.getByIdOrSlug(idOrSlug),
    enabled: idOrSlug.length > 0,
  });
}
