import { apiClient } from "@/services/api-client";
import type { PaginatedResponse } from "@/types/api";
import type { AppNotification } from "@/types/notification";

export interface ListNotificationsParams {
  page?: number;
  limit?: number;
}

export const notificationsApi = {
  list: (params?: ListNotificationsParams) =>
    apiClient
      .get<PaginatedResponse<AppNotification>>("/notifications", { params })
      .then((r) => r.data),

  unreadCount: () =>
    apiClient.get<{ count: number }>("/notifications/unread-count").then((r) => r.data),

  markRead: (id: string) =>
    apiClient.patch<AppNotification>(`/notifications/${id}/read`).then((r) => r.data),

  markAllRead: () =>
    apiClient.patch<{ updated: number }>("/notifications/read-all").then((r) => r.data),
};
