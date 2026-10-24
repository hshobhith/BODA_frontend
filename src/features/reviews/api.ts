import { apiClient } from "@/services/api-client";
import type { PaginatedResponse } from "@/types/api";
import type { CreateReviewPayload, Review, ReviewTargetType } from "@/types/review";

export interface ListReviewsParams {
  page?: number;
  limit?: number;
}

/**
 * Thin transport layer for the review endpoint. Reviews target either a
 * product or a store via the same `/reviews/target/:targetType/:targetId`
 * route, so this is shared between the `products` and `stores` features
 * rather than living under either one.
 */
export const reviewsApi = {
  getForTarget: (targetType: ReviewTargetType, targetId: string, params?: ListReviewsParams) =>
    apiClient
      .get<PaginatedResponse<Review>>(`/reviews/target/${targetType}/${targetId}`, { params })
      .then((r) => r.data),

  create: (payload: CreateReviewPayload) =>
    apiClient.post<Review>("/reviews", payload).then((r) => r.data),

  /** Seller-facing feed: a store's own reviews plus reviews on its products. */
  getForSeller: (storeId: string, params?: ListReviewsParams) =>
    apiClient
      .get<PaginatedResponse<Review>>(`/reviews/store/${storeId}/mine`, { params })
      .then((r) => r.data),

  reply: (reviewId: string, reply: string) =>
    apiClient.patch<Review>(`/reviews/${reviewId}/reply`, { reply }).then((r) => r.data),

  removeReply: (reviewId: string) =>
    apiClient.delete<Review>(`/reviews/${reviewId}/reply`).then((r) => r.data),
};
