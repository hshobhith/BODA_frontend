import { getImageProps } from "next/image";
import QRCode from "qrcode";

import type { Store } from "@/types/store";

/**
 * Client-side renderer for the seller's "We're now on BODA" promo banner:
 * a generated abstract background, the store's name/logo, its own QR code,
 * and its storefront link as a separate, readable element. Everything is
 * drawn onto a `<canvas>`, so the result downloads as a PNG with no server
 * round-trip and no extra dependencies.
 *
 * The background artwork is seeded from the store's slug (plus a "shuffle"
 * counter), so each store gets its own design that stays stable between
 * visits until the seller asks for a new one.
 */

export type BannerFormat = "square" | "story" | "poster";
/** Public storefront link, or the private store-only link (`/s/<slug>`). */
export type BannerLinkKind = "public" | "private";
export type BannerThemeId = "midnight" | "sunset" | "fresh" | "daylight";

export const BANNER_FORMATS: Record<
  BannerFormat,
  { label: string; hint: string; width: number; height: number; exportScale: number }
> = {
  square: { label: "Social post", hint: "1080 × 1080 · Instagram, Facebook, WhatsApp", width: 1080, height: 1080, exportScale: 1 },
  story: { label: "Story / status", hint: "1080 × 1920 · Instagram story, WhatsApp status", width: 1080, height: 1920, exportScale: 1 },
  // A4 portrait; exported at 2x for a 2480 × 3508 (300 dpi) print.
  poster: { label: "Shop poster", hint: "A4 print · counter, door or window", width: 1240, height: 1754, exportScale: 2 },
};

interface BannerTheme {
  label: string;
  dark: boolean;
  background: [string, string, string];
  glows: string[];
  lines: string;
  accent: string;
  eyebrowText: string;
  title: string;
  body: string;
  /** QR finder-eye colour; keep it dark (luminance well under 50%) or scanners
   * that binarize locally can lose the eye against the white card. */
  qrEye: string;
  /** Swatch shown in the theme picker. */
  swatch: string;
}

export const BANNER_THEMES: Record<BannerThemeId, BannerTheme> = {
  midnight: {
    label: "Midnight",
    dark: true,
    background: ["#050C24", "#0B1C4D", "#132A6E"],
    glows: ["#2563EB", "#7C3AED", "#06B6D4", "#3B82F6"],
    lines: "#60A5FA",
    accent: "#3B82F6",
    eyebrowText: "#BFDBFE",
    title: "#FFFFFF",
    body: "rgba(226, 232, 255, 0.82)",
    qrEye: "#1E3A8A",
    swatch: "linear-gradient(135deg, #0B1C4D, #2563EB 60%, #7C3AED)",
  },
  sunset: {
    label: "Sunset",
    dark: true,
    background: ["#1F0A2E", "#3D1043", "#5E1A3F"],
    glows: ["#F97316", "#EC4899", "#FACC15", "#A855F7"],
    lines: "#FDBA74",
    accent: "#F97316",
    eyebrowText: "#FED7AA",
    title: "#FFFFFF",
    body: "rgba(255, 237, 228, 0.84)",
    qrEye: "#881337",
    swatch: "linear-gradient(135deg, #3D1043, #EC4899 55%, #F97316)",
  },
  fresh: {
    label: "Fresh",
    dark: true,
    background: ["#021C1A", "#04332E", "#064E3B"],
    glows: ["#10B981", "#22D3EE", "#A3E635", "#14B8A6"],
    lines: "#6EE7B7",
    accent: "#10B981",
    eyebrowText: "#A7F3D0",
    title: "#FFFFFF",
    body: "rgba(220, 252, 239, 0.84)",
    qrEye: "#064E3B",
    swatch: "linear-gradient(135deg, #04332E, #10B981 55%, #22D3EE)",
  },
  daylight: {
    label: "Daylight",
    dark: false,
    background: ["#FFFFFF", "#F1F5FF", "#E3EBFF"],
    glows: ["#93C5FD", "#C4B5FD", "#A5F3FC", "#BFDBFE"],
    lines: "#2563EB",
    accent: "#2563EB",
    eyebrowText: "#1D4ED8",
    title: "#0B1736",
    body: "#334155",
    qrEye: "#1E3A8A",
    swatch: "linear-gradient(135deg, #FFFFFF, #BFDBFE 55%, #C4B5FD)",
  },
};

export interface BannerOptions {
  format: BannerFormat;
  theme: BannerThemeId;
  /** Bumped by "New background" to re-roll the generated artwork. */
  variant: number;
  /** Output pixels per layout unit. */
  scale: number;
}

export interface BannerContent {
  storeName: string;
  shareUrl: string;
  /** Shown on the banner; the QR code always encodes the full `shareUrl`. */
  displayUrl: string;
  highlights: string[];
  /** Big caption under the QR code. */
  qrCaption: string;
  footer: string | null;
  logo: HTMLImageElement | null;
  /** Seeds the artwork, so public and private banners share a design. */
  seed: string;
  /** Download name without size/extension, e.g. `fresh-mart-boda-private`. */
  fileBase: string;
}

