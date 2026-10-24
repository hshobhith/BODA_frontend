import type { Product, ProductAddonGroup } from "@/types/product";

/** Today as 'YYYY-MM-DD' in local time, comparable with `Product.expiryDate`. */
function todayString(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

export function isExpired(expiryDate?: string | null): boolean {
  return !!expiryDate && expiryDate < todayString();
}

/** Older payloads predate `trackInventory`; those products are stock-tracked. */
export function tracksStock(product: Pick<Product, "trackInventory">): boolean {
  return product.trackInventory !== false;
}

type AvailabilityFields = Pick<
  Product,
  "isAvailable" | "expiryDate" | "trackInventory" | "stockQuantity"
>;

/** Short label for why a product can't be bought right now, or null. */
export function unavailableLabel(product: AvailabilityFields, stock = product.stockQuantity): string | null {
  if (product.isAvailable === false) return "Sold out";
  if (isExpired(product.expiryDate)) return "Expired";
  if (tracksStock(product) && stock <= 0) return "Out of stock";
  return null;
}

/** Selected option ids per add-on group id. */
export type AddonSelection = Record<string, string[]>;

/** First rule the selection breaks ("Choose 1 for Spice level"), or null if it's valid. */
export function addonSelectionError(
  groups: ProductAddonGroup[],
  selection: AddonSelection
): string | null {
  for (const group of groups) {
    const count = selection[group.id]?.length ?? 0;
    if (count < group.minSelect) {
      return group.minSelect === group.maxSelect
        ? `Choose ${group.minSelect} for "${group.name}"`
        : `Choose at least ${group.minSelect} for "${group.name}"`;
    }
  }
  return null;
}

export function addonSelectionTotal(groups: ProductAddonGroup[], selection: AddonSelection): number {
  return groups.reduce(
    (sum, group) =>
      sum +
      group.options
        .filter((option) => selection[group.id]?.includes(option.id))
        .reduce((groupSum, option) => groupSum + option.price, 0),
    0
  );
}
