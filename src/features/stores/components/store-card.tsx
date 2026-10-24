import type { MouseEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BadgeCheck, Bike, Heart, MapPin, ShoppingBag, Store as StoreIcon } from "lucide-react";
import { toast } from "sonner";

import { RatingStars } from "@/components/shared/rating-stars";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ROUTES } from "@/constants/routes";
import { useToggleWishlist, useWishlistCheck } from "@/features/wishlist/hooks";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth-store";
import type { Store } from "@/types/store";

interface StoreCardProps {
  store: Store;
  className?: string;
}

function StoreWishlistButton({ store }: { store: Store }) {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { data: check } = useWishlistCheck("store", store.id);
  const toggle = useToggleWishlist("store", store.id);
  const wishlisted = check?.wishlisted ?? false;

  function handleClick(e: MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.error("Log in to save stores to your wishlist.", {
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

/** Store logo/thumbnail with an icon fallback when there's no `logoUrl`. */
function StoreThumbnail({ store }: { store: Store }) {
  if (store.logoUrl) {
    return (
      <Image
        src={store.logoUrl}
        alt=""
        fill
        sizes="(min-width: 1024px) 20vw, 50vw"
        className="object-cover"
      />
    );
  }
  return (
    <div className="flex size-full items-center justify-center bg-muted">
      <StoreIcon className="size-8 text-muted-foreground" />
    </div>
  );
}

export function StoreCard({ store, className }: StoreCardProps) {
  const deliveryMode = store.deliverySettings?.mode;

  return (
    <Link href={ROUTES.storeDetail(store.slug)} className={cn("group block", className)}>
      <Card className="h-full overflow-hidden transition-shadow group-hover:shadow-md">
        <div className="relative aspect-video w-full overflow-hidden bg-muted">
          <StoreThumbnail store={store} />
          {typeof store.isOpenNow === "boolean" && (
            <Badge
              variant={store.isOpenNow ? "default" : "secondary"}
              className={cn(
                "absolute top-2 left-2",
                store.isOpenNow ? "bg-emerald-600 text-white" : "bg-muted text-muted-foreground"
              )}
            >
              {store.isOpenNow ? "Open now" : "Closed"}
            </Badge>
          )}
          <StoreWishlistButton store={store} />
        </div>
        <div className="flex flex-col gap-1.5 px-4 pb-4">
          <div className="flex items-start justify-between gap-2">
            <h3 className="line-clamp-1 text-sm font-semibold text-foreground">{store.name}</h3>
            {store.isVerified && (
              <BadgeCheck className="mt-0.5 size-4 shrink-0 text-primary" aria-label="Verified store" />
            )}
          </div>
          {store.businessType && (
            <p className="line-clamp-1 text-xs text-muted-foreground">{store.businessType}</p>
          )}
          <RatingStars rating={store.avgRating ?? 0} reviewCount={store.reviewCount} />
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            {typeof store.distanceKm === "number" && (
              <span className="flex items-center gap-1">
                <MapPin className="size-3.5" />
                {store.distanceKm < 1
                  ? `${Math.round(store.distanceKm * 1000)} m away`
                  : `${store.distanceKm.toFixed(1)} km away`}
              </span>
            )}
            {(deliveryMode === "delivery" || deliveryMode === "both") && (
              <span className="flex items-center gap-1">
                <Bike className="size-3.5" />
                Delivery
              </span>
            )}
            {(deliveryMode === "pickup_only" || deliveryMode === "both") && (
              <span className="flex items-center gap-1">
                <ShoppingBag className="size-3.5" />
                Pickup
              </span>
            )}
          </div>
        </div>
      </Card>
    </Link>
  );
}
