"use client";

import Link from "next/link";
import {
  BadgeIndianRupee,
  Check,
  Copy,
  Loader2,
  MessageCircle,
  RefreshCw,
  Share2,
  Smartphone,
  Store as StoreIcon,
  Users,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { APP_NAME, PUBLIC_APP_URL } from "@/constants/config";
import { ROUTES } from "@/constants/routes";
import { useBecomeSeller } from "@/features/auth/hooks";
import { useHasMounted } from "@/hooks/use-has-mounted";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth-store";

const SELL_URL = `${PUBLIC_APP_URL}${ROUTES.sell}`;

const INVITE_TEXT = `Bring your shop online on ${APP_NAME} for free — no sign-up fee, no monthly charges, no commission. Take pickup and delivery orders from customers nearby and manage your store from your phone.`;

const WHATSAPP_URL = `https://wa.me/?text=${encodeURIComponent(`${INVITE_TEXT}\n\n${SELL_URL}`)}`;

// Mirrors the "Free to list" promise on the /sell page — keep the two in sync.
const PERKS = [
  { icon: BadgeIndianRupee, label: "Free to join — no fees or commission" },
  { icon: Smartphone, label: "Manage orders and stock from your phone" },
  { icon: Users, label: "Reach customers in your area" },
];

/**
 * The register button, matched to who's looking: signed-out visitors get a
 * seller sign-up, customers the one-click upgrade, sellers their dashboard.
 * Admins can't own stores, so they get nothing.
 */
function RegisterStoreAction() {
  const hasMounted = useHasMounted();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const role = useAuthStore((state) => state.user?.role);
  const becomeSeller = useBecomeSeller();

  // The session lives in localStorage, so hold the space until mount.
  if (!hasMounted) return <Skeleton className="h-9 w-44" />;

  if (!isAuthenticated) {
    return (
      <Button asChild>
        <Link href={`${ROUTES.register}?role=seller`}>Register your store free</Link>
      </Button>
    );
  }
  if (role === "customer") {
    return (
      <Button onClick={() => becomeSeller.mutate()} disabled={becomeSeller.isPending}>
        {becomeSeller.isPending && <Loader2 className="size-4 animate-spin" />}
        Register your store free
      </Button>
    );
  }
  if (role === "seller") {
    return (
      <Button asChild>
        <Link href={ROUTES.sellerDashboard}>Go to your seller dashboard</Link>
      </Button>
    );
  }
  return null;
}

function InviteLinkActions() {
  const [copied, setCopied] = useState(false);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(SELL_URL);
      setCopied(true);
      toast.success("Link copied. Send it to a store owner you know.");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Couldn't copy the link. Select it and copy it manually.");
    }
  }

  async function share() {
    try {
      await navigator.share({ title: `Sell on ${APP_NAME}`, text: INVITE_TEXT, url: SELL_URL });
    } catch {
      // User cancelled the share sheet — not an error worth surfacing.
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-1 rounded-md border border-border bg-background p-1 pl-3">
        <span className="min-w-0 flex-1 truncate text-sm text-muted-foreground select-all">
          {SELL_URL}
        </span>
        <Button size="sm" variant="ghost" onClick={copyLink} className="shrink-0 gap-1.5">
          {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
          {copied ? "Copied" : "Copy"}
        </Button>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button asChild size="sm" variant="outline" className="gap-1.5">
          <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
            <MessageCircle className="size-3.5" />
            Share on WhatsApp
          </a>
        </Button>
        {typeof navigator !== "undefined" && typeof navigator.share === "function" && (
          <Button size="sm" variant="outline" onClick={share} className="gap-1.5">
            <Share2 className="size-3.5" />
            More ways to share
          </Button>
        )}
      </div>
    </div>
  );
}

/**
 * Shown when no store is within range of the shopper — or the nearby lookup
 * failed. Instead of a dead end it invites store owners to register for free,
 * and shoppers to send the sign-up link to shops they know.
 */
export function NoStoresNearby({
  title = "No stores near you — yet",
  onRetry,
  className,
}: {
  title?: string;
  /** When set, adds a small "try again" link (used when the lookup errored). */
  onRetry?: () => void;
  className?: string;
}) {
  const hasMounted = useHasMounted();

  return (
    <section
      className={cn(
        "overflow-hidden rounded-xl border border-border bg-gradient-to-br from-primary/10 via-background to-accent/40",
        className
      )}
    >
      <div className="flex flex-col gap-6 p-5 sm:p-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-4">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <StoreIcon className="size-5" />
          </span>
          <div className="flex flex-col gap-1.5">
            <h3 className="text-lg font-semibold text-foreground sm:text-xl">{title}</h3>
            <p className="max-w-2xl text-sm text-muted-foreground">
              {APP_NAME} hasn&apos;t reached your area yet. Help us change that: if you own a
              store, put it online today, or send the link to a shop owner you know.{" "}
              <span className="font-medium text-foreground">
                It&apos;s completely free — no sign-up fee, no monthly charges, no commission.
              </span>
            </p>
          </div>
        </div>

        <ul className="flex flex-wrap gap-2">
          {PERKS.map(({ icon: Icon, label }) => (
            <li
              key={label}
              className="flex items-center gap-1.5 rounded-full border border-border bg-background/80 px-3 py-1 text-xs font-medium text-foreground"
            >
              <Icon className="size-3.5 text-primary" />
              {label}
            </li>
          ))}
        </ul>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="flex flex-col gap-3 rounded-lg border border-border bg-background/80 p-4">
            <div className="flex flex-col gap-1">
              <p className="font-medium text-foreground">Own a store?</p>
              <p className="text-sm text-muted-foreground">
                Create your free store page, list your products, and start taking pickup and
                delivery orders — all managed online.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <RegisterStoreAction />
              <Button asChild variant="link" className="px-1">
                <Link href={ROUTES.sell}>How it works</Link>
              </Button>
            </div>
          </div>

          <div className="flex flex-col gap-3 rounded-lg border border-border bg-background/80 p-4">
            <div className="flex flex-col gap-1">
              <p className="font-medium text-foreground">Know a shop owner nearby?</p>
              <p className="text-sm text-muted-foreground">
                Send them this link. They can bring their store online and run it on{" "}
                {APP_NAME} for free — and you&apos;ll be able to order from them here.
              </p>
            </div>
            {hasMounted ? <InviteLinkActions /> : <Skeleton className="h-20 w-full" />}
          </div>
        </div>

        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="flex items-center gap-1.5 self-start text-xs text-muted-foreground underline-offset-4 hover:underline"
          >
            <RefreshCw className="size-3" />
            Expected to see stores here? Try again
          </button>
        )}
      </div>
    </section>
  );
}
