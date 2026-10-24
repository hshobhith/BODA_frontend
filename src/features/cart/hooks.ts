"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { cartApi } from "./api";
import { useAuthStore } from "@/store/auth-store";
import type { ApiError } from "@/types/api";
import type { AddToCartPayload } from "@/types/cart";

function errorMessage(error: unknown, fallback: string): string {
  const apiError = error as ApiError | undefined;
  return apiError?.message || fallback;
}

export const cartKeys = {
  all: ["cart"] as const,
  active: ["cart", "active"] as const,
  saved: ["cart", "saved"] as const,
  count: ["cart", "count"] as const,
};

export function useCart() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return useQuery({
    queryKey: cartKeys.active,
    queryFn: () => cartApi.getCart(),
    enabled: isAuthenticated,
  });
}

export function useSavedForLater() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return useQuery({
    queryKey: cartKeys.saved,
    queryFn: () => cartApi.getSavedForLater(),
    enabled: isAuthenticated,
  });
}

export function useCartCount() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return useQuery({
    queryKey: cartKeys.count,
    queryFn: () => cartApi.getCount(),
    enabled: isAuthenticated,
    staleTime: 10_000,
  });
}

function useInvalidateCart() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: cartKeys.all });
  };
}

export function useAddToCart() {
  const invalidate = useInvalidateCart();

  return useMutation({
    mutationFn: (payload: AddToCartPayload) => cartApi.addItem(payload),
    onSuccess: () => {
      invalidate();
      toast.success("Added to cart.");
    },
    onError: (error) => toast.error(errorMessage(error, "Could not add this item to your cart.")),
  });
}

export function useUpdateCartQuantity() {
  const invalidate = useInvalidateCart();

  return useMutation({
    mutationFn: ({ itemId, quantity }: { itemId: string; quantity: number }) =>
      cartApi.updateQuantity(itemId, { quantity }),
    onSuccess: invalidate,
    onError: (error) => toast.error(errorMessage(error, "Could not update quantity.")),
  });
}

export function useToggleSaved() {
  const invalidate = useInvalidateCart();

  return useMutation({
    mutationFn: ({ itemId, savedForLater }: { itemId: string; savedForLater: boolean }) =>
      cartApi.toggleSaved(itemId, savedForLater),
    onSuccess: (_, variables) => {
      invalidate();
      toast.success(variables.savedForLater ? "Saved for later." : "Moved back to cart.");
    },
    onError: (error) => toast.error(errorMessage(error, "Could not update this item.")),
  });
}

export function useRemoveCartItem() {
  const invalidate = useInvalidateCart();

  return useMutation({
    mutationFn: (itemId: string) => cartApi.removeItem(itemId),
    onSuccess: invalidate,
    onError: (error) => toast.error(errorMessage(error, "Could not remove this item.")),
  });
}

export function useClearCart() {
  const invalidate = useInvalidateCart();

  return useMutation({
    mutationFn: () => cartApi.clearCart(),
    onSuccess: invalidate,
    onError: (error) => toast.error(errorMessage(error, "Could not clear your cart.")),
  });
}
