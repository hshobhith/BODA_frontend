"use client";

import type { MouseEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart, ImageOff } from "lucide-react";
import { toast } from "sonner";

import { RatingStars } from "@/components/shared/rating-stars";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ROUTES } from "@/constants/routes";
import { useToggleWishlist, useWishlistCheck } from "@/features/wishlist/hooks";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth-store";
import type { Product } from "@/types/product";
import { unavailableLabel } from "../availability";
import { FoodTypeMark } from "./product-badges";

interface ProductCardProps {
  product: Product;
  className?: string;
}

function WishlistButton({ product }: { product: Product }) {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { data: check } = useWishlistCheck("product", product.id);
  const toggle = useToggleWishlist("product", product.id);
  const wishlisted = check?.wishlisted ?? false;

  function handleClick(e: MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.error("Log in to save items to your wishlist.", {
        action: { label: "Log in", onClick: () => router.push(ROUTES.login) },
      });
      return;
    }

    toggle.mutate(wishlisted);
  }

  return (
    <Button
      type="button"
      size="icon"
      variant="secondary"
      className="absolute top-2 right-2 size-8 rounded-full shadow-sm"
      aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
      aria-pressed={wishlisted}
      disabled={toggle.isPending}
      onClick={handleClick}
    >
      <Heart className={cn("size-4", wishlisted && "fill-destructive text-destructive")} />
    </Button>
  );
}

export function ProductCard({ product, className }: ProductCardProps) {
  const primaryImage = [...product.images].sort((a, b) => a.sortOrder - b.sortOrder)[0];
  const hasDiscount =
    typeof product.discountPrice === "number" && product.discountPrice < product.price;
  const unavailable = unavailableLabel(product);
  const href = ROUTES.storeProductDetail(product.store.slug, product.slug || product.id);

  return (
    <Link href={href} className={cn("group block", className)}>
      <Card className="h-full overflow-hidden transition-shadow group-hover:shadow-md">
        <div className="relative aspect-square w-full overflow-hidden bg-muted">
          {primaryImage ? (
            <Image
              src={primaryImage.url}
              alt={product.name}
              fill
              sizes="(min-width: 1024px) 20vw, 50vw"
              className="object-cover transition-transform group-hover:scale-105"
            />
          ) : (
            <div className="flex size-full items-center justify-center">
              <ImageOff className="size-8 text-muted-foreground" />
            </div>
          )}
          <WishlistButton product={product} />
          {unavailable && (
            <Badge variant="secondary" className="absolute bottom-2 left-2 bg-background/90">
              {unavailable}
            </Badge>
          )}
          {product.requiresPrescription && (
            <Badge
              variant="secondary"
              className="absolute top-2 left-2 bg-background/90 text-sky-700 dark:text-sky-400"
            >
              Rx
            </Badge>
          )}
        </div>
        <div className="flex flex-col gap-1 px-4 pb-4">
          <p className="line-clamp-1 text-xs text-muted-foreground">{product.store.name}</p>
          <h3 className="line-clamp-2 text-sm font-medium text-foreground">
            {product.foodType && (
              <FoodTypeMark foodType={product.foodType} className="mr-1.5 align-[-2px]" />
            )}
            {product.name}
          </h3>
          <RatingStars rating={product.avgRating ?? 0} reviewCount={product.reviewCount} />
          <div className="mt-1 flex items-center gap-2">
            <span className="text-sm font-semibold text-foreground">
              ₹{(hasDiscount ? product.discountPrice! : product.price).toLocaleString()}
            </span>
            {hasDiscount && (
              <span className="text-xs text-muted-foreground line-through">
                ₹{product.price.toLocaleString()}
              </span>
            )}
          </div>
        </div>
      </Card>
    </Link>
  );
}
