import { apiClient } from "@/services/api-client";
import type { PaginatedResponse } from "@/types/api";
import type { Store, StoreType } from "@/types/store";

export interface NearbyStoresParams {
  lat: number;
  lng: number;
  radiusKm?: number;
  storeType?: StoreType;
  page?: number;
  limit?: number;
}

export interface SearchStoresParams {
  q: string;
  storeType?: StoreType;
  page?: number;
  limit?: number;
}

/**
 * Thin transport layer for store endpoints. React Query hooks wrapping
 * these live in `./hooks.ts`.
 */
export const storesApi = {
  getNearby: (params: NearbyStoresParams) =>
    apiClient.get<PaginatedResponse<Store>>("/stores/nearby", { params }).then((r) => r.data),

  search: (params: SearchStoresParams) =>
    apiClient.get<PaginatedResponse<Store>>("/stores/search", { params }).then((r) => r.data),

  getByIdOrSlug: (idOrSlug: string) =>
    apiClient.get<Store>(`/stores/${encodeURIComponent(idOrSlug)}`).then((r) => r.data),
};
