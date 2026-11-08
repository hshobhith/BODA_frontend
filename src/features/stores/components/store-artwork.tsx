import { Pill, ShoppingBasket, UtensilsCrossed, type LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import type { StoreType } from "@/types/store";
import { STORE_TYPE_SHORT_LABEL, storeGradient, storeInitial } from "../images";

const TYPE_ICON: Record<StoreType, LucideIcon> = {
  retail: ShoppingBasket,
  restaurant: UtensilsCrossed,
  pharmacy: Pill,
};

// Soft dotted texture over the gradient.
const DOTS = {
  backgroundImage: "radial-gradient(rgba(255,255,255,0.22) 1px, transparent 1px)",
  backgroundSize: "14px 14px",
};

interface StoreArtworkProps {
  name: string;
  storeType?: StoreType | null;
  /**
   * `thumb` — card image: the store's initial in a frosted tile.
   * `cover` — wide store-page banner: type chip, big icon (the name is shown below it).
   * `logo` — square logo slot: just the initial.
   */
  variant: "thumb" | "cover" | "logo";
  className?: string;
}

/**
 * Colourful stand-in for a store's missing logo or banner: a gradient unique
 * to the store, a dotted texture, and its type's icon — so stores without
 * pictures still look finished instead of showing a blank grey box.
 */
export function StoreArtwork({ name, storeType, variant, className }: StoreArtworkProps) {
  const type = storeType ?? "retail";
  const Icon = TYPE_ICON[type];

  return (
    <div
      aria-hidden
      className={cn(
        "relative flex size-full items-center justify-center overflow-hidden bg-gradient-to-br text-white",
        storeGradient(name),
        className
      )}
    >
      {variant !== "logo" && (
        <>
          <div className="absolute inset-0" style={DOTS} />
          <div className="absolute -top-10 -right-10 size-40 rounded-full bg-white/15" />
          <div className="absolute -bottom-12 -left-8 size-32 rounded-full bg-white/10" />
          <Icon
            className={cn(
              "absolute -rotate-12 text-white/25",
              variant === "cover" ? "right-6 bottom-2 size-28 sm:size-36" : "right-3 bottom-1 size-16"
            )}
            strokeWidth={1.5}
          />
        </>
      )}

      {variant === "thumb" && (
        <span className="relative flex size-14 items-center justify-center rounded-2xl bg-white/20 text-2xl font-bold shadow-sm ring-1 ring-white/30 backdrop-blur-sm">
          {storeInitial(name)}
        </span>
      )}

      {variant === "cover" && (
        <span className="absolute top-3 left-3 flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold ring-1 ring-white/30 backdrop-blur-sm">
          <Icon className="size-3.5" />
          {STORE_TYPE_SHORT_LABEL[type]}
        </span>
      )}

      {variant === "logo" && (
        <span className="text-3xl font-bold sm:text-4xl">{storeInitial(name)}</span>
      )}
    </div>
  );
}
