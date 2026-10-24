"use client";

import Link from "next/link";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ROUTES } from "@/constants/routes";
import { useHasMounted } from "@/hooks/use-has-mounted";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth-store";
import { useBecomeSeller } from "../hooks";

/**
 * The "start selling" call to action for the public /sell pages. What it
 * offers depends on who's looking: signed-out visitors get a seller sign-up,
 * customers get the one-click upgrade (same as BecomeSellerCard on the
 * account page), sellers get their dashboard. Linking straight to
 * /seller/onboarding instead would bounce customers back to the homepage,
 * since the seller layout only admits seller accounts.
 */
export function StartSellingActions({ className }: { className?: string }) {
  const hasMounted = useHasMounted();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const role = useAuthStore((state) => state.user?.role);
  const becomeSeller = useBecomeSeller();

  // The session lives in localStorage, so the right button is only known
  // after mount — hold the space rather than flash the signed-out version.
  if (!hasMounted) {
    return <Skeleton className={cn("h-10 w-56", className)} />;
  }

  if (!isAuthenticated) {
    return (
      <div className={cn("flex flex-col gap-3 sm:flex-row", className)}>
        <Button asChild size="lg">
          <Link href={`${ROUTES.register}?role=seller`}>Create a seller account</Link>
        </Button>
        <Button asChild size="lg" variant="outline">
          <Link href={`${ROUTES.login}?redirect=${encodeURIComponent(ROUTES.sell)}`}>
            I already have an account
          </Link>
        </Button>
      </div>
    );
  }

  if (role === "customer") {
    return (
      <div className={cn("flex flex-col items-start gap-2", className)}>
        <Button size="lg" onClick={() => becomeSeller.mutate()} disabled={becomeSeller.isPending}>
          {becomeSeller.isPending && <Loader2 className="size-4 animate-spin" />}
          Switch to a seller account
        </Button>
        <p className="text-xs text-muted-foreground">
          Your orders, addresses, and wishlist stay as they are, and you can keep shopping.
        </p>
      </div>
    );
  }

  if (role === "seller") {
    return (
      <Button asChild size="lg" className={className}>
        <Link href={ROUTES.sellerDashboard}>Go to your seller dashboard</Link>
      </Button>
    );
  }

  // Admins can't own stores; nothing to offer.
  return null;
}
