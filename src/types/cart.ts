import type { FoodType, ProductDeliveryType } from "@/types/product";

/**
 * The `product` embedded in a cart item is a LIGHTER shape than the full
 * `Product` type used on browse/detail pages — confirmed live against
 * GET /cart: no `images`, no nested `store`/`category` objects (just the raw
 * `storeId`/`categoryId`). Cart rows fall back to a placeholder icon instead
 * of a product image because of this; wiring a thumbnail through would need
 * a small backend change to include at least the primary image.
 */
export interface CartProductSummary {
  id: string;
  storeId: string;
  categoryId: string;
  name: string;
  slug: string;
  description?: string | null;
  sku?: string | null;
  brand?: string | null;
  price: number;
  discountPrice?: number | null;
  stockQuantity: number;
  lowStockThreshold: number;
  status: string;
  trackInventory?: boolean;
  isAvailable?: boolean;
  foodType?: FoodType | null;
  requiresPrescription?: boolean;
  expiryDate?: string | null;
  /** The product's own choice; see features/products/delivery.ts for what applies. */
  deliveryType?: ProductDeliveryType | null;
}

/** A chosen add-on, resolved against the product's current menu. */
export interface CartItemAddon {
  groupId: string;
  groupName: string;
  optionId: string;
  name: string;
  price: number;
}

/** Confirmed live against GET /cart and GET /cart/saved-for-later. */
export interface CartItem {
  id: string;
  productId: string;
  variantId: string | null;
  addonOptionIds: string[];
  /** Prices are already included in `unitPrice`. */
  addons: CartItemAddon[];
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  insufficientStock: boolean;
  /** null when the product doesn't track stock (made-to-order). */
  availableStock: number | null;
  /** Why this line can't be checked out (sold out, expired, add-ons changed), or null. */
  unavailableReason: string | null;
  product: CartProductSummary;
  variant: { id: string; name: string; sku?: string | null; priceDelta: number } | null;
  createdAt: string;
  updatedAt: string;
}

export interface CartSummary {
  items: CartItem[];
  subtotal: number;
  hasInsufficientStock: boolean;
  hasUnavailableItems: boolean;
}

export interface AddToCartPayload {
  productId: string;
  variantId?: string;
  addonOptionIds?: string[];
  quantity: number;
}

export interface UpdateCartItemPayload {
  quantity: number;
}
