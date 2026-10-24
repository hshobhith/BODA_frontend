"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { reviewsApi, type ListReviewsParams } from "./api";
import type { ApiError } from "@/types/api";
import type { CreateReviewPayload, ReviewTargetType } from "@/types/review";
import { productKeys } from "@/features/products/hooks";
import { storeKeys } from "@/features/stores/hooks";

export const reviewKeys = {
  all: ["reviews"] as const,
  target: (targetType: ReviewTargetType, targetId: string, params?: ListReviewsParams) =>
    [...reviewKeys.all, targetType, targetId, params ?? {}] as const,
  seller: (storeId: string, params?: ListReviewsParams) =>
    [...reviewKeys.all, "seller", storeId, params ?? {}] as const,
};

function errorMessage(error: unknown, fallback: string): string {
  const apiError = error as ApiError | undefined;
  return apiError?.message || fallback;
}

export function useReviews(
  targetType: ReviewTargetType,
  targetId: string | undefined,
  params?: ListReviewsParams
) {
  return useQuery({
    queryKey: reviewKeys.target(targetType, targetId ?? "", params),
    queryFn: () => reviewsApi.getForTarget(targetType, targetId as string, params),
    enabled: Boolean(targetId),
    placeholderData: keepPreviousData,
  });
}

/** Reviews on one of the seller's stores, including reviews on its products. */
export function useSellerReviews(storeId: string | undefined, params?: ListReviewsParams) {
  return useQuery({
    queryKey: reviewKeys.seller(storeId ?? "", params),
    queryFn: () => reviewsApi.getForSeller(storeId as string, params),
    enabled: Boolean(storeId),
    placeholderData: keepPreviousData,
  });
}

export function useCreateReview(targetType: ReviewTargetType, targetId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Omit<CreateReviewPayload, "targetType" | "targetId">) =>
      reviewsApi.create({ targetType, targetId: targetId as string, ...payload }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reviewKeys.target(targetType, targetId ?? "") });
      // The target's avgRating/reviewCount live on the store/product entity
      // itself, not the review, so its detail query needs invalidating too.
      queryClient.invalidateQueries({
        queryKey: targetType === "store" ? storeKeys.all : productKeys.all,
      });
      toast.success("Review posted. Thanks for sharing!");
    },
    onError: (error) => {
      const apiError = error as unknown as ApiError | undefined;
      if (apiError?.statusCode === 409) {
        toast.error("You've already reviewed this — edit your existing review instead.");
        return;
      }
      toast.error(errorMessage(error, "Could not post your review."));
    },
  });
}

export function useReplyToReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ reviewId, reply }: { reviewId: string; reply: string }) =>
      reviewsApi.reply(reviewId, reply),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reviewKeys.all });
      toast.success("Reply posted.");
    },
    onError: (error) => toast.error(errorMessage(error, "Could not post your reply.")),
  });
}

export function useRemoveReply() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (reviewId: string) => reviewsApi.removeReply(reviewId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reviewKeys.all });
      toast.success("Reply removed.");
    },
    onError: (error) => toast.error(errorMessage(error, "Could not remove your reply.")),
  });
}
