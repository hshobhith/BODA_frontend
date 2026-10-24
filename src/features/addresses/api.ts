import { apiClient } from "@/services/api-client";
import type { Address, CreateAddressPayload, UpdateAddressPayload } from "@/types/address";

export const addressesApi = {
  list: () => apiClient.get<Address[]>("/addresses").then((r) => r.data),

  create: (payload: CreateAddressPayload) =>
    apiClient.post<Address>("/addresses", payload).then((r) => r.data),

  update: (id: string, payload: UpdateAddressPayload) =>
    apiClient.patch<Address>(`/addresses/${id}`, payload).then((r) => r.data),

  remove: (id: string) => apiClient.delete<void>(`/addresses/${id}`).then((r) => r.data),

  setDefault: (id: string) =>
    apiClient.patch<Address>(`/addresses/${id}/set-default`).then((r) => r.data),
};
