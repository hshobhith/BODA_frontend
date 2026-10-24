"use client";

import { useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShoppingBag } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ROUTES } from "@/constants/routes";
import { CartItemRow } from "@/features/cart/components/cart-item-row";
import { CartSummary } from "@/features/cart/components/cart-summary";
import { useCart, useSavedForLater } from "@/features/cart/hooks";
import { useStore } from "@/features/stores/hooks";
import { useHasMounted } from "@/hooks/use-has-mounted";
import { useStoreModeSlug } from "@/hooks/use-store-mode";
import { useAuthStore } from "@/store/auth-store";
import type { CartItem } from "@/types/cart";

function groupByStore(items: CartItem[]) {
  const groups = new Map<string, { storeId: string; storeSlug: string; items: CartItem[] }>();
  for (const item of items) {
    const key = item.product.storeId;
    if (!groups.has(key)) {
      // The lightweight cart product summary doesn't include the store's
      // slug, only its id — see the note in types/cart.ts. We fall back to
      // linking by id in product links where a slug isn't available.
      groups.set(key, { storeId: key, storeSlug: key, items: [] });
    }
    groups.get(key)!.items.push(item);
  }
  return Array.from(groups.values());
}

export default function CartPage() {
  const router = useRouter();
  const hasMounted = useHasMounted();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const cartQuery = useCart();
  const savedQuery = useSavedForLater();
  // Store-only mode (a store's private link) shows just that store's items.
  const storeModeSlug = useStoreModeSlug();
  const storeModeQuery = useStore(storeModeSlug ?? "");
  const storeModeId = storeModeQuery.data?.id;
  const inScope = useMemo(
    () => (item: CartItem) => !storeModeSlug || item.product.storeId === storeModeId,
    [storeModeSlug, storeModeId]
  );

  useEffect(() => {
    if (hasMounted && !isAuthenticated) {
      router.replace(`${ROUTES.login}?redirect=${encodeURIComponent(ROUTES.cart)}`);
    }
  }, [hasMounted, isAuthenticated, router]);

  const storeGroups = useMemo(
    () => groupByStore((cartQuery.data?.items ?? []).filter(inScope)),
    [cartQuery.data, inScope]
  );

  if (!hasMounted || !isAuthenticated || cartQuery.isLoading || storeModeQuery.isLoading) {
    return (
      <div className="mx-auto flex max-w-5xl flex-col gap-4 px-4 py-10 sm:px-6 lg:px-8">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  const items = (cartQuery.data?.items ?? []).filter(inScope);
  const savedItems = (savedQuery.data?.items ?? []).filter(inScope);

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">Your cart</h1>

      {items.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
            <ShoppingBag className="size-10 text-muted-foreground" />
            <p className="text-muted-foreground">Your cart is empty.</p>
            <Button asChild>
              {storeModeSlug ? (
                <Link href={ROUTES.storeDetail(storeModeSlug)}>Back to the store</Link>
              ) : (
                <Link href={ROUTES.products}>Browse products</Link>
              )}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-6">
          {storeGroups.map((group) => {
            const subtotal = group.items.reduce((sum, item) => sum + item.lineTotal, 0);
            // Stock shortfalls and unavailable lines (sold out, expired, changed add-ons) both block checkout.
            const hasInsufficientStock = group.items.some(
              (item) => item.insufficientStock || !!item.unavailableReason
            );
            return (
              <div key={group.storeId} className="grid gap-4 lg:grid-cols-3">
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle className="text-base">Items</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {group.items.map((item) => (
                      <CartItemRow key={item.id} item={item} storeSlug={storeModeSlug ?? group.storeSlug} />
                    ))}
                  </CardContent>
                </Card>
                <CartSummary
                  storeId={group.storeId}
                  subtotal={subtotal}
                  itemCount={group.items.length}
                  hasInsufficientStock={hasInsufficientStock}
                />
              </div>
            );
          })}
        </div>
      )}

      {savedItems.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Saved for later ({savedItems.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {savedItems.map((item) => (
              <CartItemRow
                key={item.id}
                item={item}
                storeSlug={storeModeSlug ?? item.product.storeId}
                savedForLater
              />
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
