import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Bike, MapPinned, ShoppingBag, Store } from "lucide-react";

import { Button } from "@/components/ui/button";
import { APP_NAME } from "@/constants/config";
import { ROUTES } from "@/constants/routes";

export const metadata: Metadata = {
  title: "About",
  description: `Learn how ${APP_NAME} connects customers with local stores for pickup and delivery.`,
};

const VALUES = [
  {
    icon: Store,
    title: "Local stores, front and center",
    body: "Every store on BODA is a real, independent business in your area — groceries, electronics, pharmacies, restaurants, and more. We don't run our own warehouses; we help the stores already in your neighborhood reach more customers.",
  },
  {
    icon: MapPinned,
    title: "Built around your neighborhood",
    body: "Discovery is location-first: browse what's actually near you, see real distances, and know before you order whether a store delivers, offers pickup, or both.",
  },
  {
    icon: Bike,
    title: "Pickup or delivery, seller's choice",
    body: "Sellers set their own delivery radius, fees, and hours. Some stores are pickup-only, some deliver, some do both — the storefront always tells you which before you check out.",
  },
  {
    icon: ShoppingBag,
    title: "Straightforward for sellers",
    body: "Any local business can list their catalog, manage orders, and track stock from one dashboard — no separate app, no long onboarding, just a store page and a queue of orders.",
  },
];

export default function AboutPage() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-10 px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-3">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">About {APP_NAME}</h1>
        <p className="text-muted-foreground">
          {APP_NAME} is a local marketplace that connects customers with nearby stores for pickup
          and delivery — everyday essentials, from the businesses already around you.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        {VALUES.map(({ icon: Icon, title, body }) => (
          <div key={title} className="flex flex-col gap-2 rounded-xl border p-5">
            <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Icon className="size-4.5" />
            </span>
            <h2 className="font-semibold text-foreground">{title}</h2>
            <p className="text-sm text-muted-foreground">{body}</p>
          </div>
        ))}
      </div>

      <Link
        href={ROUTES.howItWorks}
        className="group flex items-center justify-between gap-4 rounded-xl border p-5 transition-colors hover:bg-muted/50"
      >
        <div>
          <h2 className="font-semibold text-foreground">See how it works</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            From finding a store to paying on delivery, step by step, for shoppers and sellers.
          </p>
        </div>
        <ArrowRight className="size-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
      </Link>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col items-start gap-3 rounded-xl border bg-muted/30 p-6">
          <div>
            <h2 className="font-semibold text-foreground">Shopping locally?</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              See which stores near you deliver or offer pickup.
            </p>
          </div>
          <Button asChild variant="outline" className="mt-auto">
            <Link href={ROUTES.stores}>Browse stores</Link>
          </Button>
        </div>
        <div className="flex flex-col items-start gap-3 rounded-xl border bg-muted/30 p-6">
          <div>
            <h2 className="font-semibold text-foreground">Have a store of your own?</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              List your catalog and start taking orders from customers nearby.
            </p>
          </div>
          <Button asChild className="mt-auto">
            <Link href={ROUTES.sell}>Sell on {APP_NAME}</Link>
          </Button>
        </div>
      </div>

      <p className="text-sm text-muted-foreground">
        Want to work with us? Visit{" "}
        <Link href={ROUTES.careers} className="font-medium text-primary hover:underline">
          Careers
        </Link>
        . Questions or feedback?{" "}
        <Link href={ROUTES.contact} className="font-medium text-primary hover:underline">
          Get in touch
        </Link>
        .
      </p>
    </div>
  );
}
