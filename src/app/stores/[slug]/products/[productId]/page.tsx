"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  CalendarClock,
  Clock,
  Heart,
  Minus,
  Plus,
  RotateCcw,
  ShoppingCart,
  Store as StoreIcon,
  Truck,
} from "lucide-react";
import { toast } from "sonner";

import { RatingStars } from "@/components/shared/rating-stars";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ROUTES } from "@/constants/routes";
import { useAddToCart } from "@/features/cart/hooks";
import {
  addonSelectionError,
  addonSelectionTotal,
  tracksStock,
  unavailableLabel,
  type AddonSelection,
} from "@/features/products/availability";
import { AddonSelector } from "@/features/products/components/addon-selector";
import { FoodTypeMark, PrescriptionBadge } from "@/features/products/components/product-badges";
import { DELIVERY_TYPE_LABEL, effectiveDeliveryType } from "@/features/products/delivery";
import { ProductGallery } from "@/features/products/components/product-gallery";
import { ProductReviews } from "@/features/products/components/product-reviews";
import { useProduct } from "@/features/products/hooks";
import { useToggleWishlist, useWishlistCheck } from "@/features/wishlist/hooks";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth-store";

function StockBadge({ quantity, unavailable }: { quantity: number; unavailable: string | null }) {
  if (unavailable) {
    return <Badge variant="destructive">{unavailable}</Badge>;
  }
  if (!Number.isFinite(quantity)) {
    return (
      <Badge variant="secondary" className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
        Available
      </Badge>
    );
  }
  if (quantity <= 5) {
    return (
      <Badge variant="secondary" className="bg-amber-500/15 text-amber-600 dark:text-amber-400">
        Only {quantity} left
      </Badge>
    );
  }
  return (
    <Badge variant="secondary" className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
      In stock
    </Badge>
  );
}

function ProductDetailSkeleton() {
  return (
    <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-8 px-4 py-8 sm:px-6 lg:grid-cols-2 lg:px-8">
      <Skeleton className="aspect-square w-full rounded-lg" />
      <div className="flex flex-col gap-3">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-24 w-full" />
      </div>
    </div>
  );
}

