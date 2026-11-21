import { apiClient } from "@/services/api-client";
import type {
  AdminAnalyticsOverview,
  AdminCreatedStore,
  AdminStore,
  AdminUser,
  AuditLogEntry,
} from "@/types/admin";
import type { CreateStorePayload } from "@/features/seller/api";
import type { PaginatedResponse } from "@/types/api";
import type { Category } from "@/types/category";
import type { Order, OrderStatus } from "@/types/order";
import type { Store, StoreApprovalStatus } from "@/types/store";

export interface ListUsersParams {
  page?: number;
  limit?: number;
  role?: "customer" | "seller" | "admin";
}

export interface ListAdminOrdersParams {
  page?: number;
  limit?: number;
  status?: OrderStatus;
  storeId?: string;
}

export interface ListAdminStoresParams {
  page?: number;
  limit?: number;
  /** Matches store name, city or seller email. */
  search?: string;
  approvalStatus?: StoreApprovalStatus;
}

/**
 * A store an admin sets up for a seller: the seller's own store fields plus
 * whose store it is. An existing seller gets it straight away; otherwise an
 * account is created for `sellerEmail` and they're emailed to sign in with
 * Google, after which they manage it like any store of their own.
 */
export interface AdminCreateStorePayload extends CreateStorePayload {
  sellerEmail: string;
  /** Only used when a new account is created. */
  sellerName?: string;
  sellerPhone?: string;
}

export interface ListAuditLogsParams {
  page?: number;
  limit?: number;
  action?: string;
  entityType?: string;
  actorId?: string;
}

export interface CreateCategoryPayload {
  name: string;
  imageUrl?: string;
  parentId?: string;
  sortOrder?: number;
}

export type UpdateCategoryPayload = Partial<CreateCategoryPayload>;

export const adminApi = {
  getAnalyticsOverview: () =>
    apiClient.get<AdminAnalyticsOverview>("/admin/analytics/overview").then((r) => r.data),

  listUsers: (params?: ListUsersParams) =>
    apiClient.get<PaginatedResponse<AdminUser>>("/admin/users", { params }).then((r) => r.data),

  getUser: (id: string) => apiClient.get<AdminUser>(`/admin/users/${id}`).then((r) => r.data),

  suspendUser: (id: string) =>
    apiClient.patch<AdminUser>(`/admin/users/${id}/suspend`).then((r) => r.data),

  unsuspendUser: (id: string) =>
    apiClient.patch<AdminUser>(`/admin/users/${id}/unsuspend`).then((r) => r.data),

  changeUserRole: (id: string, role: AdminUser["role"]) =>
    apiClient.patch<AdminUser>(`/admin/users/${id}/role`, { role }).then((r) => r.data),

  deleteUser: (id: string) => apiClient.delete<void>(`/admin/users/${id}`).then((r) => r.data),

  listPendingStores: (params?: { page?: number; limit?: number }) =>
    apiClient
      .get<PaginatedResponse<Store>>("/admin/stores/pending", { params })
      .then((r) => r.data),

  approveStore: (id: string) =>
    apiClient.patch<Store>(`/admin/stores/${id}/approve`).then((r) => r.data),

  rejectStore: (id: string, reason: string) =>
    apiClient.patch<Store>(`/admin/stores/${id}/reject`, { reason }).then((r) => r.data),

  suspendStore: (id: string) =>
    apiClient.patch<Store>(`/admin/stores/${id}/suspend`).then((r) => r.data),

  listAllStores: (params?: ListAdminStoresParams) =>
    apiClient.get<PaginatedResponse<AdminStore>>("/admin/stores", { params }).then((r) => r.data),

  getStore: (id: string) => apiClient.get<AdminStore>(`/admin/stores/${id}`).then((r) => r.data),

  /** Sets up a store for a seller by email — see `AdminCreateStorePayload`. */
  createStore: (payload: AdminCreateStorePayload) =>
    apiClient.post<AdminCreatedStore>("/admin/stores", payload).then((r) => r.data),

  resendSellerInvite: (id: string) =>
    apiClient
      .post<{ sent: true; email: string }>(`/admin/stores/${id}/resend-invite`)
      .then((r) => r.data),

  searchApprovedStores: (q: string, params?: { page?: number; limit?: number }) =>
    apiClient
      .get<PaginatedResponse<Store>>("/stores/search", { params: { q, ...params } })
      .then((r) => r.data),

  archiveProduct: (id: string) =>
    apiClient.patch<void>(`/admin/products/${id}/archive`).then((r) => r.data),

  listOrders: (params?: ListAdminOrdersParams) =>
    apiClient.get<PaginatedResponse<Order>>("/admin/orders", { params }).then((r) => r.data),

  listAuditLogs: (params?: ListAuditLogsParams) =>
    apiClient
      .get<PaginatedResponse<AuditLogEntry>>("/admin/audit-logs", { params })
      .then((r) => r.data),

  createCategory: (payload: CreateCategoryPayload) =>
    apiClient.post<Category>("/categories", payload).then((r) => r.data),

  updateCategory: (id: string, payload: UpdateCategoryPayload) =>
    apiClient.patch<Category>(`/categories/${id}`, payload).then((r) => r.data),

  deleteCategory: (id: string) =>
    apiClient.delete<void>(`/categories/${id}`).then((r) => r.data),
};
