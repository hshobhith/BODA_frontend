"use client";

import Link from "next/link";
import { AlertTriangle, Minus, Plus, Trash2 } from "lucide-react";
import { Package } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import { FoodTypeMark } from "@/features/products/components/product-badges";
import { useRemoveCartItem, useToggleSaved, useUpdateCartQuantity } from "../hooks";
import type { CartItem } from "@/types/cart";

interface CartItemRowProps {
  item: CartItem;
  storeSlug: string;
  savedForLater?: boolean;
}

export function CartItemRow({ item, storeSlug, savedForLater = false }: CartItemRowProps) {
  const updateQuantity = useUpdateCartQuantity();
  const toggleSaved = useToggleSaved();
  const removeItem = useRemoveCartItem();

  return (
    <div className="flex flex-col gap-3 border-b py-4 last:border-b-0 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <div className="flex size-16 shrink-0 items-center justify-center rounded-md bg-muted">
          <Package className="size-6 text-muted-foreground" />
        </div>
        <div>
          <Link
            href={ROUTES.storeProductDetail(storeSlug, item.productId)}
            className="font-medium text-foreground hover:underline"
          >
            {item.product.foodType && (
              <FoodTypeMark foodType={item.product.foodType} className="mr-1.5 align-[-2px]" />
            )}
            {item.product.name}
          </Link>
          {item.variant && (
            <p className="text-xs text-muted-foreground">{item.variant.name}</p>
          )}
          {item.addons?.length > 0 && (
            <p className="text-xs text-muted-foreground">
              {item.addons.map((addon) => addon.name).join(", ")}
            </p>
          )}
          {item.product.requiresPrescription && (
            <p className="text-xs font-medium text-sky-700 dark:text-sky-400">
              Rx · prescription needed at checkout
            </p>
          )}
          <p className="mt-1 text-sm text-muted-foreground">
            &#8377;{item.unitPrice.toFixed(2)} each
          </p>
          {item.unavailableReason ? (
            <p className="mt-1 flex items-center gap-1 text-xs font-medium text-destructive">
              <AlertTriangle className="size-3" /> {item.unavailableReason}
            </p>
          ) : (
            item.insufficientStock && (
              <p className="mt-1 flex items-center gap-1 text-xs font-medium text-destructive">
                <AlertTriangle className="size-3" /> Only {item.availableStock} left in stock
              </p>
            )
          )}
        </div>
      </div>

      <div className="flex items-center gap-4 sm:gap-6">
        {!savedForLater && (
          <div className="flex items-center rounded-md border">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-8"
              disabled={item.quantity <= 1 || updateQuantity.isPending}
              onClick={() =>
                updateQuantity.mutate({ itemId: item.id, quantity: item.quantity - 1 })
              }
            >
              <Minus className="size-3.5" />
            </Button>
            <span className="w-8 text-center text-sm">{item.quantity}</span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-8"
              disabled={updateQuantity.isPending}
              onClick={() =>
                updateQuantity.mutate({ itemId: item.id, quantity: item.quantity + 1 })
              }
            >
              <Plus className="size-3.5" />
            </Button>
          </div>
        )}

        <span className="w-20 text-right font-medium text-foreground">
          &#8377;{item.lineTotal.toFixed(2)}
        </span>

        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-xs text-muted-foreground"
            disabled={toggleSaved.isPending}
            onClick={() =>
              toggleSaved.mutate({ itemId: item.id, savedForLater: !savedForLater })
            }
          >
            {savedForLater ? "Move to cart" : "Save for later"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Remove item"
            disabled={removeItem.isPending}
            onClick={() => removeItem.mutate(item.id)}
          >
            <Trash2 className="size-4 text-destructive" />
          </Button>
        </div>
      </div>
    </div>
  );
}
