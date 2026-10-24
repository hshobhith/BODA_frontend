import { apiClient } from "@/services/api-client";
import type { PaginatedResponse } from "@/types/api";
import type { FoodType, Product } from "@/types/product";

export interface ProductListParams {
  search?: string;
  categoryId?: string;
  storeId?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: string;
  page?: number;
  limit?: number;
  /** Shopper's location — with `lng`, only stores within `radiusKm` are listed. */
  lat?: number;
  lng?: number;
  radiusKm?: number;
}

export interface StoreProductListParams {
  page?: number;
  limit?: number;
  /** Restaurant menus, e.g. veg only. */
  foodType?: FoodType;
}

/**
 * Thin transport layer for product endpoints. React Query hooks wrapping
 * these live in `./hooks.ts`.
 */
export const productsApi = {
  list: (params?: ProductListParams) =>
    apiClient.get<PaginatedResponse<Product>>("/products", { params }).then((r) => r.data),

  getByStore: (storeId: string, params?: StoreProductListParams) =>
    apiClient
      .get<PaginatedResponse<Product>>(`/products/store/${storeId}`, { params })
      .then((r) => r.data),

  getByIdOrSlug: (idOrSlug: string) =>
    apiClient.get<Product>(`/products/${encodeURIComponent(idOrSlug)}`).then((r) => r.data),
};
