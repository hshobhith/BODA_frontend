import { apiClient } from "@/services/api-client";
import type { AddToCartPayload, CartItem, CartSummary, UpdateCartItemPayload } from "@/types/cart";

export const cartApi = {
  getCart: () => apiClient.get<CartSummary>("/cart").then((r) => r.data),

  getSavedForLater: () =>
    apiClient.get<CartSummary>("/cart/saved-for-later").then((r) => r.data),

  getCount: () => apiClient.get<{ count: number }>("/cart/count").then((r) => r.data),

  addItem: (payload: AddToCartPayload) =>
    apiClient.post<CartItem>("/cart/items", payload).then((r) => r.data),

  updateQuantity: (itemId: string, payload: UpdateCartItemPayload) =>
    apiClient.patch<CartItem>(`/cart/items/${itemId}`, payload).then((r) => r.data),

  toggleSaved: (itemId: string, savedForLater: boolean) =>
    apiClient
      .patch<CartItem>(`/cart/items/${itemId}/save`, { savedForLater })
      .then((r) => r.data),

  removeItem: (itemId: string) =>
    apiClient.delete<void>(`/cart/items/${itemId}`).then((r) => r.data),

  clearCart: () => apiClient.delete<void>("/cart").then((r) => r.data),
};
