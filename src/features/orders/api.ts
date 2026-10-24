import { apiClient } from "@/services/api-client";
import type { PaginatedResponse } from "@/types/api";
import type {
  CreateOrderPayload,
  Order,
  OrderStatus,
  OrderStatusHistoryEntry,
  ReviewPrescriptionPayload,
  UpdateOrderStatusPayload,
} from "@/types/order";

export interface ListOrdersParams {
  status?: OrderStatus;
  /** Only this store's orders (used in store-only mode). */
  storeId?: string;
  page?: number;
  limit?: number;
}

export const ordersApi = {
  create: (payload: CreateOrderPayload) =>
    apiClient.post<Order>("/orders", payload).then((r) => r.data),

  listMine: (params?: ListOrdersParams) =>
    apiClient
      .get<PaginatedResponse<Order>>("/orders/mine", { params })
      .then((r) => r.data),

  getById: (id: string) => apiClient.get<Order>(`/orders/${id}`).then((r) => r.data),

  getTimeline: (id: string) =>
    apiClient.get<OrderStatusHistoryEntry[]>(`/orders/${id}/timeline`).then((r) => r.data),

  updateStatus: (id: string, payload: UpdateOrderStatusPayload) =>
    apiClient.patch<Order>(`/orders/${id}/status`, payload).then((r) => r.data),

  /** Stored privately; returns a key for CreateOrderPayload.prescriptionKeys, never a URL. */
  uploadPrescription: (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return apiClient
      .post<{ key: string }>("/uploads/prescription", formData, {
        // Let axios set multipart/form-data with its boundary (see uploadsApi.uploadImage).
        headers: { "Content-Type": undefined },
      })
      .then((r) => r.data);
  },

  /** Authenticated fetch — prescription files have no public URL. */
  getPrescriptionFile: (id: string, index: number) =>
    apiClient
      .get<Blob>(`/orders/${id}/prescriptions/${index}`, { responseType: "blob" })
      .then((r) => r.data),

  reviewPrescription: (id: string, payload: ReviewPrescriptionPayload) =>
    apiClient.patch<Order>(`/orders/${id}/prescription`, payload).then((r) => r.data),

  downloadInvoice: (id: string) =>
    apiClient
      .get<Blob>(`/orders/${id}/invoice.pdf`, { responseType: "blob" })
      .then((r) => r.data),
};
