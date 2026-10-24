import { Star } from "lucide-react";

import { cn } from "@/lib/utils";

interface RatingStarsProps {
  /** Average rating, typically 0-5. */
  rating: number;
  /** Optional review count, rendered next to the stars if provided. */
  reviewCount?: number;
  size?: "sm" | "md" | "lg";
  className?: string;
  /** Hide the numeric review count even if provided. */
  hideCount?: boolean;
}

const SIZE_CLASSES: Record<NonNullable<RatingStarsProps["size"]>, string> = {
  sm: "size-3",
  md: "size-4",
  lg: "size-5",
};

/**
 * Read-only star rating display, used on store/product cards, headers, and
 * review summaries. Renders 5 stars, partially/fully filled based on
 * `rating`, plus an optional review count.
 */
export function RatingStars({
  rating,
  reviewCount,
  size = "sm",
  className,
  hideCount = false,
}: RatingStarsProps) {
  const clampedRating = Math.max(0, Math.min(5, rating || 0));
  const starClass = SIZE_CLASSES[size];

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <div className="flex items-center" aria-hidden="true">
        {Array.from({ length: 5 }).map((_, i) => {
          const fillPercent = Math.max(0, Math.min(1, clampedRating - i)) * 100;
          return (
            <span key={i} className="relative inline-flex">
              <Star className={cn(starClass, "text-muted-foreground/30")} />
              <span
                className="absolute inset-0 overflow-hidden"
                style={{ width: `${fillPercent}%` }}
              >
                <Star className={cn(starClass, "fill-amber-400 text-amber-400")} />
              </span>
            </span>
          );
        })}
      </div>
      <span className="sr-only">{clampedRating.toFixed(1)} out of 5 stars</span>
      {!hideCount && (
        <span className="text-xs text-muted-foreground">
          {clampedRating > 0 ? clampedRating.toFixed(1) : "New"}
          {typeof reviewCount === "number" && (
            <> ({reviewCount.toLocaleString()})</>
          )}
        </span>
      )}
    </div>
  );
}
