"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { addressesApi } from "./api";
import { useAuthStore } from "@/store/auth-store";
import type { ApiError } from "@/types/api";
import type { CreateAddressPayload, UpdateAddressPayload } from "@/types/address";

function errorMessage(error: unknown, fallback: string): string {
  const apiError = error as ApiError | undefined;
  return apiError?.message || fallback;
}

export const addressKeys = {
  all: ["addresses"] as const,
};

export function useAddresses() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return useQuery({
    queryKey: addressKeys.all,
    queryFn: () => addressesApi.list(),
    enabled: isAuthenticated,
  });
}

export function useCreateAddress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateAddressPayload) => addressesApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: addressKeys.all });
      toast.success("Address added.");
    },
    onError: (error) => toast.error(errorMessage(error, "Could not add this address.")),
  });
}

export function useUpdateAddress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateAddressPayload }) =>
      addressesApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: addressKeys.all });
      toast.success("Address updated.");
    },
    onError: (error) => toast.error(errorMessage(error, "Could not update this address.")),
  });
}

export function useDeleteAddress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => addressesApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: addressKeys.all });
      toast.success("Address removed.");
    },
    onError: (error) => toast.error(errorMessage(error, "Could not remove this address.")),
  });
}

export function useSetDefaultAddress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => addressesApi.setDefault(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: addressKeys.all });
    },
    onError: (error) => toast.error(errorMessage(error, "Could not set this address as default.")),
  });
}
