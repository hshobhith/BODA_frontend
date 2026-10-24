"use client";

import { useState } from "react";
import Image from "next/image";
import { ImageOff } from "lucide-react";

import { cn } from "@/lib/utils";
import type { ProductImage } from "@/types/product";

interface ProductGalleryProps {
  images: ProductImage[];
  productName: string;
  className?: string;
}

/** Simple thumbnail-click-to-main-image gallery for the product detail page. */
export function ProductGallery({ images, productName, className }: ProductGalleryProps) {
  const sorted = [...images].sort((a, b) => a.sortOrder - b.sortOrder);
  const [activeIndex, setActiveIndex] = useState(0);
  const active = sorted[activeIndex];

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <div className="relative aspect-square w-full overflow-hidden rounded-lg border border-border bg-muted">
        {active ? (
          <Image
            key={active.url}
            src={active.url}
            alt={productName}
            fill
            priority
            sizes="(min-width: 1024px) 40vw, 100vw"
            className="object-contain"
          />
        ) : (
          <div className="flex size-full items-center justify-center">
            <ImageOff className="size-10 text-muted-foreground" />
          </div>
        )}
      </div>

      {sorted.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {sorted.map((image, index) => (
            <button
              key={image.url}
              type="button"
              onClick={() => setActiveIndex(index)}
              aria-label={`Show image ${index + 1}`}
              aria-current={index === activeIndex}
              className={cn(
                "relative size-16 shrink-0 overflow-hidden rounded-md border-2 bg-muted",
                index === activeIndex ? "border-primary" : "border-transparent"
              )}
            >
              <Image src={image.url} alt="" fill sizes="64px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
