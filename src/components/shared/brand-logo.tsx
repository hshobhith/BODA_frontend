import Image from "next/image";

import { cn } from "@/lib/utils";

// Intrinsic sizes of the trimmed lockups in public/brand (see docs/brand/make_brand.py).
const LIGHT = { src: "/brand/boda-logo.png", width: 867, height: 303 };
const DARK = { src: "/brand/boda-logo-dark.png", width: 807, height: 284 };

/**
 * The BODA logo (B mark + "boda" wordmark). The wordmark is navy in the light
 * version and white in the dark one, so both are rendered and the theme
 * class picks which shows. Decorative: wrap it in a labelled link.
 */
export function BrandLogo({
  height = 32,
  priority = false,
  className,
}: {
  /** Rendered height in px; width follows the logo's aspect ratio. */
  height?: number;
  priority?: boolean;
  className?: string;
}) {
  return (
    <>
      {[LIGHT, DARK].map((logo) => (
        <Image
          key={logo.src}
          src={logo.src}
          alt=""
          width={Math.round((height * logo.width) / logo.height)}
          height={height}
          priority={priority}
          className={cn(logo === LIGHT ? "block dark:hidden" : "hidden dark:block", className)}
        />
      ))}
    </>
  );
}
