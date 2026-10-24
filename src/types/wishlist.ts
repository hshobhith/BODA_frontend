import type { ReviewTargetType } from "@/types/review";

/** Wishlist targets reuse the same product/store union as reviews. */
export type WishlistTargetType = ReviewTargetType;

/** Hydrated summary for a wishlisted product, as returned nested under `target`. */
export interface WishlistProductSummary {
  id: string;
  name: string;
  slug: string;
  price: number;
  discountPrice?: number | null;
  imageUrl?: string | null;
  avgRating: number;
  storeSlug: string;
}

/** Hydrated summary for a wishlisted store, as returned nested under `target`. */
export interface WishlistStoreSummary {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string | null;
  avgRating: number;
}

/**
 * `GET /wishlist` item shape. `target` is `null` when the underlying
 * product/store was deleted after being wishlisted (dropped silently by the
 * backend rather than erroring the whole list — see `WishlistService.hydrateTargets`).
 */
export interface WishlistItem {
  id: string;
  targetType: WishlistTargetType;
  targetId: string;
  createdAt?: string;
  target?: WishlistProductSummary | WishlistStoreSummary | null;
}

export interface WishlistCheckResponse {
  wishlisted: boolean;
}
