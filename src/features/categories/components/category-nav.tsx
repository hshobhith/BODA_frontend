"use client";

import Image from "next/image";
import Link from "next/link";
import { LayoutGrid } from "lucide-react";

import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";
import type { Category } from "@/types/category";

function categoryHref(categoryId: string) {
  return `${ROUTES.products}?categoryId=${encodeURIComponent(categoryId)}`;
}

interface CategoryNavProps {
  categories: Category[];
  activeCategoryId?: string;
  className?: string;
}

/**
 * Horizontal, scrollable row of category pills — used on the homepage as a
 * quick-jump into the product browse page filtered by category.
 */
export function CategoryNav({ categories, activeCategoryId, className }: CategoryNavProps) {
  if (categories.length === 0) {
    return null;
  }

  return (
    <div className={cn("flex gap-3 overflow-x-auto pb-2 [scrollbar-width:thin]", className)}>
      {categories.map((category) => {
        const isActive = category.id === activeCategoryId;
        return (
          <Link
            key={category.id}
            href={categoryHref(category.id)}
            className={cn(
              "flex shrink-0 flex-col items-center gap-2 rounded-xl border border-border bg-card px-4 py-3 text-center transition-colors hover:border-primary/50 hover:bg-accent",
              isActive && "border-primary bg-accent"
            )}
          >
            <span className="flex size-12 items-center justify-center overflow-hidden rounded-full bg-muted">
              {category.imageUrl ? (
                <Image
                  src={category.imageUrl}
                  alt=""
                  width={48}
                  height={48}
                  className="size-full object-cover"
                />
              ) : (
                <LayoutGrid className="size-5 text-muted-foreground" />
              )}
            </span>
            <span className="max-w-20 truncate text-xs font-medium text-foreground">
              {category.name}
            </span>
          </Link>
        );
      })}
    </div>
  );
}

interface CategorySidebarNavProps {
  categories: Category[];
  activeCategoryId?: string;
  className?: string;
}

/**
 * Vertical category list for the product browse page sidebar. Shows
 * top-level categories with their immediate children indented underneath.
 */
export function CategorySidebarNav({
  categories,
  activeCategoryId,
  className,
}: CategorySidebarNavProps) {
  if (categories.length === 0) {
    return null;
  }

  return (
    <nav className={cn("flex flex-col gap-1", className)} aria-label="Categories">
      <Link
        href={ROUTES.products}
        className={cn(
          "rounded-md px-2.5 py-1.5 text-sm font-medium hover:bg-muted",
          !activeCategoryId && "bg-accent text-accent-foreground"
        )}
      >
        All categories
      </Link>
      {categories.map((category) => (
        <div key={category.id} className="flex flex-col">
          <Link
            href={categoryHref(category.id)}
            className={cn(
              "rounded-md px-2.5 py-1.5 text-sm font-medium hover:bg-muted",
              category.id === activeCategoryId && "bg-accent text-accent-foreground"
            )}
          >
            {category.name}
          </Link>
          {category.children.length > 0 && (
            <div className="ml-3 flex flex-col border-l border-border pl-2">
              {category.children.map((child) => (
                <Link
                  key={child.id}
                  href={categoryHref(child.id)}
                  className={cn(
                    "rounded-md px-2.5 py-1 text-sm text-muted-foreground hover:bg-muted hover:text-foreground",
                    child.id === activeCategoryId && "bg-accent text-accent-foreground"
                  )}
                >
                  {child.name}
                </Link>
              ))}
            </div>
          )}
        </div>
      ))}
    </nav>
  );
}
