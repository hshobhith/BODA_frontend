"use client";

import Link from "next/link";
import { Share2, Store as StoreIcon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { APP_NAME, SITE_URL } from "@/constants/config";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

const SELL_URL = `${SITE_URL}${ROUTES.sell}`;

async function inviteStoreOwner() {
  if (typeof navigator.share === "function") {
    try {
      await navigator.share({
        title: `Sell on ${APP_NAME}`,
        text: `Bring your store online with ${APP_NAME} and reach customers nearby.`,
        url: SELL_URL,
      });
    } catch {
      // User cancelled the share sheet — not an error worth surfacing.
    }
    return;
  }
  try {
    await navigator.clipboard.writeText(SELL_URL);
    toast.success("Link copied. Send it to a store owner you know.");
  } catch {
    toast.error(`Couldn't copy the link. Share ${SELL_URL} instead.`);
  }
}

/**
 * Empty state for when no store is within range of the shopper: says so, and
 * asks them to help bring local shops onto the platform.
 */
export function NoStoresNearby({
  title = "No stores in your area yet",
  className,
}: {
  title?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-4 rounded-lg border border-dashed border-border bg-muted/40 px-4 py-10 text-center",
        className
      )}
    >
      <span className="flex size-10 items-center justify-center rounded-full bg-accent text-accent-foreground">
        <StoreIcon className="size-5" />
      </span>
      <div className="flex max-w-md flex-col gap-1.5">
        <p className="font-medium text-foreground">{title}</p>
        <p className="text-sm text-muted-foreground">
          {APP_NAME}{" "}
          hasn&apos;t reached your location yet. Are you a store owner, or do you know shop
          owners nearby? Tell them about {APP_NAME} and help bring their business online.
        </p>
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        <Button asChild size="sm">
          <Link href={ROUTES.sell}>Become a seller</Link>
        </Button>
        <Button size="sm" variant="outline" onClick={inviteStoreOwner} className="gap-1.5">
          <Share2 className="size-3.5" />
          Invite a store owner
        </Button>
      </div>
    </div>
  );
}
