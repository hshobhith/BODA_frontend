"use client";

import { useEffect } from "react";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  sellerOrdersApi,
  sellerProductsApi,
  sellerStoreApi,
  uploadsApi,
  type AdjustStockPayload,
  type CreateProductPayload,
  type CreateStorePayload,
  type DeliverySettingsPayload,
  type DuplicateProductPayload,
  type SellerOrderListParams,
  type SellerProductListParams,
  type UpdateProductPayload,
  type UpdateStorePayload,
  type UpdateStoreStatusPayload,
  type WorkingHoursPayload,
} from "./api";
import { activeStoreStore, useActiveStoreStore } from "@/store/active-store-store";
import type { ApiError } from "@/types/api";
import type { CreatePosSalePayload } from "@/types/order";

function errorMessage(error: unknown, fallback: string): string {
  const apiError = error as ApiError | undefined;
  return apiError?.message || fallback;
}

export const sellerKeys = {
  all: ["seller"] as const,
  myStores: () => [...sellerKeys.all, "stores", "mine"] as const,
  myStore: (storeId?: string) => [...sellerKeys.all, "store", "mine", storeId ?? "default"] as const,
  workingHours: (storeId?: string) =>
    [...sellerKeys.all, "store", "working-hours", storeId ?? "default"] as const,
  products: {
    all: () => [...sellerKeys.all, "products"] as const,
    list: (storeId: string, params?: SellerProductListParams) =>
      [...sellerKeys.all, "products", "list", storeId, params ?? {}] as const,
    detail: (id: string) => [...sellerKeys.all, "products", "detail", id] as const,
    lowStock: (storeId: string) => [...sellerKeys.all, "products", "low-stock", storeId] as const,
    inventoryHistory: (id: string, params?: { page?: number; limit?: number }) =>
      [...sellerKeys.all, "products", "inventory-history", id, params ?? {}] as const,
  },
  orders: {
    list: (params?: SellerOrderListParams) => [...sellerKeys.all, "orders", "list", params ?? {}] as const,
  },
};

/**
 * The seller's own store, any approval status, or a 404 if they haven't
 * created one yet. Callers (mainly the `/seller` layout) check
 * `(query.error as ApiError)?.statusCode === 404` to distinguish "no store
 * yet" from a real failure. Retries are disabled so a fresh seller doesn't
 * sit on a retry backoff before the onboarding redirect kicks in.
 *
 * A seller may own more than one store; pass `storeId` to fetch a specific
 * one (see `useSelectedStoreId`) — omitted, this returns their first store.
 */
export function useMyStore(enabled = true, storeId?: string) {
  return useQuery({
    queryKey: sellerKeys.myStore(storeId),
    queryFn: () => sellerStoreApi.getMyStore(storeId),
    retry: false,
    enabled,
  });
}

/** All stores owned by the current seller, oldest first. */
export function useMyStores(enabled = true) {
  return useQuery({
    queryKey: sellerKeys.myStores(),
    queryFn: () => sellerStoreApi.listMyStores(),
    enabled,
  });
}

/**
 * Which store the seller dashboard is currently showing. Reconciles the
 * persisted selection (`useActiveStoreStore`) against the seller's actual
 * store list, so a stale id (a deleted store, a different account's
 * browser) never gets used — it just falls back to the first store.
 */
export function useSelectedStoreId(): string | undefined {
  const storesQuery = useMyStores();
  const persistedId = useActiveStoreStore((state) => state.activeStoreId);
  const setActiveStoreId = useActiveStoreStore((state) => state.setActiveStoreId);
  const stores = storesQuery.data ?? [];

  const resolvedId = (stores.some((store) => store.id === persistedId) ? persistedId : stores[0]?.id) ?? undefined;

  useEffect(() => {
    if (resolvedId && resolvedId !== persistedId) {
      setActiveStoreId(resolvedId);
    }
  }, [resolvedId, persistedId, setActiveStoreId]);

  return resolvedId;
}

export function useCreateStore() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateStorePayload) => sellerStoreApi.createStore(payload),
    onSuccess: (store) => {
      queryClient.invalidateQueries({ queryKey: sellerKeys.myStores() });
      queryClient.setQueryData(sellerKeys.myStore(), store);
      activeStoreStore.getState().setActiveStoreId(store.id);
      toast.success("Your store has been submitted and is pending admin approval.");
    },
    onError: (error) => toast.error(errorMessage(error, "Could not create your store.")),
  });
}

export function useUpdateStore(storeId?: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateStorePayload) => sellerStoreApi.updateStore(payload, storeId),
    onSuccess: (store) => {
      queryClient.invalidateQueries({ queryKey: sellerKeys.myStores() });
      queryClient.setQueryData(sellerKeys.myStore(storeId), store);
      toast.success("Store details updated.");
    },
    onError: (error) => toast.error(errorMessage(error, "Could not update your store.")),
  });
}

export function useWorkingHours(enabled: boolean, storeId?: string) {
  return useQuery({
    queryKey: sellerKeys.workingHours(storeId),
    queryFn: () => sellerStoreApi.getWorkingHours(storeId),
    enabled,
  });
}

export function useUpdateWorkingHours(storeId?: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: WorkingHoursPayload) => sellerStoreApi.updateWorkingHours(payload, storeId),
    onSuccess: (hours) => {
      queryClient.setQueryData(sellerKeys.workingHours(storeId), hours);
      toast.success("Working hours updated.");
    },
    onError: (error) => toast.error(errorMessage(error, "Could not update working hours.")),
  });
}

