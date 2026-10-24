import { apiClient } from "@/services/api-client";
import type { PaginatedResponse } from "@/types/api";
import type { Category } from "@/types/category";

export interface ListCategoriesParams {
  page?: number;
  limit?: number;
}

/**
 * Thin transport layer for category endpoints. React Query hooks wrapping
 * these live in `./hooks.ts`.
 */
export const categoriesApi = {
  getTree: () => apiClient.get<Category[]>("/categories/tree").then((r) => r.data),

  list: (params?: ListCategoriesParams) =>
    apiClient
      .get<PaginatedResponse<Category>>("/categories", { params })
      .then((r) => r.data),
};
