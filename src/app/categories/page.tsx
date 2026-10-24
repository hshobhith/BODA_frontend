"use client";

import Image from "next/image";
import Link from "next/link";
import { LayoutGrid } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ROUTES } from "@/constants/routes";
import { useCategoryTree } from "@/features/categories/hooks";

function categoryHref(categoryId: string) {
  return `${ROUTES.products}?categoryId=${encodeURIComponent(categoryId)}`;
}

export default function CategoriesPage() {
  const { data: categories, isLoading } = useCategoryTree();

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 sm:px-6 lg:px-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Categories</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Browse everything on BODA by category.
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-40 w-full" />
          ))}
        </div>
      ) : !categories || categories.length === 0 ? (
        <p className="py-16 text-center text-muted-foreground">No categories yet.</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {categories.map((category) => (
            <Card key={category.id} className="flex flex-col gap-3 p-4">
              <Link href={categoryHref(category.id)} className="flex flex-col items-center gap-2">
                <span className="flex size-16 items-center justify-center overflow-hidden rounded-full bg-muted">
                  {category.imageUrl ? (
                    <Image
                      src={category.imageUrl}
                      alt=""
                      width={64}
                      height={64}
                      className="size-full object-cover"
                    />
                  ) : (
                    <LayoutGrid className="size-6 text-muted-foreground" />
                  )}
                </span>
                <span className="text-center text-sm font-medium text-foreground">
                  {category.name}
                </span>
              </Link>

              {category.children.length > 0 && (
                <div className="flex flex-wrap justify-center gap-1.5 border-t pt-3">
                  {category.children.map((child) => (
                    <Link
                      key={child.id}
                      href={categoryHref(child.id)}
                      className="rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                    >
                      {child.name}
                    </Link>
                  ))}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
