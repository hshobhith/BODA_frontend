import Image from "next/image";
import { useRouter } from "next/navigation";
import { BadgeCheck, Heart, Mail, MapPin, Phone, Store as StoreIcon } from "lucide-react";
import { toast } from "sonner";

import { RatingStars } from "@/components/shared/rating-stars";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import { useToggleWishlist, useWishlistCheck } from "@/features/wishlist/hooks";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth-store";
import { STORE_TYPE_META, type Store } from "@/types/store";

interface StoreHeaderProps {
  store: Store;
  className?: string;
}

function StoreWishlistButton({ store }: { store: Store }) {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { data: check } = useWishlistCheck("store", store.id);
  const toggle = useToggleWishlist("store", store.id);
  const wishlisted = check?.wishlisted ?? false;

  function handleClick() {
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
      variant="outline"
      size="sm"
      className="gap-1.5"
      aria-pressed={wishlisted}
      disabled={toggle.isPending}
      onClick={handleClick}
    >
      <Heart className={cn("size-4", wishlisted && "fill-destructive text-destructive")} />
      {wishlisted ? "Saved" : "Save"}
    </Button>
  );
}

/** Banner + logo + name + rating + status + contact info for the store detail page. */
export function StoreHeader({ store, className }: StoreHeaderProps) {
  const address = [store.addressLine, store.city, store.state, store.pincode]
    .filter(Boolean)
    .join(", ");

  return (
    <div className={cn("flex flex-col", className)}>
      <div className="relative h-32 w-full overflow-hidden rounded-lg bg-muted sm:h-48">
        {store.bannerUrl ? (
          <Image
            src={store.bannerUrl}
            alt=""
            fill
            sizes="100vw"
            className="object-cover"
            priority
          />
        ) : (
          <div className="size-full bg-gradient-to-br from-accent to-muted" />
        )}
      </div>

      <div className="flex flex-col gap-3 px-1 sm:flex-row sm:items-end sm:gap-4">
        <div className="relative -mt-10 size-20 shrink-0 overflow-hidden rounded-xl border-4 border-background bg-card shadow-sm sm:-mt-12 sm:size-24">
          {store.logoUrl ? (
            <Image src={store.logoUrl} alt="" fill sizes="96px" className="object-cover" />
          ) : (
            <div className="flex size-full items-center justify-center bg-muted">
              <StoreIcon className="size-8 text-muted-foreground" />
            </div>
          )}
        </div>

        <div className="flex flex-1 flex-col gap-1.5 pt-2 sm:pt-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
              {store.name}
            </h1>
            {store.isVerified && (
              <Badge className="gap-1 bg-primary/10 text-primary" variant="secondary">
                <BadgeCheck className="size-3.5" />
                Verified
              </Badge>
            )}
            {typeof store.isOpenNow === "boolean" && (
              <Badge
                variant={store.isOpenNow ? "default" : "secondary"}
                className={store.isOpenNow ? "bg-emerald-600 text-white" : undefined}
              >
                {store.isOpenNow ? "Open now" : "Closed"}
              </Badge>
            )}
            <StoreWishlistButton store={store} />
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
            <RatingStars rating={store.avgRating ?? 0} reviewCount={store.reviewCount} size="md" />
            {store.storeType && store.storeType !== "retail" && (
              <span className="font-medium text-foreground">{STORE_TYPE_META[store.storeType].label}</span>
            )}
            {store.businessType && <span>{store.businessType}</span>}
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
            {address &&
              (typeof store.lat === "number" && typeof store.lng === "number" ? (
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${store.lat},${store.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 hover:text-foreground hover:underline"
                  title="Open this store's exact location in Google Maps"
                >
                  <MapPin className="size-4 shrink-0" />
                  {address}
                </a>
              ) : (
                <span className="flex items-center gap-1.5">
                  <MapPin className="size-4 shrink-0" />
                  {address}
                </span>
              ))}
            {store.phone && (
              <a href={`tel:${store.phone}`} className="flex items-center gap-1.5 hover:text-foreground">
                <Phone className="size-4 shrink-0" />
                {store.phone}
              </a>
            )}
            {store.email && (
              <a
                href={`mailto:${store.email}`}
                className="flex items-center gap-1.5 hover:text-foreground"
              >
                <Mail className="size-4 shrink-0" />
                {store.email}
              </a>
            )}
          </div>
        </div>
      </div>

      {store.description && (
        <p className="mt-4 max-w-3xl text-sm text-muted-foreground">{store.description}</p>
      )}
    </div>
  );
}
