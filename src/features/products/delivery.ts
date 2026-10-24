import type { ProductDeliveryType } from "@/types/product";
import type { StoreDeliveryMode } from "@/types/store";

export type EffectiveDeliveryType = "pickup" | "delivery" | "both";

/**
 * How a product can actually be received. A store that offers only one
 * method (Store settings → Delivery) applies it to every product; only a
 * store offering both lets each product pick its own. The product's saved
 * choice is left alone, so it comes back if the store offers both again.
 *
 * Mirrors `effectiveDeliveryType` in the backend (products/product-delivery.ts),
 * which enforces it when an order is placed.
 */
export function effectiveDeliveryType(
  storeMode: StoreDeliveryMode | null | undefined,
  productType: ProductDeliveryType | null | undefined
): EffectiveDeliveryType {
  if (storeMode === "pickup_only") return "pickup";
  if (storeMode === "delivery") return "delivery";
  if (productType === "pickup") return "pickup";
  if (productType === "delivery") return "delivery";
  return "both";
}

export function allowsPickup(type: EffectiveDeliveryType) {
  return type !== "delivery";
}

export function allowsDelivery(type: EffectiveDeliveryType) {
  return type !== "pickup";
}

/** Customer-facing wording, e.g. on the product page. */
export const DELIVERY_TYPE_LABEL: Record<EffectiveDeliveryType, string> = {
  both: "Delivery & pickup available",
  pickup: "Pickup only",
  delivery: "Delivery only",
};
