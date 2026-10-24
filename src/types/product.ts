import type { StoreDeliverySettings, StoreType } from "@/types/store";

/**
 * Product types.
 *
 * As with `types/store.ts`, string-enum-ish fields (`deliveryType`, `status`)
 * are kept loose since exact backend enum values weren't confirmed via live
 * integration testing when this was written.
 */

export interface ProductImage {
  url: string;
  sortOrder: number;
}

export interface ProductVideo {
  url: string;
  sortOrder?: number;
}

export interface ProductVariant {
  id: string;
  name: string;
  sku: string;
  priceDelta: number;
  stockQuantity: number;
}

/** Minimal store info embedded in a product payload. */
export interface ProductStoreSummary {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string | null;
  city?: string | null;
  isVerified?: boolean;
  avgRating?: number;
  storeType?: StoreType;
  /** Only on the public product detail; its `mode` decides the product's delivery options. */
  deliverySettings?: StoreDeliverySettings | null;
}

/** Minimal category info embedded in a product payload. */
export interface ProductCategorySummary {
  id: string;
  name: string;
  slug: string;
}

/** Restaurant dietary marker. */
export type FoodType = "veg" | "non_veg" | "egg";

export const FOOD_TYPE_META: Record<FoodType, { label: string; className: string }> = {
  veg: { label: "Veg", className: "border-green-600 text-green-600" },
  non_veg: { label: "Non-veg", className: "border-red-600 text-red-600" },
  egg: { label: "Contains egg", className: "border-amber-600 text-amber-600" },
};

export interface ProductAddonOption {
  id: string;
  name: string;
  price: number;
  isAvailable: boolean;
}

/** A customization choice, e.g. "Extras" (pick 0-3). `minSelect > 0` makes it required. */
export interface ProductAddonGroup {
  id: string;
  name: string;
  minSelect: number;
  maxSelect: number;
  options: ProductAddonOption[];
}

export type ProductStatus = "active" | "inactive" | "draft" | (string & {});
export type ProductDeliveryType = "delivery" | "pickup" | "both" | (string & {});

export interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  sku?: string | null;
  barcode?: string | null;
  brand?: string | null;
  price: number;
  discountPrice?: number | null;
  stockQuantity: number;
  /** false = made-to-order: stock isn't counted, `isAvailable` is the on/off switch. */
  trackInventory?: boolean;
  /** Seller's sold-out switch. */
  isAvailable?: boolean;
  weight?: number | null;
  deliveryType?: ProductDeliveryType | null;
  returnPolicy?: string | null;
  status?: ProductStatus;
  avgRating?: number;
  reviewCount?: number;
  tags?: string[];
  // Restaurant
  foodType?: FoodType | null;
  preparationTimeMins?: number | null;
  addonGroups?: ProductAddonGroup[];
  // Pharmacy
  requiresPrescription?: boolean;
  composition?: string | null;
  /** 'YYYY-MM-DD'; expired products can't be bought. */
  expiryDate?: string | null;
  images: ProductImage[];
  videos?: ProductVideo[];
  variants?: ProductVariant[];
  store: ProductStoreSummary;
  category?: ProductCategorySummary | null;
}
