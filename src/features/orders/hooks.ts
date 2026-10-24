"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { ordersApi, type ListOrdersParams } from "./api";
import { cartKeys } from "@/features/cart/hooks";
import { useAuthStore } from "@/store/auth-store";
import type { ApiError } from "@/types/api";
import {
  orderStatusLabel,
  type CreateOrderPayload,
  type ReviewPrescriptionPayload,
  type UpdateOrderStatusPayload,
} from "@/types/order";

/** Prefix of sellerKeys.orders.list(...) — spelled out to avoid an orders <-> seller hooks import cycle. */
const SELLER_ORDERS_KEY = ["seller", "orders"] as const;

function errorMessage(error: unknown, fallback: string): string {
  const apiError = error as ApiError | undefined;
  return apiError?.message || fallback;
}

export const orderKeys = {
  all: ["orders"] as const,
  mine: (params?: ListOrdersParams) => ["orders", "mine", params ?? {}] as const,
  detail: (id: string) => ["orders", "detail", id] as const,
  timeline: (id: string) => ["orders", "timeline", id] as const,
};

export function useMyOrders(params?: ListOrdersParams, enabled = true) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return useQuery({
    queryKey: orderKeys.mine(params),
    queryFn: () => ordersApi.listMine(params),
    enabled: isAuthenticated && enabled,
  });
}

export function useOrder(id: string | undefined) {
  return useQuery({
    queryKey: orderKeys.detail(id ?? ""),
    queryFn: () => ordersApi.getById(id as string),
    enabled: Boolean(id),
  });
}

export function useOrderTimeline(id: string | undefined) {
  return useQuery({
    queryKey: orderKeys.timeline(id ?? ""),
    queryFn: () => ordersApi.getTimeline(id as string),
    enabled: Boolean(id),
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateOrderPayload) => ordersApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orderKeys.all });
      queryClient.invalidateQueries({ queryKey: cartKeys.all });
      toast.success("Order placed! Pay with cash on delivery or at pickup.");
    },
    onError: (error) => toast.error(errorMessage(error, "Could not place your order.")),
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateOrderStatusPayload }) =>
      ordersApi.updateStatus(id, payload),
    onSuccess: (order) => {
      queryClient.invalidateQueries({ queryKey: orderKeys.all });
      queryClient.invalidateQueries({ queryKey: orderKeys.detail(order.id) });
      queryClient.invalidateQueries({ queryKey: orderKeys.timeline(order.id) });
      // The seller order table lists under its own key factory (features/seller/hooks).
      queryClient.invalidateQueries({ queryKey: SELLER_ORDERS_KEY });
      toast.success(
        `Order status updated to "${orderStatusLabel(order.status, order.store?.storeType)}".`
      );
    },
    onError: (error) => toast.error(errorMessage(error, "Could not update this order.")),
  });
}

export function useCancelOrder() {
  const updateStatus = useUpdateOrderStatus();
  return {
    ...updateStatus,
    cancel: (id: string, note?: string) =>
      updateStatus.mutate({ id, payload: { status: "cancelled", note } }),
  };
}

export function useUploadPrescription() {
  return useMutation({
    mutationFn: (file: File) => ordersApi.uploadPrescription(file),
    onError: (error) => toast.error(errorMessage(error, "Could not upload the prescription.")),
  });
}

export function usePrescriptionFile(orderId: string, index: number) {
  return useQuery({
    queryKey: [...orderKeys.detail(orderId), "prescription", index] as const,
    queryFn: () => ordersApi.getPrescriptionFile(orderId, index),
    staleTime: Infinity,
  });
}

export function useReviewPrescription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: ReviewPrescriptionPayload }) =>
      ordersApi.reviewPrescription(id, payload),
    onSuccess: (order, { payload }) => {
      queryClient.invalidateQueries({ queryKey: orderKeys.all });
      queryClient.invalidateQueries({ queryKey: SELLER_ORDERS_KEY });
      toast.success(
        payload.approve
          ? "Prescription approved. You can now accept the order."
          : `Prescription rejected and order ${order.orderNumber} cancelled.`
      );
    },
    onError: (error) => toast.error(errorMessage(error, "Could not save the review.")),
  });
}

export function useDownloadInvoice() {
  return useMutation({
    mutationFn: async ({ id, orderNumber }: { id: string; orderNumber: string }) => {
      const blob = await ordersApi.downloadInvoice(id);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${orderNumber}-invoice.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    },
    onError: (error) => toast.error(errorMessage(error, "Could not download the invoice.")),
  });
}
