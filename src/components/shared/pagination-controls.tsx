"use client";

import type { MouseEvent } from "react";

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface PaginationControlsProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

/**
 * Callback-driven pagination control built on the shadcn `pagination`
 * primitives. Deliberately takes an `onPageChange` callback rather than
 * generating real hrefs so the same component works for both URL-backed
 * pagination (browse pages, where the caller pushes a new `?page=` search
 * param) and plain local `useState` pagination (e.g. review lists).
 */
export function PaginationControls({
  page,
  totalPages,
  onPageChange,
  className,
}: PaginationControlsProps) {
  if (totalPages <= 1) {
    return null;
  }

  function go(target: number, e: MouseEvent) {
    e.preventDefault();
    if (target >= 1 && target <= totalPages && target !== page) {
      onPageChange(target);
    }
  }

  // Build a compact page list: first, last, current +/-1, with ellipses.
  const pages = new Set<number>([1, totalPages, page, page - 1, page + 1]);
  const sortedPages = Array.from(pages)
    .filter((p) => p >= 1 && p <= totalPages)
    .sort((a, b) => a - b);

  const items: (number | "ellipsis")[] = [];
  sortedPages.forEach((p, i) => {
    if (i > 0 && p - sortedPages[i - 1] > 1) {
      items.push("ellipsis");
    }
    items.push(p);
  });

  return (
    <Pagination className={className}>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href="#"
            aria-disabled={page <= 1}
            className={page <= 1 ? "pointer-events-none opacity-50" : undefined}
            onClick={(e) => go(page - 1, e)}
          />
        </PaginationItem>
        {items.map((item, i) =>
          item === "ellipsis" ? (
            <PaginationItem key={`ellipsis-${i}`}>
              <PaginationEllipsis />
            </PaginationItem>
          ) : (
            <PaginationItem key={item}>
              <PaginationLink href="#" isActive={item === page} onClick={(e) => go(item, e)}>
                {item}
              </PaginationLink>
            </PaginationItem>
          )
        )}
        <PaginationItem>
          <PaginationNext
            href="#"
            aria-disabled={page >= totalPages}
            className={page >= totalPages ? "pointer-events-none opacity-50" : undefined}
            onClick={(e) => go(page + 1, e)}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
