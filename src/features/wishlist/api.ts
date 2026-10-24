import { apiClient } from "@/services/api-client";
import type { PaginatedResponse } from "@/types/api";
import type { WishlistCheckResponse, WishlistItem, WishlistTargetType } from "@/types/wishlist";

export interface ListWishlistParams {
  targetType?: WishlistTargetType;
  page?: number;
  limit?: number;
}

export interface WishlistTogglePayload {
  targetType: WishlistTargetType;
  targetId: string;
}

/**
 * Thin transport layer for the (auth-required) wishlist endpoints. React
 * Query hooks wrapping these live in `./hooks.ts`.
 */
export const wishlistApi = {
  list: (params?: ListWishlistParams) =>
    apiClient.get<PaginatedResponse<WishlistItem>>("/wishlist", { params }).then((r) => r.data),

  add: (payload: WishlistTogglePayload) =>
    apiClient.post<WishlistItem>("/wishlist", payload).then((r) => r.data),

  remove: (targetType: WishlistTargetType, targetId: string) =>
    apiClient.delete<void>(`/wishlist/${targetType}/${targetId}`).then((r) => r.data),

  check: (targetType: WishlistTargetType, targetId: string) =>
    apiClient
      .get<WishlistCheckResponse>(`/wishlist/check/${targetType}/${targetId}`)
      .then((r) => r.data),
};
