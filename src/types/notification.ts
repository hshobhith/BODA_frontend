/**
 * In-app notification (backend `notifications` table). Named `AppNotification`
 * to avoid clashing with the DOM's global `Notification`.
 */
export interface AppNotification {
  id: string;
  userId: string;
  /** e.g. "order.placed", "order.status_changed", "order.received". */
  type: string;
  title: string;
  body: string;
  channel: "in_app" | "email";
  readAt: string | null;
  /** Order notifications carry `orderId`; store moderation ones carry `storeId`. */
  metadata?: { orderId?: string; storeId?: string; [key: string]: unknown } | null;
  createdAt: string;
  updatedAt: string;
}
