import type { OrderStatus } from "@/types/order";
import type { Store, StoreApprovalStatus, StoreType } from "@/types/store";

/** Confirmed live against GET /admin/analytics/overview. */
export interface AdminAnalyticsOverview {
  users: {
    total: number;
    byRole: { customer: number; seller: number; admin: number };
  };
  stores: {
    total: number;
    byApprovalStatus: Record<StoreApprovalStatus, number>;
    byType: Record<StoreType, number>;
  };
  products: {
    total: number;
    byStatus: { active: number; archived: number };
  };
  orders: {
    total: number;
    byStatus: Record<OrderStatus, number>;
  };
  revenue: {
    totalPaid: number;
  };
}

export interface AdminUser {
  id: string;
  email: string;
  phone?: string | null;
  role: "customer" | "seller" | "admin";
  fullName: string;
  avatarUrl?: string | null;
  status: "active" | "suspended";
  emailVerifiedAt: string | null;
  createdAt: string;
}

export interface AuditLogEntry {
  id: string;
  actorId?: string | null;
  actor?: { id: string; fullName: string; email: string } | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  metadata?: Record<string, unknown> | null;
  ipAddress?: string | null;
  createdAt: string;
}

/** `GET /admin/stores` row and `GET /admin/stores/:id` — a store with its owner. */
export interface AdminStore extends Store {
  seller: {
    id: string;
    fullName: string;
    email: string;
    /** False while a seller an admin set a store up for hasn't signed in yet. */
    hasSignedIn: boolean;
  } | null;
}

/** `POST /admin/stores` response. */
export interface AdminCreatedStore extends Store {
  sellerAccount: {
    id: string;
    email: string;
    /** Account not claimed yet — the seller was emailed to sign in with Google. */
    invited: boolean;
    /** An existing customer account was turned into a seller account. */
    upgraded: boolean;
  };
}
