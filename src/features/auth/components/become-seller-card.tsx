"use client";

import { Loader2, Store } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useBecomeSeller } from "../hooks";

/**
 * Self-service customer -> seller upgrade, shown only to customer accounts.
 * Upgrading to admin is deliberately not offered here — that stays an
 * admin-granted action (see the admin user table).
 */
export function BecomeSellerCard() {
  const becomeSeller = useBecomeSeller();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Store className="size-4" />
          Start selling on BODA
        </CardTitle>
        <CardDescription>
          Open your own store — list products, manage orders, and reach shoppers nearby.
        </CardDescription>
        <CardAction>
          <Button onClick={() => becomeSeller.mutate()} disabled={becomeSeller.isPending}>
            {becomeSeller.isPending && <Loader2 className="size-4 animate-spin" />}
            Become a seller
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Your account switches to a seller account right away. Your new store will need admin
          approval before it&apos;s visible to shoppers.
        </p>
      </CardContent>
    </Card>
  );
}
