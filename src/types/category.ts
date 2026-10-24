/**
 * Category types.
 *
 * `GET /categories/tree` returns a nested tree (root categories with
 * `children`, recursively). `GET /categories` returns a flat paginated list
 * of the same shape — `children` will typically be an empty array there.
 */

export interface Category {
  id: string;
  name: string;
  slug: string;
  imageUrl?: string | null;
  children: Category[];
}
