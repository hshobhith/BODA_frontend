"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ROUTES } from "@/constants/routes";

interface CartSummaryProps {
  storeId: string;
  subtotal: number;
  itemCount: number;
  hasInsufficientStock: boolean;
}

export function CartSummary({ storeId, subtotal, itemCount, hasInsufficientStock }: CartSummaryProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Order summary</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2 text-sm">
        <div className="flex justify-between text-muted-foreground">
          <span>
            Subtotal ({itemCount} item{itemCount === 1 ? "" : "s"})
          </span>
          <span className="text-foreground">&#8377;{subtotal.toFixed(2)}</span>
        </div>
        <p className="text-xs text-muted-foreground">
          Delivery fee (if any) is calculated on the checkout page for this store.
        </p>
      </CardContent>
      <CardFooter>
        <Button asChild className="w-full" disabled={hasInsufficientStock}>
          <Link href={`${ROUTES.checkout}?storeId=${storeId}`}>
            {hasInsufficientStock ? "Fix the items marked above to continue" : "Proceed to checkout"}
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
