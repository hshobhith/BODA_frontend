"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, CheckCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import { useHasMounted } from "@/hooks/use-has-mounted";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth-store";
import type { AppNotification } from "@/types/notification";
import {
  notificationHref,
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
  useUnreadNotificationCount,
} from "../hooks";

const LIST_SIZE = 20;
const relativeTime = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" });

function timeAgo(iso: string): string {
  const seconds = Math.round((new Date(iso).getTime() - Date.now()) / 1000);
  const steps: [Intl.RelativeTimeFormatUnit, number][] = [
    ["year", 31_536_000],
    ["month", 2_592_000],
    ["week", 604_800],
    ["day", 86_400],
    ["hour", 3_600],
    ["minute", 60],
  ];
  for (const [unit, size] of steps) {
    if (Math.abs(seconds) >= size) return relativeTime.format(Math.round(seconds / size), unit);
  }
  return "just now";
}

function NotificationItem({
  notification,
  onSelect,
}: {
  notification: AppNotification;
  onSelect: (notification: AppNotification) => void;
}) {
  const unread = !notification.readAt;
  return (
    <li>
      <button
        type="button"
        onClick={() => onSelect(notification)}
        className={cn(
          "flex w-full gap-3 px-4 py-3 text-left transition-colors hover:bg-muted",
          unread && "bg-primary/5"
        )}
      >
        <span
          aria-hidden
          className={cn("mt-1.5 size-2 shrink-0 rounded-full", unread ? "bg-primary" : "bg-transparent")}
        />
        <span className="flex min-w-0 flex-col gap-0.5">
          <span className={cn("text-sm text-foreground", unread && "font-medium")}>
            {notification.title}
          </span>
          <span className="line-clamp-2 text-xs text-muted-foreground">{notification.body}</span>
          <span className="text-xs text-muted-foreground">{timeAgo(notification.createdAt)}</span>
        </span>
        {unread && <span className="sr-only">(unread)</span>}
      </button>
    </li>
  );
}

/** Header bell: unread count badge, and a list of recent notifications. */
export function NotificationBell() {
  const router = useRouter();
  const hasMounted = useHasMounted();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [open, setOpen] = useState(false);

  const unreadQuery = useUnreadNotificationCount();
  const listQuery = useNotifications({ page: 1, limit: LIST_SIZE });
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();

  // Auth lives in localStorage, so render nothing until mounted to match the server HTML.
  if (!hasMounted || !isAuthenticated) return null;

  const unread = unreadQuery.data?.count ?? 0;
  const notifications = listQuery.data?.data ?? [];

  function handleSelect(notification: AppNotification) {
    if (!notification.readAt) markRead.mutate(notification.id);
    const href = notificationHref(notification);
    if (href) {
      setOpen(false);
      router.push(href);
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label={unread > 0 ? `Notifications, ${unread} unread` : "Notifications"}
        >
          <Bell className="size-5" />
          {unread > 0 && (
            <Badge
              variant="default"
              className="absolute -top-1 -right-1 size-4.5 justify-center rounded-full bg-destructive p-0 text-[10px] text-white dark:text-white"
            >
              {unread > 9 ? "9+" : unread}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[min(22rem,calc(100vw-2rem))] gap-0 p-0">
        <div className="flex items-center justify-between gap-2 border-b px-4 py-3">
          <h2 className="text-sm font-semibold text-foreground">Notifications</h2>
          {unread > 0 && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 gap-1.5 text-xs"
              disabled={markAllRead.isPending}
              onClick={() => markAllRead.mutate()}
            >
              <CheckCheck className="size-3.5" />
              Mark all read
            </Button>
          )}
        </div>
        {listQuery.isLoading ? (
          <div className="flex flex-col gap-2 p-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
            <Bell className="size-6 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              No notifications yet. Order updates will show up here.
            </p>
          </div>
        ) : (
          <ul className="max-h-96 divide-y overflow-y-auto">
            {notifications.map((notification) => (
              <NotificationItem key={notification.id} notification={notification} onSelect={handleSelect} />
            ))}
          </ul>
        )}
      </PopoverContent>
    </Popover>
  );
}
