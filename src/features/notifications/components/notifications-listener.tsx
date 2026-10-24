"use client";

import { useNotificationsSocket } from "../hooks";

/** Mounted once in the root layout: keeps the live notifications connection open while logged in. */
export function NotificationsListener() {
  useNotificationsSocket();
  return null;
}
