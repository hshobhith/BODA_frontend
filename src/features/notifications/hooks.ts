"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { io } from "socket.io-client";
import { toast } from "sonner";

import { API_BASE_URL } from "@/constants/config";
import { ROUTES } from "@/constants/routes";
import { orderKeys } from "@/features/orders/hooks";
import { useAuthStore } from "@/store/auth-store";
import type { ApiError } from "@/types/api";
import type { AppNotification } from "@/types/notification";
import { notificationsApi, type ListNotificationsParams } from "./api";

function errorMessage(error: unknown, fallback: string): string {
  const apiError = error as ApiError | undefined;
  return apiError?.message || fallback;
}

export const notificationKeys = {
  all: ["notifications"] as const,
  list: (params?: ListNotificationsParams) => ["notifications", "list", params ?? {}] as const,
  unreadCount: ["notifications", "unread-count"] as const,
};

export function useNotifications(params?: ListNotificationsParams) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return useQuery({
    queryKey: notificationKeys.list(params),
    queryFn: () => notificationsApi.list(params),
    enabled: isAuthenticated,
  });
}

export function useUnreadNotificationCount() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return useQuery({
    queryKey: notificationKeys.unreadCount,
    queryFn: () => notificationsApi.unreadCount(),
    enabled: isAuthenticated,
    // Fallback for when the live socket is down (e.g. it was dropped while
    // the access token was expired); a poll also refreshes that token.
    refetchInterval: 60_000,
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => notificationsApi.markRead(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: notificationKeys.all }),
    onError: (error) => toast.error(errorMessage(error, "Could not update the notification.")),
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => notificationsApi.markAllRead(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: notificationKeys.all }),
    onError: (error) => toast.error(errorMessage(error, "Could not update notifications.")),
  });
}

/** Where a notification leads when clicked, if anywhere. */
export function notificationHref(notification: AppNotification): string | null {
  const orderId = notification.metadata?.orderId;
  if (typeof orderId === "string") return ROUTES.orderDetail(orderId);
  // Store moderation (approved / rejected / suspended) goes to the seller's dashboard.
  if (typeof notification.metadata?.storeId === "string") return ROUTES.sellerDashboard;
  return null;
}

/** The backend's Socket.IO namespace lives on the API origin, outside `/api/v1`. */
const SOCKET_URL = `${new URL(API_BASE_URL).origin}/notifications`;

/**
 * Live connection to the backend's notifications gateway while logged in.
 * Each new notification refreshes the bell and any order lists it concerns,
 * and pops a toast. Reconnects whenever the access token rotates, since the
 * gateway checks the token once, at connect time.
 */
export function useNotificationsSocket() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const queryClient = useQueryClient();
  const router = useRouter();

  useEffect(() => {
    if (!accessToken) return;

    const socket = io(SOCKET_URL, {
      auth: { token: accessToken },
      transports: ["websocket", "polling"],
    });

    socket.on("notification", (notification: AppNotification) => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
      if (notification.metadata?.orderId) {
        queryClient.invalidateQueries({ queryKey: orderKeys.all });
        // Seller order lists live under their own key factory (features/seller/hooks).
        queryClient.invalidateQueries({ queryKey: ["seller", "orders"] });
      }

      const href = notificationHref(notification);
      toast(notification.title, {
        description: notification.body,
        action: href ? { label: "View", onClick: () => router.push(href) } : undefined,
      });
    });

    return () => {
      socket.disconnect();
    };
  }, [accessToken, queryClient, router]);
}
