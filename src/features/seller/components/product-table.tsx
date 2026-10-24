"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Loader2, MoreHorizontal, PackageSearch, Search } from "lucide-react";

import { PaginationControls } from "@/components/shared/pagination-controls";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ROUTES } from "@/constants/routes";
import { useCategoryTree } from "@/features/categories/hooks";
import { useDebounce } from "@/hooks/use-debounce";
import type { Product, ProductStatus } from "@/types/product";
import { useArchiveProduct, useDuplicateProduct, useInventoryHistory, useSellerProducts } from "../hooks";
import { flattenCategories } from "../utils";
import { StockAdjustDialog } from "./stock-adjust-dialog";

const ALL_VALUE = "all";

const STATUS_OPTIONS = [
  { value: ALL_VALUE, label: "All statuses" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "draft", label: "Draft" },
  { value: "archived", label: "Archived" },
];

function ProductStatusBadge({ status }: { status?: ProductStatus }) {
  const value = status ?? "active";
  const variant = value === "active" ? "default" : value === "archived" ? "destructive" : "secondary";
  return (
    <Badge variant={variant} className="capitalize">
      {value}
    </Badge>
  );
}

function StockBadge({ product }: { product: Product }) {
  if (product.stockQuantity <= 0) {
    return <Badge variant="destructive">Out of stock</Badge>;
  }
  return <Badge variant="outline">{product.stockQuantity} in stock</Badge>;
}

function InventoryHistoryDialog({
  product,
  open,
  onOpenChange,
}: {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const historyQuery = useInventoryHistory(open ? product?.id : undefined);
  const entries = historyQuery.data?.data ?? [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Inventory history</DialogTitle>
          <DialogDescription>{product?.name}</DialogDescription>
        </DialogHeader>
        {historyQuery.isLoading ? (
          <div className="flex flex-col gap-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : entries.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No stock changes recorded yet.
          </p>
        ) : (
          <ul className="flex flex-col divide-y divide-border">
            {entries.map((entry) => (
              <li key={entry.id} className="flex items-center justify-between gap-3 py-2 text-sm">
                <div>
                  <p className="font-medium text-foreground">{entry.reason}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(entry.createdAt).toLocaleString(undefined, {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </p>
                </div>
                <span
                  className={
                    entry.changeQty >= 0
                      ? "font-semibold text-emerald-600 dark:text-emerald-400"
                      : "font-semibold text-destructive"
                  }
                >
                  {entry.changeQty >= 0 ? "+" : ""}
                  {entry.changeQty}
                </span>
              </li>
            ))}
          </ul>
        )}
      </DialogContent>
    </Dialog>
  );
}

interface ProductTableProps {
  storeId: string;
}

/** Seller's own product list — search, status/category filters, and per-row management actions. */
export function ProductTable({ storeId }: ProductTableProps) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>(ALL_VALUE);
  const [categoryId, setCategoryId] = useState<string>(ALL_VALUE);
  const [page, setPage] = useState(1);

  const [stockTarget, setStockTarget] = useState<Product | null>(null);
  const [historyTarget, setHistoryTarget] = useState<Product | null>(null);
  const [archiveTarget, setArchiveTarget] = useState<Product | null>(null);

  const debouncedSearch = useDebounce(search, 400);
  const { data: categoryTree } = useCategoryTree();
  const categoryOptions = flattenCategories(categoryTree ?? []);

  const productsQuery = useSellerProducts(storeId, {
    search: debouncedSearch || undefined,
    status: status === ALL_VALUE ? undefined : (status as ProductStatus),
    categoryId: categoryId === ALL_VALUE ? undefined : categoryId,
    page,
    limit: 12,
  });

  const archiveProduct = useArchiveProduct();
  const duplicateProduct = useDuplicateProduct();

  const products = productsQuery.data?.data ?? [];
  const meta = productsQuery.data?.meta;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search products..."
            className="pl-9"
          />
        </div>
        <Select
          value={status}
          onValueChange={(value) => {
            setStatus(value);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={categoryId}
          onValueChange={(value) => {
            setCategoryId(value);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-full sm:w-52">
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_VALUE}>All categories</SelectItem>
            {categoryOptions.map((option) => (
              <SelectItem key={option.id} value={option.id}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {productsQuery.isLoading ? (
        <div className="flex flex-col gap-2">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      ) : products.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 text-center text-muted-foreground">
          <PackageSearch className="size-10" />
          <p>No products found.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="relative size-10 shrink-0 overflow-hidden rounded-md border border-border bg-muted">
                        {product.images[0] && (
                          <Image
                            src={product.images[0].url}
                            alt=""
                            fill
                            sizes="40px"
                            className="object-cover"
                          />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-medium text-foreground">{product.name}</p>
                        {product.sku && (
                          <p className="truncate text-xs text-muted-foreground">SKU: {product.sku}</p>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    {product.discountPrice != null && product.discountPrice < product.price ? (
                      <div className="flex flex-col items-end">
                        <span className="font-medium text-foreground">
                          ₹{product.discountPrice.toFixed(2)}
                        </span>
                        <span className="text-xs text-muted-foreground line-through">
                          ₹{product.price.toFixed(2)}
                        </span>
                      </div>
                    ) : (
                      <span className="font-medium text-foreground">₹{product.price.toFixed(2)}</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <StockBadge product={product} />
                  </TableCell>
                  <TableCell>
                    <ProductStatusBadge status={product.status} />
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" aria-label="Product actions">
                          <MoreHorizontal className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={ROUTES.sellerProductEdit(product.id)}>Edit</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setStockTarget(product)}>
                          Adjust stock
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setHistoryTarget(product)}>
                          Inventory history
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          disabled={duplicateProduct.isPending}
                          onClick={() => duplicateProduct.mutate({ id: product.id })}
                        >
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuItem variant="destructive" onClick={() => setArchiveTarget(product)}>
                          Archive
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {meta && meta.totalPages > 1 && (
        <PaginationControls page={meta.page} totalPages={meta.totalPages} onPageChange={setPage} />
      )}

      <StockAdjustDialog
        product={stockTarget}
        open={Boolean(stockTarget)}
        onOpenChange={(open) => !open && setStockTarget(null)}
      />
      <InventoryHistoryDialog
        product={historyTarget}
        open={Boolean(historyTarget)}
        onOpenChange={(open) => !open && setHistoryTarget(null)}
      />
      <AlertDialog open={Boolean(archiveTarget)} onOpenChange={(open) => !open && setArchiveTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Archive {archiveTarget?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              Archived products are hidden from shoppers. You can find them again later using the
              &ldquo;Archived&rdquo; status filter.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={archiveProduct.isPending}
              onClick={() => {
                if (archiveTarget) {
                  archiveProduct.mutate(archiveTarget.id, {
                    onSuccess: () => setArchiveTarget(null),
                  });
                }
              }}
            >
              {archiveProduct.isPending && <Loader2 className="size-4 animate-spin" />}
              Archive
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
