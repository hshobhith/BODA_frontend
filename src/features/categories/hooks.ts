"use client";

import { useQuery } from "@tanstack/react-query";

import { categoriesApi, type ListCategoriesParams } from "./api";

/** React Query cache keys for category data. */
export const categoryKeys = {
  all: ["categories"] as const,
  tree: () => [...categoryKeys.all, "tree"] as const,
  list: (params?: ListCategoriesParams) => [...categoryKeys.all, "list", params ?? {}] as const,
};

// Categories change rarely — cache them longer than the app default.
const CATEGORY_STALE_TIME_MS = 5 * 60_000;

export function useCategoryTree() {
  return useQuery({
    queryKey: categoryKeys.tree(),
    queryFn: () => categoriesApi.getTree(),
    staleTime: CATEGORY_STALE_TIME_MS,
  });
}

export function useCategories(params?: ListCategoriesParams) {
  return useQuery({
    queryKey: categoryKeys.list(params),
    queryFn: () => categoriesApi.list(params),
    staleTime: CATEGORY_STALE_TIME_MS,
  });
}
