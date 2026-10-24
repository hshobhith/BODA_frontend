import { CategoryTreeManager } from "@/features/admin/components/category-tree-manager";

export default function AdminCategoriesPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Categories</h1>
        <p className="text-sm text-muted-foreground">
          Manage the category hierarchy shown across the storefront.
        </p>
      </div>
      <CategoryTreeManager />
    </div>
  );
}
