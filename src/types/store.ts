/**
 * Store types.
 *
 * Enum-like string fields below are confirmed against the live backend
 * (checked directly against `backend/src/modules/stores/entities/*.entity.ts`
 * while building the cart/checkout feature, which depends on `mode` and
 * `status` being accurate). Kept as loose unions with a `(string & {})`
 * escape hatch anyway so an unrecognized value never breaks rendering.
 */

/** Drives type-specific features (backend `StoreType`); fixed once the store is created. */
export type StoreType = "retail" | "restaurant" | "pharmacy";

export const STORE_TYPE_META: Record<
  StoreType,
  { label: string; description: string; licenceLabel: string | null }
> = {
  retail: {
    label: "Shop",
    description: "Groceries, electronics, fashion and other ready-to-sell goods",
    licenceLabel: null,
  },
  restaurant: {
    label: "Restaurant / food",
    description: "Cooked food with a menu, add-ons and a kitchen order flow",
    licenceLabel: "FSSAI licence number",
  },
  pharmacy: {
    label: "Pharmacy / medical",
    description: "Medicines, with prescription checks for Rx items",
    licenceLabel: "Drug licence number",
  },
};

export type StoreApprovalStatus = "pending" | "approved" | "rejected" | "suspended" | (string & {});
export type StoreStatus = "open" | "closed" | "temporarily_closed" | "vacation" | (string & {});
export type StoreDeliveryMode = "pickup_only" | "delivery" | "both" | (string & {});
export type StoreDeliverySpeed =
  | "10_min"
  | "same_day"
  | "next_day"
  | "3_5_days"
  | "custom"
  | (string & {});

export interface StoreWorkingHour {
  /** 0 = Sunday .. 6 = Saturday. */
  dayOfWeek: number;
  openTime: string | null;
  closeTime: string | null;
  breakStart?: string | null;
  breakEnd?: string | null;
  isHoliday: boolean;
}

export interface StoreDeliverySettings {
  mode: StoreDeliveryMode;
  deliveryRadiusKm?: number | null;
  deliveryFee?: number | null;
  freeDeliveryThreshold?: number | null;
  deliverySpeed?: StoreDeliverySpeed | null;
}

export interface Store {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string | null;
  bannerUrl?: string | null;
  description?: string | null;
  /** Older payloads predate this field; treat a missing value as "retail". */
  storeType?: StoreType;
  businessType?: string | null;
  gstNumber?: string | null;
  licenseInfo?: string | null;
  phone?: string | null;
  email?: string | null;
  addressLine?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  pincode?: string | null;
  lat?: number | null;
  lng?: number | null;
  visibilityType?: string | null;
  status?: StoreStatus;
  approvalStatus?: StoreApprovalStatus;
  /** Set by an admin when `approvalStatus` is `"rejected"`. Not confirmed against a live
   * rejected-store response (no seeded fixture had one), but the seller-facing dashboard
   * needs somewhere to read the reason from, so it's modeled here rather than guessed inline. */
  rejectionReason?: string | null;
  isVerified?: boolean;
  avgRating?: number;
  reviewCount?: number;

  // Present on `GET /stores/:idOrSlug`; may be omitted from list endpoints.
  workingHours?: StoreWorkingHour[];
  deliverySettings?: StoreDeliverySettings | null;

  // Computed fields, only present on `GET /stores/nearby`.
  distanceKm?: number;
  isOpenNow?: boolean;
}
