import type { StoreType } from "@/types/store";

/** Gradient pairs for stores without their own pictures. Full class names so
 * Tailwind picks them up. */
const STORE_GRADIENTS = [
  "from-sky-500 to-indigo-600",
  "from-emerald-500 to-teal-600",
  "from-orange-500 to-rose-600",
  "from-violet-500 to-fuchsia-600",
  "from-amber-400 to-orange-600",
  "from-cyan-500 to-blue-600",
  "from-pink-500 to-rose-600",
  "from-lime-500 to-emerald-600",
] as const;

function hashName(name: string): number {
  let hash = 0;
  for (const char of name) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return hash;
}

/** A stable, colourful gradient per store, so the same store always looks the same. */
export function storeGradient(name: string): string {
  return STORE_GRADIENTS[hashName(name) % STORE_GRADIENTS.length];
}

export function storeInitial(name: string): string {
  return name.trim().charAt(0).toUpperCase() || "?";
}

export const STORE_TYPE_SHORT_LABEL: Record<StoreType, string> = {
  retail: "Shop",
  restaurant: "Restaurant",
  pharmacy: "Pharmacy",
};
