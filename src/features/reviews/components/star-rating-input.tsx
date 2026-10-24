"use client";

import { useState } from "react";
import { Star } from "lucide-react";

import { cn } from "@/lib/utils";

interface StarRatingInputProps {
  value: number;
  onChange: (value: number) => void;
  className?: string;
}

/** Clickable 1-5 star rating input, used by the write-a-review form. */
export function StarRatingInput({ value, onChange, className }: StarRatingInputProps) {
  const [hovered, setHovered] = useState<number | null>(null);
  const active = hovered ?? value;

  return (
    <div
      className={cn("flex items-center gap-1", className)}
      onMouseLeave={() => setHovered(null)}
    >
      {Array.from({ length: 5 }).map((_, i) => {
        const starValue = i + 1;
        const filled = starValue <= active;
        return (
          <button
            key={starValue}
            type="button"
            onClick={() => onChange(starValue)}
            onMouseEnter={() => setHovered(starValue)}
            className="p-0.5"
            aria-label={`${starValue} star${starValue === 1 ? "" : "s"}`}
          >
            <Star
              className={cn(
                "size-6 transition-colors",
                filled ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"
              )}
            />
          </button>
        );
      })}
    </div>
  );
}
