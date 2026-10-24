import type { Address } from "@/types/address";
import type { Store, StoreType } from "@/types/store";

/** Matches backend's OrderStatus enum exactly (src/common/enums/order-status.enum.ts). */
export type OrderStatus =
  | "new"
  | "processing"
  | "packed"
  | "shipped"
  | "out_for_delivery"
  | "delivered"
  | "cancelled"
  | "returned"
  | "refunded";

export type FulfillmentType = "pickup" | "delivery";
export type PaymentMethod = "cod" | "cash";
export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";
/** Pharmacy orders with Rx items wait for the seller to approve the prescription. */
export type PrescriptionStatus = "not_required" | "pending_review" | "approved" | "rejected";

export const PRESCRIPTION_STATUS_META: Record<PrescriptionStatus, { label: string; className: string }> = {
  not_required: { label: "Not required", className: "bg-muted text-muted-foreground" },
  pending_review: {
    label: "Prescription under review",
    className: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  },
  approved: {
    label: "Prescription approved",
    className: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  },
  rejected: { label: "Prescription rejected", className: "bg-destructive/15 text-destructive" },
};

/** `pos` = a seller-recorded in-store/offline sale; see CreatePosSalePayload. */
export type OrderChannel = "online" | "pos";

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  variantId: string | null;
  productNameSnapshot: string;
  /** Snapshot of chosen add-ons; prices are already in `unitPrice`. */
  addons?: { groupName: string; name: string; price: number }[];
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface OrderCustomerSummary {
  id: string;
  fullName: string;
  email: string;
  phone?: string | null;
}

/** Confirmed live against POST /orders, GET /orders/mine, GET /orders/:id. */
export interface Order {
  id: string;
  orderNumber: string;
  customerId: string | null;
  storeId: string;
  channel: OrderChannel;
  status: OrderStatus;
  fulfillmentType: FulfillmentType;
  deliveryAddressId: string | null;
  subtotal: number;
  deliveryFee: number;
  discount: number;
  tax: number;
  total: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  customerNote: string | null;
  /** Walk-in customer details for a `channel: "pos"` order — null for online orders. */
  guestName?: string | null;
  guestPhone?: string | null;
  prescriptionStatus?: PrescriptionStatus;
  /** Private storage keys; fetch each file via ordersApi.getPrescriptionFile(orderId, index). */
  prescriptionKeys?: string[];
  prescriptionNote?: string | null;
  placedAt: string;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
  store: Store;
  customer?: OrderCustomerSummary | null;
  deliveryAddress?: Address | null;
}

export interface OrderStatusHistoryEntry {
  id: string;
  orderId: string;
  status: OrderStatus;
  note: string | null;
  changedById: string | null;
  changedBy?: OrderCustomerSummary | null;
  createdAt: string;
}

export interface CreateOrderPayload {
  storeId: string;
  fulfillmentType: FulfillmentType;
  deliveryAddressId?: string;
  customerNote?: string;
  /** From POST /uploads/prescription; required when the cart has Rx items. */
  prescriptionKeys?: string[];
}

export interface ReviewPrescriptionPayload {
  approve: boolean;
  note?: string;
}

export interface UpdateOrderStatusPayload {
  status: OrderStatus;
  note?: string;
}

export interface PosSaleItemPayload {
  productId: string;
  variantId?: string;
  quantity: number;
}

export interface CreatePosSalePayload {
  items: PosSaleItemPayload[];
  guestName?: string;
  guestPhone?: string;
  note?: string;
}

/** Human-readable label + a Tailwind color class per status, shared across customer/seller/admin UIs. */
export const ORDER_STATUS_META: Record<OrderStatus, { label: string; className: string }> = {
  new: { label: "New", className: "bg-blue-500/15 text-blue-600 dark:text-blue-400" },
  processing: {
    label: "Processing",
    className: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  },
  packed: { label: "Packed", className: "bg-violet-500/15 text-violet-600 dark:text-violet-400" },
  shipped: { label: "Shipped", className: "bg-indigo-500/15 text-indigo-600 dark:text-indigo-400" },
  out_for_delivery: {
    label: "Out for delivery",
    className: "bg-cyan-500/15 text-cyan-600 dark:text-cyan-400",
  },
  delivered: {
    label: "Delivered",
    className: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  },
  cancelled: {
    label: "Cancelled",
    className: "bg-destructive/15 text-destructive",
  },
  returned: { label: "Returned", className: "bg-orange-500/15 text-orange-600 dark:text-orange-400" },
  refunded: { label: "Refunded", className: "bg-slate-500/15 text-slate-600 dark:text-slate-400" },
};

/**
 * Restaurants reuse the same statuses with kitchen wording. Pass the order's
 * store type wherever a status is shown.
 */
export function orderStatusLabel(status: OrderStatus, storeType?: StoreType | null): string {
  if (storeType === "restaurant") {
    if (status === "processing") return "Preparing";
    if (status === "packed") return "Ready";
  }
  return ORDER_STATUS_META[status]?.label ?? status;
}

/** Ordered pipeline for a normal (non-cancelled/returned) order, used to render progress steppers. */
export const ORDER_STATUS_PIPELINE: OrderStatus[] = [
  "new",
  "processing",
  "packed",
  "shipped",
  "out_for_delivery",
  "delivered",
];
