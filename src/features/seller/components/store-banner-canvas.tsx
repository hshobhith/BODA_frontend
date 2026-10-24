"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { Store } from "@/types/store";
import {
  BANNER_FORMATS,
  bannerContentFor,
  loadStoreLogo,
  renderStoreBanner,
  type BannerContent,
  type BannerLinkKind,
  type BannerOptions,
} from "../store-banner";

/**
 * Banner content for `store`, including its logo once loaded. `null` while
 * the logo is still loading, so nothing renders twice (initials, then logo).
 */
export function useStoreBannerContent(store: Store, shareUrl: string, kind: BannerLinkKind): BannerContent | null {
  const [loaded, setLoaded] = useState<{ url: string | null; logo: HTMLImageElement | null } | null>(null);
  const logoUrl = store.logoUrl ?? null;

  useEffect(() => {
    let cancelled = false;
    loadStoreLogo(logoUrl).then((logo) => {
      if (!cancelled) setLoaded({ url: logoUrl, logo });
    });
    return () => {
      cancelled = true;
    };
  }, [logoUrl]);

  return useMemo(() => {
    if (!loaded || loaded.url !== logoUrl) return null;
    return { ...bannerContentFor(store, shareUrl, kind), logo: loaded.logo };
  }, [loaded, logoUrl, store, shareUrl, kind]);
}

interface StoreBannerCanvasProps {
  content: BannerContent | null;
  options: Omit<BannerOptions, "scale">;
  /** Preview width in px, used to pick a sharp-enough render scale. */
  previewWidth: number;
  className?: string;
  style?: React.CSSProperties;
}

/** Live, downscaled preview of the banner. */
export function StoreBannerCanvas({ content, options, previewWidth, className, style }: StoreBannerCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // Which format the canvas currently holds; a stale frame of another
  // format would show stretched, so it stays hidden until redrawn.
  const [renderedFormat, setRenderedFormat] = useState<string | null>(null);
  const format = BANNER_FORMATS[options.format];
  const { format: formatId, theme, variant } = options;
  const showFrame = content !== null && renderedFormat === formatId;

  useEffect(() => {
    const target = canvasRef.current;
    if (!content || !target) return;
    let cancelled = false;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const scale = Math.min(1, (previewWidth * dpr) / format.width);

    // Draw offscreen and swap in, so switching options never flashes a half-drawn frame.
    const offscreen = document.createElement("canvas");
    renderStoreBanner(offscreen, content, { format: formatId, theme, variant, scale })
      .then(() => {
        if (cancelled) return;
        target.width = offscreen.width;
        target.height = offscreen.height;
        target.getContext("2d")?.drawImage(offscreen, 0, 0);
        setRenderedFormat(formatId);
      })
      .catch(() => {
        // Leave the previous frame up; export reports its own errors.
      });

    return () => {
      cancelled = true;
    };
  }, [content, formatId, theme, variant, previewWidth, format.width]);

  return (
    <div className={cn("relative overflow-hidden rounded-lg", className)} style={{ ...style, aspectRatio: `${format.width} / ${format.height}` }}>
      <canvas
        ref={canvasRef}
        role="img"
        aria-label="Preview of your store's promo banner"
        className={cn("absolute inset-0 size-full", !showFrame && "invisible")}
      />
      {!showFrame && <Skeleton className="absolute inset-0 rounded-none" />}
    </div>
  );
}
