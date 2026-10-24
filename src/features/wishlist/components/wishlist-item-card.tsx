"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, ImageOff } from "lucide-react";

import { RatingStars } from "@/components/shared/rating-stars";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ROUTES } from "@/constants/routes";
import { useToggleWishlist } from "@/features/wishlist/hooks";
import type { WishlistItem } from "@/types/wishlist";

interface WishlistItemCardProps {
  item: WishlistItem;
}

/**
 * Renders a single wishlisted product or store from the hydrated `target`
 * summary. Deliberately separate from `ProductCard`/`StoreCard`, which expect
 * the full `Product`/`Store` types the wishlist list endpoint doesn't return.
 */
export function WishlistItemCard({ item }: WishlistItemCardProps) {
  const toggle = useToggleWishlist(item.targetType, item.targetId);

  if (!item.target) {
    return null;
  }

  const isProduct = item.targetType === "product";
  const href = isProduct
    ? ROUTES.storeProductDetail(
        (item.target as { storeSlug: string }).storeSlug,
        item.target.slug
      )
    : ROUTES.storeDetail(item.target.slug);
  const imageUrl = isProduct
    ? (item.target as { imageUrl?: string | null }).imageUrl
    : (item.target as { logoUrl?: string | null }).logoUrl;

  return (
    <Card className="group relative h-full overflow-hidden transition-shadow hover:shadow-md">
      <Button
        type="button"
        size="icon"
        variant="secondary"
        className="absolute top-2 right-2 z-10 size-8 rounded-full shadow-sm"
        aria-label="Remove from wishlist"
        disabled={toggle.isPending}
        onClick={() => toggle.mutate(true)}
      >
        <Heart className="size-4 fill-destructive text-destructive" />
      </Button>
      <Link href={href} className="block">
        <div className="relative aspect-square w-full overflow-hidden bg-muted">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={item.target.name}
              fill
              sizes="(min-width: 1024px) 20vw, 50vw"
              className="object-cover transition-transform group-hover:scale-105"
            />
          ) : (
            <div className="flex size-full items-center justify-center">
              <ImageOff className="size-8 text-muted-foreground" />
            </div>
          )}
        </div>
        <div className="flex flex-col gap-1 px-4 py-3">
          <h3 className="line-clamp-2 text-sm font-medium text-foreground">{item.target.name}</h3>
          <RatingStars rating={item.target.avgRating ?? 0} />
          {isProduct && (
            <div className="mt-1 flex items-center gap-2">
              <span className="text-sm font-semibold text-foreground">
                ₹
                {(
                  (item.target as { discountPrice?: number | null; price: number }).discountPrice ??
                  (item.target as { price: number }).price
                ).toLocaleString()}
              </span>
              {typeof (item.target as { discountPrice?: number | null }).discountPrice === "number" && (
                <span className="text-xs text-muted-foreground line-through">
                  ₹{(item.target as { price: number }).price.toLocaleString()}
                </span>
              )}
            </div>
          )}
        </div>
      </Link>
    </Card>
  );
}
