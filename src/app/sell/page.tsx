import type { Metadata } from "next";
import Link from "next/link";
import {
  BadgeIndianRupee,
  Bike,
  ClipboardList,
  HandCoins,
  MessageSquareText,
  Package,
  QrCode,
  Tags,
  Wallet,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { APP_NAME } from "@/constants/config";
import { ROUTES } from "@/constants/routes";
import { StartSellingActions } from "@/features/auth/components/start-selling-actions";

export const metadata: Metadata = {
  // `absolute` skips the root "%s | BODA" template, which would repeat the name.
  title: { absolute: `Sell on ${APP_NAME}` },
  description: `Open your store on ${APP_NAME} and take pickup and delivery orders from customers nearby.`,
};

const FEATURES = [
  {
    icon: QrCode,
    title: "Your own storefront",
    body: "A store page with your logo, banner, and opening hours, plus a shareable link and QR code to put on your counter.",
  },
  {
    icon: Bike,
    title: "Delivery on your terms",
    body: "Offer pickup, delivery, or both. You set the delivery radius, fee, free-delivery threshold, and how fast you deliver.",
  },
  {
    icon: Package,
    title: "Catalog & stock tools",
    body: "List products with photos and variants, track stock with a full adjustment history, and get low-stock alerts.",
  },
  {
    icon: ClipboardList,
    title: "A simple order queue",
    body: "Move each order from New to Packed to Delivered in a couple of clicks. Customers follow every step on their order timeline.",
  },
  {
    icon: HandCoins,
    title: "Walk-in sales too",
    body: "Record in-store sales from the same dashboard, so stock stays accurate across online and counter orders.",
  },
  {
    icon: MessageSquareText,
    title: "Reviews & insights",
    body: "Reply to customer reviews, and see revenue and order trends for your store at a glance.",
  },
];

const STEPS = [
  {
    title: "Create a seller account",
    body: "Sign up as a seller, or switch your existing customer account in one click.",
  },
  {
    title: "Set up your store",
    body: "Add your store name, contact details, location on the map, opening hours, and delivery settings.",
  },
  {
    title: "Get approved",
    body: "Our team reviews each new store before it goes live. Your dashboard shows where things stand.",
  },
  {
    title: "Open and start selling",
    body: "Add your products, set your store to Open, and orders start arriving in your dashboard.",
  },
];

const PRICING = [
  {
    icon: BadgeIndianRupee,
    title: "Free to list",
    body: `${APP_NAME} doesn't charge sellers anything right now: no sign-up fee, no monthly subscription, and no commission on orders.`,
  },
  {
    icon: Tags,
    title: "You set the prices",
    body: "Your product prices and discounts, your delivery fee, and the order amount above which delivery is free.",
  },
  {
    icon: Wallet,
    title: "Paid directly",
    body: "Customers pay you in cash at delivery or pickup, so there are no payouts to wait for.",
  },
];

export default function SellPage() {
  return (
    <div className="flex flex-col">
      <section className="border-b border-border bg-gradient-to-b from-accent/60 to-background">
        <div className="mx-auto flex max-w-5xl flex-col items-start gap-5 px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
          <h1 className="max-w-2xl text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Sell to customers in your neighborhood.
          </h1>
          <p className="max-w-xl text-base text-muted-foreground sm:text-lg">
            Put your store on {APP_NAME} and take pickup and delivery orders from people nearby —
            from the same dashboard you use to manage stock and walk-in sales.
          </p>
          <StartSellingActions />
        </div>
      </section>

      <div className="mx-auto flex w-full max-w-5xl flex-col gap-16 px-4 py-14 sm:px-6 lg:px-8">
        <section className="flex flex-col gap-6">
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">
            Everything you need to run your store online
          </h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map(({ icon: Icon, title, body }) => (
              <div key={title} className="flex flex-col gap-2 rounded-xl border p-5">
                <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="size-4.5" />
                </span>
                <h3 className="font-semibold text-foreground">{title}</h3>
                <p className="text-sm text-muted-foreground">{body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="flex flex-col gap-6">
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">
            How to get started
          </h2>
          <ol className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map(({ title, body }, i) => (
              <li key={title} className="flex flex-col gap-2">
                <span className="flex size-8 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                  {i + 1}
                </span>
                <h3 className="font-semibold text-foreground">{title}</h3>
                <p className="text-sm text-muted-foreground">{body}</p>
              </li>
            ))}
          </ol>
        </section>

        <section id="fees" className="flex scroll-mt-24 flex-col gap-6">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">
              Fees & pricing
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Straightforward: what you charge is what you earn.
            </p>
          </div>
          <div className="grid gap-5 sm:grid-cols-3">
            {PRICING.map(({ icon: Icon, title, body }) => (
              <div key={title} className="flex flex-col gap-2 rounded-xl border bg-muted/30 p-5">
                <Icon className="size-5 text-primary" />
                <h3 className="font-semibold text-foreground">{title}</h3>
                <p className="text-sm text-muted-foreground">{body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="flex flex-col gap-4 rounded-xl border p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-semibold text-foreground">Want the details first?</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              The seller guide walks through store setup, products, delivery, and orders.
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href={ROUTES.sellerGuide}>Read the seller guide</Link>
          </Button>
        </section>
      </div>
    </div>
  );
}