const NAVY = "#0B1736";

// ---------------------------------------------------------------------------
// Content
// ---------------------------------------------------------------------------

function storeHighlights(store: Store): string[] {
  const first =
    store.storeType === "restaurant"
      ? "See our full menu"
      : store.storeType === "pharmacy"
        ? "Order medicines"
        : "Browse our products";
  const mode = store.deliverySettings?.mode;
  const last = mode === "pickup_only" ? "Quick pickup" : mode === "delivery" ? "Home delivery" : "Delivery & pickup";
  return [first, "Order online", last];
}

/** Everything the banner prints, minus the async-loaded store logo. */
export function bannerContentFor(store: Store, shareUrl: string, kind: BannerLinkKind): Omit<BannerContent, "logo"> {
  const footer = [store.city, store.phone].filter(Boolean).join("  ·  ");
  return {
    storeName: store.name,
    shareUrl,
    displayUrl: shareUrl.replace(/^https?:\/\//, "").replace(/\/$/, ""),
    highlights: storeHighlights(store),
    qrCaption: store.storeType === "restaurant" ? "SCAN TO ORDER" : "SCAN TO SHOP",
    footer: footer || null,
    seed: store.slug,
    fileBase: `${store.slug}-boda${kind === "private" ? "-private" : ""}`,
  };
}

// ---------------------------------------------------------------------------
// Asset loading
// ---------------------------------------------------------------------------

const imageCache = new Map<string, Promise<HTMLImageElement | null>>();

/** Loads an image for canvas use; resolves `null` (never rejects) on failure. */
function loadImage(src: string): Promise<HTMLImageElement | null> {
  const cached = imageCache.get(src);
  if (cached) return cached;

  const promise = new Promise<HTMLImageElement | null>((resolve) => {
    const img = new Image();
    // Anything that would taint the canvas fails to load instead, so
    // `toBlob` can never throw a SecurityError later.
    img.crossOrigin = "anonymous";
    const timeout = window.setTimeout(() => resolve(null), 8000);
    img.onload = () => {
      window.clearTimeout(timeout);
      resolve(img);
    };
    img.onerror = () => {
      window.clearTimeout(timeout);
      imageCache.delete(src);
      resolve(null);
    };
    img.src = src;
  });
  imageCache.set(src, promise);
  return promise;
}

/**
 * Seller logos are uploaded to the backend's origin, which would taint the
 * canvas. Going through Next's image optimizer serves them from this
 * origin instead (the same path `<Image>` already uses for them).
 */
export function loadStoreLogo(logoUrl: string | null | undefined): Promise<HTMLImageElement | null> {
  if (!logoUrl) return Promise.resolve(null);
  const { props } = getImageProps({ src: logoUrl, alt: "", width: 256, height: 256 });
  return loadImage(props.src);
}

async function loadBrandAssets(dark: boolean) {
  const [logo, mark] = await Promise.all([
    loadImage(dark ? "/brand/boda-logo-dark.png" : "/brand/boda-logo.png"),
    loadImage("/brand/boda-mark.png"),
  ]);
  return { logo, mark };
}

let fontFamily: string | null = null;

/** Geist (the app's next/font sans), loaded before any text is measured. */
async function resolveFont(): Promise<string> {
  if (fontFamily) return fontFamily;
  const geist = getComputedStyle(document.documentElement).getPropertyValue("--font-geist-sans").trim();
  const family = `${geist ? `${geist}, ` : ""}ui-sans-serif, system-ui, "Segoe UI", Roboto, Arial, sans-serif`;
  try {
    await Promise.all([
      document.fonts.load(`500 32px ${family}`),
      document.fonts.load(`600 32px ${family}`),
      document.fonts.load(`700 32px ${family}`),
      document.fonts.load(`800 32px ${family}`),
    ]);
  } catch {
    // Falls back to whatever the stack resolves to.
  }
  fontFamily = family;
  return family;
}

// ---------------------------------------------------------------------------
// Drawing helpers
// ---------------------------------------------------------------------------

type Ctx = CanvasRenderingContext2D;

function hashString(value: string): number {
  let h = 2166136261;
  for (let i = 0; i < value.length; i++) {
    h ^= value.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Small deterministic PRNG (mulberry32) so a store's artwork is stable. */
function createRandom(seed: string) {
  let a = hashString(seed);
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function withAlpha(hex: string, alpha: number): string {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
}

function setFont(ctx: Ctx, weight: number, size: number, family: string, tracking = 0) {
  ctx.font = `${weight} ${size}px ${family}`;
  if ("letterSpacing" in ctx) {
    (ctx as Ctx & { letterSpacing: string }).letterSpacing = `${tracking}px`;
  }
}

/** Greedy word wrap; a single word wider than `maxWidth` stays on its own line. */
function wrapLines(ctx: Ctx, text: string, maxWidth: number): string[] {
  const words = text.trim().split(/\s+/);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (line && ctx.measureText(candidate).width > maxWidth) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function ellipsize(ctx: Ctx, text: string, maxWidth: number): string {
  if (ctx.measureText(text).width <= maxWidth) return text;
  let end = text.length;
  while (end > 1 && ctx.measureText(`${text.slice(0, end)}…`).width > maxWidth) end--;
  return `${text.slice(0, end)}…`;
}

/** Largest font size (stepping down) at which `text` fits in `maxLines`. */
function fitText(
  ctx: Ctx,
  text: string,
  opts: { maxWidth: number; maxLines: number; max: number; min: number; weight: number; family: string; tracking?: number }
): { size: number; lines: string[] } {
  for (let size = opts.max; size >= opts.min; size -= 2) {
    setFont(ctx, opts.weight, size, opts.family, opts.tracking ?? 0);
    const lines = wrapLines(ctx, text, opts.maxWidth);
    if (lines.length <= opts.maxLines && lines.every((l) => ctx.measureText(l).width <= opts.maxWidth)) {
      return { size, lines };
    }
  }
  setFont(ctx, opts.weight, opts.min, opts.family, opts.tracking ?? 0);
  const lines = wrapLines(ctx, text, opts.maxWidth);
  const kept = lines.slice(0, opts.maxLines);
  kept[kept.length - 1] = ellipsize(ctx, lines.slice(opts.maxLines - 1).join(" "), opts.maxWidth);
  return { size: opts.min, lines: kept.map((l) => ellipsize(ctx, l, opts.maxWidth)) };
}

function roundRect(ctx: Ctx, x: number, y: number, w: number, h: number, r: number) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

function drawSparkle(ctx: Ctx, x: number, y: number, size: number, color: string) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(0, -size);
  ctx.quadraticCurveTo(0, 0, size, 0);
  ctx.quadraticCurveTo(0, 0, 0, size);
  ctx.quadraticCurveTo(0, 0, -size, 0);
  ctx.quadraticCurveTo(0, 0, 0, -size);
  ctx.fill();
  ctx.restore();
}

// ---------------------------------------------------------------------------
// Background artwork
// ---------------------------------------------------------------------------

interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

/**
 * `focus` centres the signal rings (behind the QR card); sparkles are kept
 * out of the `avoid` rects so none land on top of text.
 */
function drawBackground(
  ctx: Ctx,
  W: number,
  H: number,
  theme: BannerTheme,
  random: () => number,
  focus: { x: number; y: number },
  avoid: Rect[]
) {
  // Base gradient, angle varies per seed.
  const angle = random() * Math.PI * 0.5 + Math.PI * 0.25;
  const dx = Math.cos(angle) * H;
  const dy = Math.sin(angle) * H;
  const base = ctx.createLinearGradient(W / 2 - dx / 2, H / 2 - dy / 2, W / 2 + dx / 2, H / 2 + dy / 2);
  base.addColorStop(0, theme.background[0]);
  base.addColorStop(0.55, theme.background[1]);
  base.addColorStop(1, theme.background[2]);
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, W, H);

  // Soft colour glows.
  ctx.save();
  ctx.globalCompositeOperation = theme.dark ? "screen" : "multiply";
  const glowCount = 5;
  for (let i = 0; i < glowCount; i++) {
    const color = theme.glows[i % theme.glows.length];
    const x = random() * W;
    const y = (i / glowCount) * H + random() * (H / glowCount);
    const r = Math.max(W, H) * (0.28 + random() * 0.3);
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, withAlpha(color, theme.dark ? 0.55 : 0.5));
    g.addColorStop(0.45, withAlpha(color, theme.dark ? 0.18 : 0.18));
    g.addColorStop(1, withAlpha(color, 0));
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
  }
  ctx.restore();

  // Flowing silk lines — two bands crossing the canvas.
  ctx.save();
  ctx.lineWidth = 1.6;
  for (let band = 0; band < 2; band++) {
    const count = 26;
    const baseY = band === 0 ? H * (0.12 + random() * 0.18) : H * (0.68 + random() * 0.18);
    const amp = H * (0.04 + random() * 0.05);
    const freq = (Math.PI * 2) / (W * (0.9 + random() * 0.8));
    const phase = random() * Math.PI * 2;
    const tilt = (random() - 0.5) * H * 0.25;
    for (let i = 0; i < count; i++) {
      const t = i / count;
      const grad = ctx.createLinearGradient(0, 0, W, 0);
      const alpha = (theme.dark ? 0.32 : 0.22) * Math.sin(Math.PI * t);
      grad.addColorStop(0, withAlpha(theme.lines, 0));
      grad.addColorStop(0.3, withAlpha(theme.lines, alpha));
      grad.addColorStop(0.7, withAlpha(theme.glows[1], alpha));
      grad.addColorStop(1, withAlpha(theme.lines, 0));
      ctx.strokeStyle = grad;
      ctx.beginPath();
      for (let x = -20; x <= W + 20; x += 12) {
        const y =
          baseY +
          i * 9 +
          (x / W) * tilt +
          Math.sin(x * freq + phase + t * 1.4) * amp +
          Math.sin(x * freq * 2.3 + phase * 1.7) * amp * 0.25 * t;
        if (x === -20) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
  }
  ctx.restore();

  // Concentric "signal" rings radiating from behind the QR code.
  ctx.save();
  const ringColor = theme.dark ? "#FFFFFF" : theme.accent;
  for (let i = 1; i <= 7; i++) {
    ctx.strokeStyle = withAlpha(ringColor, (theme.dark ? 0.09 : 0.08) * (1 - i / 9));
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(focus.x, focus.y, W * 0.22 + i * W * 0.075, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();

  // Fine dot grid, fading toward the edges.
  ctx.save();
  const gap = 36;
  const dotColor = theme.dark ? "#FFFFFF" : NAVY;
  for (let y = gap / 2; y < H; y += gap) {
    for (let x = gap / 2; x < W; x += gap) {
      const d = Math.hypot((x - W / 2) / W, (y - H / 2) / H);
      const a = Math.max(0, 0.07 - d * 0.09);
      if (a <= 0.004) continue;
      ctx.fillStyle = withAlpha(dotColor, a);
      ctx.fillRect(x - 1, y - 1, 2, 2);
    }
  }
  ctx.restore();

  // Sparkles, in the open space between foreground blocks.
  ctx.save();
  let placed = 0;
  for (let attempt = 0; attempt < 80 && placed < 9; attempt++) {
    const x = random() * W;
    const y = random() * H;
    const size = 6 + random() * 16;
    const alpha = random();
    const m = size + 14;
    if (avoid.some((r) => x > r.x - m && x < r.x + r.w + m && y > r.y - m && y < r.y + r.h + m)) continue;
    const color = theme.dark ? withAlpha("#FFFFFF", 0.5 + alpha * 0.4) : withAlpha(theme.accent, 0.45 + alpha * 0.3);
    drawSparkle(ctx, x, y, size, color);
    placed++;
  }
  ctx.restore();
}

/** Subtle film grain over the finished art, drawn in device pixels. */
function drawGrain(ctx: Ctx, dark: boolean, random: () => number) {
  const tile = document.createElement("canvas");
  tile.width = tile.height = 160;
  const tctx = tile.getContext("2d");
  if (!tctx) return;
  const data = tctx.createImageData(160, 160);
  for (let i = 0; i < data.data.length; i += 4) {
    const v = random() * 255;
    data.data[i] = data.data[i + 1] = data.data[i + 2] = v;
    data.data[i + 3] = dark ? 14 : 10;
  }
  tctx.putImageData(data, 0, 0);
  const pattern = ctx.createPattern(tile, "repeat");
  if (!pattern) return;
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalCompositeOperation = "overlay";
  ctx.fillStyle = pattern;
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.restore();
}

// ---------------------------------------------------------------------------
// Foreground blocks
// ---------------------------------------------------------------------------

const QR_CARD_PAD = 0.1;
const QR_CARD_CAPTION = 0.2;

/** Height of the QR card for a given width. */
function qrCardHeight(w: number) {
  return w * (1 - QR_CARD_PAD + QR_CARD_CAPTION);
}

/** QR code in a white card with "Scan to shop" caption; (x, y) is the card's top-left. */
function drawQrCard(
  ctx: Ctx,
  x: number,
  y: number,
  w: number,
  content: BannerContent,
  theme: BannerTheme,
  mark: HTMLImageElement | null,
  family: string
): number {
  const pad = w * QR_CARD_PAD;
  const qrSize = w - pad * 2;
  const captionH = w * QR_CARD_CAPTION;
  const h = qrCardHeight(w);

  // Card + shadow.
  ctx.save();
  ctx.shadowColor = theme.dark ? "rgba(0, 0, 0, 0.45)" : "rgba(30, 58, 138, 0.22)";
  ctx.shadowBlur = w * 0.12;
  ctx.shadowOffsetY = w * 0.035;
  ctx.fillStyle = "#FFFFFF";
  roundRect(ctx, x, y, w, h, w * 0.08);
  ctx.fill();
  ctx.restore();

  // Thin accent ring around the card.
  ctx.save();
  ctx.strokeStyle = withAlpha(theme.accent, theme.dark ? 0.55 : 0.35);
  ctx.lineWidth = Math.max(2, w * 0.006);
  roundRect(ctx, x - w * 0.025, y - w * 0.025, w * 1.05, h + w * 0.05, w * 0.1);
  ctx.stroke();
  ctx.restore();

  // QR modules (classic squares for reliable scanning; finder eyes styled).
  const qr = QRCode.create(content.shareUrl, { errorCorrectionLevel: "H" });
  const n = qr.modules.size;
  const cell = qrSize / n;
  const qx = x + pad;
  const qy = y + pad;
  const isEye = (r: number, c: number) => (r < 7 && c < 7) || (r < 7 && c >= n - 7) || (r >= n - 7 && c < 7);

  ctx.fillStyle = NAVY;
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      if (!qr.modules.get(r, c) || isEye(r, c)) continue;
      // +0.5 overlap avoids hairline seams between neighbouring modules.
      ctx.fillRect(qx + c * cell, qy + r * cell, cell + 0.5, cell + 0.5);
    }
  }

  for (const [er, ec] of [
    [0, 0],
    [0, n - 7],
    [n - 7, 0],
  ]) {
    const ex = qx + ec * cell;
    const ey = qy + er * cell;
    ctx.fillStyle = theme.qrEye;
    roundRect(ctx, ex, ey, cell * 7, cell * 7, cell * 2);
    ctx.fill();
    ctx.fillStyle = "#FFFFFF";
    roundRect(ctx, ex + cell, ey + cell, cell * 5, cell * 5, cell * 1.4);
    ctx.fill();
    ctx.fillStyle = NAVY;
    roundRect(ctx, ex + cell * 2, ey + cell * 2, cell * 3, cell * 3, cell);
    ctx.fill();
  }

  // BODA mark in the middle (level-H error correction leaves room for it).
  if (mark) {
    const badge = qrSize * 0.2;
    const bx = qx + (qrSize - badge) / 2;
    const by = qy + (qrSize - badge) / 2;
    ctx.fillStyle = "#FFFFFF";
    roundRect(ctx, bx, by, badge, badge, badge * 0.22);
    ctx.fill();
    const inset = badge * 0.14;
    ctx.drawImage(mark, bx + inset, by + inset, badge - inset * 2, badge - inset * 2);
  }

  // Caption.
  ctx.fillStyle = NAVY;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  setFont(ctx, 800, w * 0.068, family, w * 0.012);
  ctx.fillText(content.qrCaption, x + w / 2, y + pad + qrSize + captionH * 0.42);
  ctx.fillStyle = "#64748B";
  setFont(ctx, 500, w * 0.042, family);
  ctx.fillText("Point your phone camera here", x + w / 2, y + pad + qrSize + captionH * 0.74);

  return h;
}

function drawGlobeIcon(ctx: Ctx, cx: number, cy: number, r: number, color: string) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = r * 0.16;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(cx, cy, r * 0.45, r, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx - r, cy);
  ctx.lineTo(cx + r, cy);
  ctx.stroke();
  ctx.restore();
}

/** Pill holding the storefront link, kept separate from the QR card. Returns its height. */
function drawLinkPill(ctx: Ctx, cx: number, y: number, maxW: number, height: number, content: BannerContent, theme: BannerTheme, family: string) {
  const iconD = height * 0.66;
  const padL = height * 0.17;
  const padR = height * 0.42;
  const gap = height * 0.22;

  const fit = fitText(ctx, content.displayUrl, {
    maxWidth: maxW - padL - iconD - gap - padR,
    maxLines: 1,
    max: Math.round(height * 0.36),
    min: Math.round(height * 0.24),
    weight: 600,
    family,
  });
  setFont(ctx, 600, fit.size, family);
  const textW = ctx.measureText(fit.lines[0]).width;
  const w = padL + iconD + gap + textW + padR;
  const x = cx - w / 2;

  ctx.save();
  ctx.fillStyle = theme.dark ? "rgba(255, 255, 255, 0.12)" : "#FFFFFF";
  ctx.strokeStyle = theme.dark ? "rgba(255, 255, 255, 0.28)" : "rgba(15, 23, 42, 0.12)";
  ctx.lineWidth = 2;
  if (!theme.dark) {
    ctx.shadowColor = "rgba(30, 58, 138, 0.12)";
    ctx.shadowBlur = height * 0.4;
    ctx.shadowOffsetY = height * 0.08;
  }
  roundRect(ctx, x, y, w, height, height / 2);
  ctx.fill();
  ctx.shadowColor = "transparent";
  ctx.stroke();
  ctx.restore();

  const iconCx = x + padL + iconD / 2;
  const iconCy = y + height / 2;
  ctx.fillStyle = theme.accent;
  ctx.beginPath();
  ctx.arc(iconCx, iconCy, iconD / 2, 0, Math.PI * 2);
  ctx.fill();
  drawGlobeIcon(ctx, iconCx, iconCy, iconD * 0.26, "#FFFFFF");

  ctx.fillStyle = theme.title;
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  setFont(ctx, 600, fit.size, family);
  ctx.fillText(fit.lines[0], x + padL + iconD + gap, y + height / 2 + 1);
}

function drawEyebrow(ctx: Ctx, x: number, y: number, align: "left" | "center", size: number, theme: BannerTheme, family: string) {
  const label = "NOW LIVE ON BODA";
  setFont(ctx, 700, size, family, size * 0.16);
  const textW = ctx.measureText(label).width;
  const h = size * 2.1;
  const dot = size * 0.32;
  const padX = size * 0.9;
  const w = padX + dot * 2 + size * 0.6 + textW + padX;
  const left = align === "center" ? x - w / 2 : x;

  ctx.save();
  ctx.fillStyle = withAlpha(theme.accent, theme.dark ? 0.22 : 0.1);
  ctx.strokeStyle = withAlpha(theme.accent, theme.dark ? 0.6 : 0.35);
  ctx.lineWidth = 2;
  roundRect(ctx, left, y, w, h, h / 2);
  ctx.fill();
  ctx.stroke();

  const dotX = left + padX + dot;
  ctx.fillStyle = withAlpha(theme.accent, 0.3);
  ctx.beginPath();
  ctx.arc(dotX, y + h / 2, dot * 1.9, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = theme.dark ? "#4ADE80" : "#16A34A";
  ctx.beginPath();
  ctx.arc(dotX, y + h / 2, dot, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = theme.eyebrowText;
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  setFont(ctx, 700, size, family, size * 0.16);
  ctx.fillText(label, dotX + dot + size * 0.6, y + h / 2 + 1);
  ctx.restore();
  return h;
}

/** Store logo in a ring, or the store's initial when it has none. */
function drawAvatar(ctx: Ctx, cx: number, cy: number, d: number, content: BannerContent, theme: BannerTheme, family: string) {
  const r = d / 2;
  ctx.save();
  ctx.shadowColor = "rgba(0, 0, 0, 0.25)";
  ctx.shadowBlur = d * 0.2;
  ctx.shadowOffsetY = d * 0.05;
  ctx.fillStyle = "#FFFFFF";
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  const inner = r - d * 0.05;
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, inner, 0, Math.PI * 2);
  ctx.clip();
  if (content.logo) {
    // object-fit: cover
    const { naturalWidth: iw, naturalHeight: ih } = content.logo;
    const s = Math.max((inner * 2) / iw, (inner * 2) / ih);
    ctx.drawImage(content.logo, cx - (iw * s) / 2, cy - (ih * s) / 2, iw * s, ih * s);
  } else {
    const g = ctx.createLinearGradient(cx - r, cy - r, cx + r, cy + r);
    g.addColorStop(0, theme.accent);
    g.addColorStop(1, theme.glows[1]);
    ctx.fillStyle = g;
    ctx.fillRect(cx - r, cy - r, d, d);
    ctx.fillStyle = "#FFFFFF";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    setFont(ctx, 800, d * 0.46, family);
    ctx.fillText(content.storeName.trim().charAt(0).toUpperCase() || "B", cx, cy + d * 0.03);
  }
  ctx.restore();
}

interface ChipLayout {
  rows: { items: { text: string; w: number }[]; w: number }[];
  h: number;
}

function layoutChips(ctx: Ctx, items: string[], maxW: number, size: number, family: string): ChipLayout {
  setFont(ctx, 600, size, family);
  const chipH = size * 2.1;
  const gap = size * 0.6;
  const rows: ChipLayout["rows"] = [];
  for (const text of items) {
    const w = size * 1.0 + size * 0.5 + size * 0.5 + ctx.measureText(text).width + size * 0.9;
    const row = rows[rows.length - 1];
    if (row && row.w + gap + w <= maxW) {
      row.items.push({ text, w });
      row.w += gap + w;
    } else {
      rows.push({ items: [{ text, w }], w });
    }
  }
  return { rows, h: rows.length * chipH + (rows.length - 1) * gap };
}

function drawChips(ctx: Ctx, layout: ChipLayout, x: number, y: number, align: "left" | "center", size: number, theme: BannerTheme, family: string) {
  const chipH = size * 2.1;
  const gap = size * 0.6;
  layout.rows.forEach((row, ri) => {
    let cx = align === "center" ? x - row.w / 2 : x;
    const cy = y + ri * (chipH + gap);
    for (const item of row.items) {
      ctx.fillStyle = theme.dark ? "rgba(255, 255, 255, 0.1)" : "rgba(255, 255, 255, 0.85)";
      ctx.strokeStyle = theme.dark ? "rgba(255, 255, 255, 0.18)" : "rgba(15, 23, 42, 0.1)";
      ctx.lineWidth = 1.5;
      roundRect(ctx, cx, cy, item.w, chipH, chipH / 2);
      ctx.fill();
      ctx.stroke();

      // Check mark.
      const mx = cx + size * 1.0;
      const my = cy + chipH / 2;
      ctx.strokeStyle = theme.dark ? "#4ADE80" : "#16A34A";
      ctx.lineWidth = size * 0.14;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.beginPath();
      ctx.moveTo(mx - size * 0.3, my);
      ctx.lineTo(mx - size * 0.08, my + size * 0.24);
      ctx.lineTo(mx + size * 0.34, my - size * 0.24);
      ctx.stroke();

      ctx.fillStyle = theme.body;
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";
      setFont(ctx, 600, size, family);
      ctx.fillText(item.text, cx + size * 2.0, my + 1);
      cx += item.w + gap;
    }
  });
}

function drawBodaLogo(ctx: Ctx, logo: HTMLImageElement | null, x: number, y: number, height: number, align: "left" | "center") {
  if (!logo) return;
  const w = (logo.naturalWidth / logo.naturalHeight) * height;
  ctx.drawImage(logo, align === "center" ? x - w / 2 : x, y, w, height);
}

function drawFooter(ctx: Ctx, cx: number, y: number, size: number, content: BannerContent, theme: BannerTheme, family: string, maxW: number) {
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  if (content.footer) {
    ctx.fillStyle = theme.body;
    setFont(ctx, 600, size, family);
    ctx.fillText(ellipsize(ctx, content.footer, maxW), cx, y);
  }
  ctx.fillStyle = theme.dark ? "rgba(255, 255, 255, 0.55)" : "#64748B";
  setFont(ctx, 500, size * 0.8, family, size * 0.04);
  ctx.fillText("Powered by BODA · Your local marketplace", cx, y + size * (content.footer ? 1.55 : 0));
}

// ---------------------------------------------------------------------------
// Layouts
// ---------------------------------------------------------------------------

function drawPortrait(ctx: Ctx, W: number, H: number, content: BannerContent, theme: BannerTheme, assets: { logo: HTMLImageElement | null; mark: HTMLImageElement | null }, family: string, random: () => number) {
  // Story is the reference design; the A4 poster is shorter relative to its
  // width, so everything vertical shrinks with it.
  const u = Math.min(W / 1080, H / 1920);
  const cx = W / 2;
  const contentW = W - 160 * u;

  const title = fitText(ctx, content.storeName, { maxWidth: contentW, maxLines: 2, max: Math.round(104 * u), min: Math.round(60 * u), weight: 800, family, tracking: -1.5 * u });
  const titleLineH = title.size * 1.08;
  const chipSize = 27 * u;
  const chips = layoutChips(ctx, content.highlights, contentW, chipSize, family);

  const logoH = 70 * u;
  const eyebrowSize = 25 * u;
  const eyebrowH = eyebrowSize * 2.1;
  const avatarD = 128 * u;
  const subtitleSize = 44 * u;
  const cardW = Math.min(560 * u, W * 0.55);
  const cardH = qrCardHeight(cardW);
  const linkLabelSize = 26 * u;
  const pillH = 88 * u;
  const footerSize = 30 * u;
  const footerH = footerSize * (content.footer ? 2.6 : 1.1);

  const blocks = [
    logoH,
    eyebrowH,
    avatarD + 28 * u + titleLineH * title.lines.length + subtitleSize * 1.5,
    chips.h,
    cardH,
    linkLabelSize * 1.6 + pillH,
    footerH,
  ];
  const padTop = 96 * u;
  const padBottom = 80 * u;
  const weights = [0.8, 1, 0.8, 1.3, 1.3, 1.1];
  const free = Math.max(0, H - padTop - padBottom - blocks.reduce((a, b) => a + b, 0));
  const unit = free / weights.reduce((a, b) => a + b, 0);
  const tops: number[] = [];
  let y = padTop;
  blocks.forEach((h, i) => {
    tops.push(y);
    y += h + (weights[i] ?? 0) * unit;
  });

  setFont(ctx, 800, title.size, family, -1.5 * u);
  const titleW = Math.max(avatarD, ...title.lines.map((l) => ctx.measureText(l).width));
  setFont(ctx, 500, subtitleSize, family);
  const headW = Math.max(titleW, ctx.measureText("is now available on BODA").width);
  const chipsW = Math.max(...chips.rows.map((r) => r.w));
  const centred = (w: number, y: number, h: number): Rect => ({ x: cx - w / 2, y, w, h });
  drawBackground(ctx, W, H, theme, random, { x: cx, y: tops[4] + cardH / 2 }, [
    centred(logoH * 3.2, tops[0], logoH),
    centred(eyebrowSize * 16, tops[1], eyebrowH),
    centred(headW, tops[2], blocks[2]),
    centred(chipsW, tops[3], chips.h),
    centred(cardW + 60 * u, tops[4] - 30 * u, cardH + 60 * u),
    centred(contentW, tops[5], blocks[5]),
    centred(contentW, tops[6], footerH),
  ]);

  drawBodaLogo(ctx, assets.logo, cx, tops[0], logoH, "center");
  drawEyebrow(ctx, cx, tops[1], "center", eyebrowSize, theme, family);

  let ty = tops[2];
  drawAvatar(ctx, cx, ty + avatarD / 2, avatarD, content, theme, family);
  ty += avatarD + 28 * u;
  ctx.fillStyle = theme.title;
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  setFont(ctx, 800, title.size, family, -1.5 * u);
  for (const line of title.lines) {
    ctx.fillText(line, cx, ty);
    ty += titleLineH;
  }
  ctx.fillStyle = theme.body;
  setFont(ctx, 500, subtitleSize, family);
  ctx.fillText("is now available on BODA", cx, ty + subtitleSize * 0.2);

  drawChips(ctx, chips, cx, tops[3], "center", chipSize, theme, family);
  drawQrCard(ctx, cx - cardW / 2, tops[4], cardW, content, theme, assets.mark, family);

  ctx.fillStyle = theme.body;
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  setFont(ctx, 600, linkLabelSize, family, linkLabelSize * 0.04);
  ctx.fillText("Or open this link", cx, tops[5]);
  drawLinkPill(ctx, cx, tops[5] + linkLabelSize * 1.6, contentW, pillH, content, theme, family);

  drawFooter(ctx, cx, tops[6] + footerSize, footerSize, content, theme, family, contentW);
}

function drawSquare(ctx: Ctx, W: number, H: number, content: BannerContent, theme: BannerTheme, assets: { logo: HTMLImageElement | null; mark: HTMLImageElement | null }, family: string, random: () => number) {
  const pad = 72;
  const cardW = 380;
  const cardH = qrCardHeight(cardW);
  const colGap = 56;
  const leftW = W - pad * 2 - cardW - colGap;
  const pillH = 76;
  const footerSize = 24;
  const bottomY = H - pad - footerSize * (content.footer ? 1.9 : 0.9);
  const pillY = bottomY - 34 - pillH;

  // Middle region between the logo row and the link pill.
  const midTop = pad + 56 + 48;
  const midBottom = pillY - 48;
  const cardX = W - pad - cardW;
  const cardY = midTop + (midBottom - midTop - cardH) / 2;

  // Left column, vertically centred against the card.
  const eyebrowSize = 20;
  const eyebrowH = eyebrowSize * 2.1;
  const avatarD = 96;
  const title = fitText(ctx, content.storeName, { maxWidth: leftW, maxLines: 3, max: 76, min: 40, weight: 800, family, tracking: -1 });
  const titleLineH = title.size * 1.08;
  const subtitleSize = 32;
  const chipSize = 21;
  const chips = layoutChips(ctx, content.highlights, leftW, chipSize, family);
  const colH = eyebrowH + 28 + avatarD + 24 + titleLineH * title.lines.length + subtitleSize * 1.5 + 28 + chips.h;
  let y = Math.max(midTop, cardY + (cardH - colH) / 2);

  drawBackground(ctx, W, H, theme, random, { x: cardX + cardW / 2, y: cardY + cardH / 2 }, [
    { x: pad, y: pad, w: 56 * 3.2, h: 56 },
    { x: pad, y, w: leftW, h: colH },
    { x: cardX - 30, y: cardY - 30, w: cardW + 60, h: cardH + 60 },
    { x: pad, y: pillY, w: W - pad * 2, h: H - pillY - pad / 2 },
  ]);
  drawBodaLogo(ctx, assets.logo, pad, pad, 56, "left");

  drawEyebrow(ctx, pad, y, "left", eyebrowSize, theme, family);
  y += eyebrowH + 28;
  drawAvatar(ctx, pad + avatarD / 2, y + avatarD / 2, avatarD, content, theme, family);
  y += avatarD + 24;
  ctx.fillStyle = theme.title;
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  setFont(ctx, 800, title.size, family, -1);
  for (const line of title.lines) {
    ctx.fillText(line, pad, y);
    y += titleLineH;
  }
  ctx.fillStyle = theme.body;
  setFont(ctx, 500, subtitleSize, family);
  ctx.fillText("is now available on BODA", pad, y + subtitleSize * 0.15);
  y += subtitleSize * 1.5 + 28;
  drawChips(ctx, chips, pad, y, "left", chipSize, theme, family);

  drawQrCard(ctx, cardX, cardY, cardW, content, theme, assets.mark, family);
  drawLinkPill(ctx, W / 2, pillY, W - pad * 2, pillH, content, theme, family);
  drawFooter(ctx, W / 2, bottomY + footerSize, footerSize, content, theme, family, W - pad * 2);
}

/**
 * Draws the banner into `canvas`, resizing it to the format × `scale`.
 * Async only for font/brand-asset loading; the drawing itself is sync.
 */
export async function renderStoreBanner(canvas: HTMLCanvasElement, content: BannerContent, options: BannerOptions) {
  const format = BANNER_FORMATS[options.format];
  const theme = BANNER_THEMES[options.theme];
  const [family, assets] = await Promise.all([resolveFont(), loadBrandAssets(theme.dark)]);

  canvas.width = Math.round(format.width * options.scale);
  canvas.height = Math.round(format.height * options.scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is not supported in this browser.");
  ctx.setTransform(options.scale, 0, 0, options.scale, 0, 0);
  ctx.imageSmoothingQuality = "high";

  const random = createRandom(`${content.seed}:${options.theme}:${options.variant}`);
  if (options.format === "square") {
    drawSquare(ctx, format.width, format.height, content, theme, assets, family, random);
  } else {
    drawPortrait(ctx, format.width, format.height, content, theme, assets, family, random);
  }
  drawGrain(ctx, theme.dark, random);
}

/** Renders the full-resolution banner and returns it as a PNG file. */
export async function exportStoreBanner(content: BannerContent, options: Omit<BannerOptions, "scale">): Promise<File> {
  const canvas = document.createElement("canvas");
  await renderStoreBanner(canvas, content, { ...options, scale: BANNER_FORMATS[options.format].exportScale });
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Could not export the banner."))), "image/png");
  });
  return new File([blob], `${content.fileBase}-${options.format}.png`, { type: "image/png" });
}

export function downloadFile(file: File) {
  const url = URL.createObjectURL(file);
  const link = document.createElement("a");
  link.href = url;
  link.download = file.name;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
