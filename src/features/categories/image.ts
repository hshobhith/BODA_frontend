import type { Category } from "@/types/category";

/** Categories with a matching photo in `public/categories/<slug>.jpg`. */
const LOCAL_CATEGORY_IMAGES = new Set([
  "groceries",
  "fruits-vegetables",
  "dairy-bakery",
  "electronics",
  "mobiles",
  "accessories",
  "fashion",
  "home-kitchen",
  "pharmacy",
  "restaurants-food",
  "beauty-personal-care",
  "books-stationery",
  "other",
]);

/**
 * The image to show for a category. An image an admin set wins; otherwise the
 * bundled photo for the seeded categories. The seed script used to fill
 * `imageUrl` with random picsum.photos pictures that have nothing to do with
 * the category, so those are treated as unset.
 */
export function categoryImageUrl(category: Pick<Category, "slug" | "imageUrl">): string | null {
  if (category.imageUrl && !category.imageUrl.includes("picsum.photos")) {
    return category.imageUrl;
  }
  return LOCAL_CATEGORY_IMAGES.has(category.slug) ? `/categories/${category.slug}.jpg` : null;
}
