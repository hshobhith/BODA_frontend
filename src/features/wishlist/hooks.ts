"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { wishlistApi, type ListWishlistParams } from "./api";
import { useAuthStore } from "@/store/auth-store";
import type { ApiError } from "@/types/api";
import type { WishlistTargetType } from "@/types/wishlist";

function errorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && !("statusCode" in error)) {
    return error.message;
  }
  const apiError = error as ApiError | undefined;
  return apiError?.message || fallback;
}

export const wishlistKeys = {
  all: ["wishlist"] as const,
  list: (params?: ListWishlistParams) => [...wishlistKeys.all, "list", params ?? {}] as const,
  check: (targetType: WishlistTargetType, targetId: string) =>
    [...wishlistKeys.all, "check", targetType, targetId] as const,
};

export function useWishlist(params?: ListWishlistParams) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return useQuery({
    queryKey: wishlistKeys.list(params),
    queryFn: () => wishlistApi.list(params),
    enabled: isAuthenticated,
  });
}

/** Whether the current target is already wishlisted. No-ops (disabled) when signed out. */
export function useWishlistCheck(targetType: WishlistTargetType, targetId: string | undefined) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return useQuery({
    queryKey: wishlistKeys.check(targetType, targetId ?? ""),
    queryFn: () => wishlistApi.check(targetType, targetId as string),
    enabled: isAuthenticated && Boolean(targetId),
  });
}

/**
 * Adds or removes `targetId` from the wishlist depending on its current
 * state. Call `.mutate(currentlyWishlisted)` with the current boolean.
 *
 * Guards against unauthenticated use: components should check
 * `useAuthStore`'s `isAuthenticated` themselves and prompt a login instead of
 * calling `.mutate()` at all, but this also fails safe (toasts + no-ops) if
 * called anyway.
 */
export function useToggleWishlist(targetType: WishlistTargetType, targetId: string) {
  const queryClient = useQueryClient();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return useMutation({
    mutationFn: async (currentlyWishlisted: boolean) => {
      if (!isAuthenticated) {
        throw new Error("Please log in to save items to your wishlist.");
      }
      return currentlyWishlisted
        ? wishlistApi.remove(targetType, targetId)
        : wishlistApi.add({ targetType, targetId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: wishlistKeys.check(targetType, targetId) });
      queryClient.invalidateQueries({ queryKey: wishlistKeys.all });
    },
    onError: (error) => {
      toast.error(errorMessage(error, "Couldn't update your wishlist. Please try again."));
    },
  });
}
