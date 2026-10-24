"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  adminApi,
  type CreateCategoryPayload,
  type ListAdminOrdersParams,
  type ListAuditLogsParams,
  type ListUsersParams,
  type UpdateCategoryPayload,
} from "./api";
import { categoryKeys } from "@/features/categories/hooks";
import type { ApiError } from "@/types/api";
import type { AdminUser } from "@/types/admin";

function errorMessage(error: unknown, fallback: string): string {
  const apiError = error as ApiError | undefined;
  return apiError?.message || fallback;
}

export const adminKeys = {
  all: ["admin"] as const,
  analytics: ["admin", "analytics"] as const,
  users: (params?: ListUsersParams) => ["admin", "users", params ?? {}] as const,
  pendingStores: (params?: { page?: number; limit?: number }) =>
    ["admin", "stores", "pending", params ?? {}] as const,
  storeSearch: (q: string) => ["admin", "stores", "search", q] as const,
  orders: (params?: ListAdminOrdersParams) => ["admin", "orders", params ?? {}] as const,
  auditLogs: (params?: ListAuditLogsParams) => ["admin", "audit-logs", params ?? {}] as const,
};

export function useAdminAnalytics() {
  return useQuery({
    queryKey: adminKeys.analytics,
    queryFn: () => adminApi.getAnalyticsOverview(),
  });
}

export function useAdminUsers(params?: ListUsersParams) {
  return useQuery({
    queryKey: adminKeys.users(params),
    queryFn: () => adminApi.listUsers(params),
  });
}

export function useSuspendUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminApi.suspendUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      toast.success("User suspended.");
    },
    onError: (error) => toast.error(errorMessage(error, "Could not suspend this user.")),
  });
}

export function useUnsuspendUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminApi.unsuspendUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      toast.success("User reinstated.");
    },
    onError: (error) => toast.error(errorMessage(error, "Could not unsuspend this user.")),
  });
}

export function useChangeUserRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, role }: { id: string; role: AdminUser["role"] }) =>
      adminApi.changeUserRole(id, role),
    onSuccess: (user) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      toast.success(`${user.fullName} is now a${user.role === "admin" ? "n" : ""} ${user.role}.`);
    },
    onError: (error) =>
      toast.error(errorMessage(error, "Could not change this user's role (see reason above).")),
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminApi.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      toast.success("User deleted.");
    },
    onError: (error) =>
      toast.error(errorMessage(error, "Could not delete this user (see reason above).")),
  });
}

export function usePendingStores(params?: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: adminKeys.pendingStores(params),
    queryFn: () => adminApi.listPendingStores(params),
  });
}

export function useApprovedStoreSearch(q: string) {
  return useQuery({
    queryKey: adminKeys.storeSearch(q),
    queryFn: () => adminApi.searchApprovedStores(q),
    enabled: q.trim().length > 0,
  });
}

function useInvalidateStores() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: ["admin", "stores"] });
    queryClient.invalidateQueries({ queryKey: adminKeys.analytics });
  };
}

export function useApproveStore() {
  const invalidate = useInvalidateStores();
  return useMutation({
    mutationFn: (id: string) => adminApi.approveStore(id),
    onSuccess: () => {
      invalidate();
      toast.success("Store approved.");
    },
    onError: (error) => toast.error(errorMessage(error, "Could not approve this store.")),
  });
}

export function useRejectStore() {
  const invalidate = useInvalidateStores();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      adminApi.rejectStore(id, reason),
    onSuccess: () => {
      invalidate();
      toast.success("Store rejected.");
    },
    onError: (error) => toast.error(errorMessage(error, "Could not reject this store.")),
  });
}

export function useSuspendStore() {
  const invalidate = useInvalidateStores();
  return useMutation({
    mutationFn: (id: string) => adminApi.suspendStore(id),
    onSuccess: () => {
      invalidate();
      toast.success("Store suspended.");
    },
    onError: (error) => toast.error(errorMessage(error, "Could not suspend this store.")),
  });
}

export function useAdminArchiveProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminApi.archiveProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.analytics });
      toast.success("Product archived.");
    },
    onError: (error) => toast.error(errorMessage(error, "Could not archive this product.")),
  });
}

export function useAdminOrders(params?: ListAdminOrdersParams) {
  return useQuery({
    queryKey: adminKeys.orders(params),
    queryFn: () => adminApi.listOrders(params),
  });
}

export function useAuditLogs(params?: ListAuditLogsParams) {
  return useQuery({
    queryKey: adminKeys.auditLogs(params),
    queryFn: () => adminApi.listAuditLogs(params),
  });
}

function useInvalidateCategories() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: categoryKeys.all });
  };
}

export function useCreateCategory() {
  const invalidate = useInvalidateCategories();
  return useMutation({
    mutationFn: (payload: CreateCategoryPayload) => adminApi.createCategory(payload),
    onSuccess: () => {
      invalidate();
      toast.success("Category created.");
    },
    onError: (error) => toast.error(errorMessage(error, "Could not create this category.")),
  });
}

export function useUpdateCategory() {
  const invalidate = useInvalidateCategories();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateCategoryPayload }) =>
      adminApi.updateCategory(id, payload),
    onSuccess: () => {
      invalidate();
      toast.success("Category updated.");
    },
    onError: (error) => toast.error(errorMessage(error, "Could not update this category.")),
  });
}

export function useDeleteCategory() {
  const invalidate = useInvalidateCategories();
  return useMutation({
    mutationFn: (id: string) => adminApi.deleteCategory(id),
    onSuccess: () => {
      invalidate();
      toast.success("Category deleted.");
    },
    onError: (error) =>
      toast.error(errorMessage(error, "Could not delete this category (it may have subcategories).")),
  });
}
