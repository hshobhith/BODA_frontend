import type { Category } from "@/types/category";

/** Flattens a two-level category tree into `{ id, label }` options for a `Select`. */
export function flattenCategories(categories: Category[]): { id: string; label: string }[] {
  const result: { id: string; label: string }[] = [];
  for (const category of categories) {
    result.push({ id: category.id, label: category.name });
    for (const child of category.children) {
      result.push({ id: child.id, label: `— ${child.name}` });
    }
  }
  return result;
}