export function useUpdateDeliverySettings(storeId?: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: DeliverySettingsPayload) =>
      sellerStoreApi.updateDeliverySettings(payload, storeId),
    onSuccess: (deliverySettings) => {
      // The endpoint returns only the settings, so merge them into the cached
      // store — replacing the store with them would make the settings' id
      // pose as the store id on the next save (a 404 "Store not found").
      queryClient.setQueryData<Store>(sellerKeys.myStore(storeId), (store) =>
        store ? { ...store, deliverySettings } : store
      );
      // Product forms and other views read the mode from these too.
      queryClient.invalidateQueries({ queryKey: [...sellerKeys.all, "store", "mine"] });
      toast.success("Delivery settings updated.");
    },
    onError: (error) => toast.error(errorMessage(error, "Could not update delivery settings.")),
  });
}

export function useUpdateStoreStatus(storeId?: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateStoreStatusPayload) => sellerStoreApi.updateStatus(payload, storeId),
    onSuccess: (store) => {
      queryClient.setQueryData(sellerKeys.myStore(storeId), store);
      toast.success(`Store status set to "${store.status?.replace(/_/g, " ")}".`);
    },
    onError: (error) => toast.error(errorMessage(error, "Could not update store status.")),
  });
}

export function useSellerProducts(storeId: string | undefined, params?: SellerProductListParams) {
  return useQuery({
    queryKey: sellerKeys.products.list(storeId ?? "", params),
    queryFn: () => sellerProductsApi.listMine(storeId as string, params),
    enabled: Boolean(storeId),
    placeholderData: keepPreviousData,
  });
}

export function useSellerProduct(id: string | undefined) {
  return useQuery({
    queryKey: sellerKeys.products.detail(id ?? ""),
    queryFn: () => sellerProductsApi.getMineById(id as string),
    enabled: Boolean(id),
  });
}

export function useLowStockProducts(storeId: string | undefined) {
  return useQuery({
    queryKey: sellerKeys.products.lowStock(storeId ?? ""),
    queryFn: () => sellerProductsApi.getLowStock(storeId as string),
    enabled: Boolean(storeId),
  });
}

export function useInventoryHistory(id: string | undefined, params?: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: sellerKeys.products.inventoryHistory(id ?? "", params),
    queryFn: () => sellerProductsApi.getInventoryHistory(id as string, params),
    enabled: Boolean(id),
  });
}

export function useCreateProduct(storeId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateProductPayload) =>
      sellerProductsApi.create(storeId as string, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sellerKeys.products.all() });
      toast.success("Product created.");
    },
    onError: (error) => toast.error(errorMessage(error, "Could not create this product.")),
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateProductPayload }) =>
      sellerProductsApi.update(id, payload),
    onSuccess: (product) => {
      queryClient.invalidateQueries({ queryKey: sellerKeys.products.all() });
      queryClient.setQueryData(sellerKeys.products.detail(product.id), product);
      toast.success("Product updated.");
    },
    onError: (error) => toast.error(errorMessage(error, "Could not update this product.")),
  });
}

export function useArchiveProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => sellerProductsApi.archive(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sellerKeys.products.all() });
      toast.success("Product archived.");
    },
    onError: (error) => toast.error(errorMessage(error, "Could not archive this product.")),
  });
}

export function useDuplicateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload?: DuplicateProductPayload }) =>
      sellerProductsApi.duplicate(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sellerKeys.products.all() });
      toast.success("Product duplicated.");
    },
    onError: (error) => toast.error(errorMessage(error, "Could not duplicate this product.")),
  });
}

export function useAdjustStock() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: AdjustStockPayload }) =>
      sellerProductsApi.adjustStock(id, payload),
    onSuccess: (product) => {
      queryClient.invalidateQueries({ queryKey: sellerKeys.products.all() });
      queryClient.setQueryData(sellerKeys.products.detail(product.id), product);
      toast.success("Stock adjusted.");
    },
    onError: (error) => toast.error(errorMessage(error, "Could not adjust stock.")),
  });
}

export function useSellerOrders(params?: SellerOrderListParams) {
  return useQuery({
    queryKey: sellerKeys.orders.list(params),
    queryFn: () => sellerOrdersApi.listMine(params),
    placeholderData: keepPreviousData,
  });
}

export function useCreatePosSale(storeId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreatePosSalePayload) =>
      sellerOrdersApi.createPosSale(storeId as string, payload),
    onSuccess: (order) => {
      queryClient.invalidateQueries({ queryKey: sellerKeys.all });
      toast.success(`Sale recorded — ₹${order.total.toFixed(2)}.`);
    },
    onError: (error) => toast.error(errorMessage(error, "Could not record this sale.")),
  });
}

export function useBarcodeLookup(storeId: string) {
  return useMutation({
    mutationFn: (code: string) => sellerProductsApi.lookupBarcode(code, storeId),
    onError: (error) => toast.error(errorMessage(error, "Could not look up this barcode.")),
  });
}

export function useUploadImage() {
  return useMutation({
    mutationFn: ({ file, folder }: { file: File; folder?: string }) =>
      uploadsApi.uploadImage(file, folder),
    onError: (error) => toast.error(errorMessage(error, "Could not upload this image.")),
  });
}