export default function ProductDetailPage() {
  const params = useParams<{ slug: string; productId: string }>();
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [selectedVariantId, setSelectedVariantId] = useState<string | undefined>(undefined);
  const [addonSelection, setAddonSelection] = useState<AddonSelection>({});

  const productQuery = useProduct(params.productId);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const product = productQuery.data;
  const selectedVariant = useMemo(
    () => product?.variants?.find((v) => v.id === selectedVariantId),
    [product, selectedVariantId]
  );

  const wishlistCheck = useWishlistCheck("product", product?.id);
  const toggleWishlist = useToggleWishlist("product", product?.id ?? "");
  const wishlisted = wishlistCheck.data?.wishlisted ?? false;
  const addToCart = useAddToCart();

  if (productQuery.isLoading) {
    return <ProductDetailSkeleton />;
  }

  if (productQuery.isError || !product) {
    return (
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-3 px-4 py-16 text-center">
        <h1 className="text-xl font-semibold text-foreground">Product not found</h1>
        <p className="text-sm text-muted-foreground">
          This product may have been removed or the link is incorrect.
        </p>
        <Button asChild size="sm">
          <Link href={ROUTES.storeDetail(params.slug)}>Back to store</Link>
        </Button>
      </div>
    );
  }

  const addonGroups = product.addonGroups ?? [];
  const isTracked = tracksStock(product);
  // Untracked (made-to-order) products have no stock limit.
  const stock = isTracked ? (selectedVariant?.stockQuantity ?? product.stockQuantity) : Infinity;
  const unavailable = unavailableLabel(product, stock);
  const addonError = addonSelectionError(addonGroups, addonSelection);

  const effectivePrice =
    (typeof product.discountPrice === "number" && product.discountPrice < product.price
      ? product.discountPrice
      : product.price) +
    (selectedVariant?.priceDelta ?? 0) +
    addonSelectionTotal(addonGroups, addonSelection);
  const hasDiscount =
    typeof product.discountPrice === "number" && product.discountPrice < product.price;

  function handleAddToCart() {
    if (!isAuthenticated) {
      toast.error("Log in to add items to your cart.", {
        action: { label: "Log in", onClick: () => router.push(ROUTES.login) },
      });
      return;
    }
    if (addonError) {
      toast.error(addonError);
      return;
    }
    addToCart.mutate({
      productId: product!.id,
      variantId: selectedVariant?.id,
      addonOptionIds: Object.values(addonSelection).flat(),
      quantity,
    });
  }

  function handleWishlistClick() {
    if (!isAuthenticated) {
      toast.error("Log in to save items to your wishlist.", {
        action: { label: "Log in", onClick: () => router.push(ROUTES.login) },
      });
      return;
    }
    toggleWishlist.mutate(wishlisted);
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <ProductGallery images={product.images} productName={product.name} />

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <Link
              href={ROUTES.storeDetail(product.store.slug)}
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
            >
              <StoreIcon className="size-3.5" />
              {product.store.name}
            </Link>
            <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-foreground">
              {product.foodType && <FoodTypeMark foodType={product.foodType} />}
              {product.name}
            </h1>
            {product.brand && <p className="text-sm text-muted-foreground">by {product.brand}</p>}
            {product.composition && (
              <p className="text-sm text-muted-foreground">Contains: {product.composition}</p>
            )}
          </div>

          {product.requiresPrescription && (
            <div className="flex flex-col gap-1">
              <PrescriptionBadge className="w-fit" />
              <p className="text-xs text-muted-foreground">
                You&apos;ll upload a prescription at checkout. The pharmacy checks it before
                accepting your order.
              </p>
            </div>
          )}

          <RatingStars rating={product.avgRating ?? 0} reviewCount={product.reviewCount} size="md" />

          <div className="flex items-center gap-3">
            <span className="text-2xl font-bold text-foreground">
              ₹{effectivePrice.toLocaleString()}
            </span>
            {hasDiscount && (
              <span className="text-base text-muted-foreground line-through">
                ₹{product.price.toLocaleString()}
              </span>
            )}
            <StockBadge quantity={stock} unavailable={unavailable} />
          </div>

          {product.variants && product.variants.length > 0 && (
            <div className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-foreground">Variant</span>
              <Select value={selectedVariantId} onValueChange={setSelectedVariantId}>
                <SelectTrigger className="w-full sm:w-64">
                  <SelectValue placeholder="Choose a variant" />
                </SelectTrigger>
                <SelectContent>
                  {product.variants.map((variant) => (
                    <SelectItem
                      key={variant.id}
                      value={variant.id}
                      disabled={isTracked && variant.stockQuantity <= 0}
                    >
                      {variant.name}
                      {variant.priceDelta ? ` (+₹${variant.priceDelta.toLocaleString()})` : ""}
                      {isTracked && variant.stockQuantity <= 0 ? " (out of stock)" : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {addonGroups.length > 0 && (
            <AddonSelector groups={addonGroups} value={addonSelection} onChange={setAddonSelection} />
          )}

          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-foreground">Quantity</span>
            <div className="flex w-fit items-center rounded-md border border-input">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="rounded-r-none"
                disabled={quantity <= 1}
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                aria-label="Decrease quantity"
              >
                <Minus className="size-4" />
              </Button>
              <span className="w-10 text-center text-sm font-medium tabular-nums">{quantity}</span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="rounded-l-none"
                onClick={() => setQuantity((q) => q + 1)}
                aria-label="Increase quantity"
              >
                <Plus className="size-4" />
              </Button>
            </div>
          </div>

          <div className="flex gap-2 pt-1">
            <Button
              className="flex-1 gap-2"
              size="lg"
              disabled={!!unavailable || addToCart.isPending}
              onClick={handleAddToCart}
            >
              <ShoppingCart className="size-4" />
              {unavailable ?? "Add to cart"}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="gap-2"
              disabled={toggleWishlist.isPending}
              onClick={handleWishlistClick}
              aria-pressed={wishlisted}
            >
              <Heart className={cn("size-4", wishlisted && "fill-destructive text-destructive")} />
              {wishlisted ? "Saved" : "Save"}
            </Button>
          </div>

          <div className="mt-2 flex flex-col gap-2 rounded-lg border border-border p-4 text-sm text-muted-foreground">
            {!!product.preparationTimeMins && (
              <span className="flex items-center gap-2">
                <Clock className="size-4 shrink-0" />
                Ready in about {product.preparationTimeMins} min
              </span>
            )}
            {product.expiryDate && (
              <span className="flex items-center gap-2">
                <CalendarClock className="size-4 shrink-0" />
                Expires{" "}
                {new Date(`${product.expiryDate}T00:00:00`).toLocaleDateString(undefined, {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </span>
            )}
            {product.store.deliverySettings && (
              <span className="flex items-center gap-2">
                <Truck className="size-4 shrink-0" />
                {
                  DELIVERY_TYPE_LABEL[
                    effectiveDeliveryType(product.store.deliverySettings.mode, product.deliveryType)
                  ]
                }
              </span>
            )}
            {product.returnPolicy && (
              <span className="flex items-center gap-2">
                <RotateCcw className="size-4 shrink-0" />
                {product.returnPolicy}
              </span>
            )}
          </div>

          {product.description && (
            <div className="flex flex-col gap-1.5 pt-2">
              <h2 className="text-sm font-semibold text-foreground">Description</h2>
              <p className="text-sm whitespace-pre-line text-muted-foreground">
                {product.description}
              </p>
            </div>
          )}
        </div>
      </div>

      <ProductReviews
        productId={product.id}
        avgRating={product.avgRating}
        reviewCount={product.reviewCount}
      />
    </div>
  );
}
