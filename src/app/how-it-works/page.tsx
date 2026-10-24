import type { Metadata } from "next";
import Link from "next/link";
import {
  Banknote,
  ClipboardList,
  MapPin,
  PackagePlus,
  ShoppingCart,
  Store,
  Truck,
  UserPlus,
  type LucideIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { OrderStatusFlow } from "@/features/orders/components/order-status-flow";
import { APP_NAME } from "@/constants/config";
import { ROUTES } from "@/constants/routes";

export const metadata: Metadata = {
  title: "How it works",
  description: `How ordering from local stores on ${APP_NAME} works, for shoppers and for sellers.`,
};

interface Step {
  icon: LucideIcon;
  title: string;
  body: string;
}

const SHOPPER_STEPS: Step[] = [
  {
    icon: MapPin,
    title: "Find a store near you",
    body: "Allow location access to see stores around you, or browse and search every store and product by category.",
  },
  {
    icon: ShoppingCart,
    title: "Fill your cart",
    body: "Add items from one store or several. Each product page shows the price, stock, and the store's return policy.",
  },
  {
    icon: Truck,
    title: "Choose pickup or delivery",
    body: "Pick whichever the store offers. For delivery, choose a saved address. You'll see the delivery fee before you confirm.",
  },
  {
    icon: Banknote,
    title: "Pay when it reaches you",
    body: "Pay in cash at your door or at the store counter. Until then, follow each step of your order live.",
  },
];

const SELLER_STEPS: Step[] = [
  {
    icon: UserPlus,
    title: "Create a seller account",
    body: "Sign up as a seller, or switch your existing customer account in one click.",
  },
  {
    icon: Store,
    title: "Set up your store",
    body: "Add your details, location, opening hours, and delivery options. Our team approves new stores before they go live.",
  },
  {
    icon: PackagePlus,
    title: "List your products",
    body: "Add photos, prices, variants, and stock. Low-stock alerts tell you when to reorder.",
  },
  {
    icon: ClipboardList,
    title: "Fulfil orders",
    body: "New orders land in your dashboard. Pack them, hand them over, and collect payment on delivery or pickup.",
  },
];

function StepList({ steps }: { steps: Step[] }) {
  return (
    <ol className="flex flex-col gap-5">
      {steps.map(({ icon: Icon, title, body }, i) => (
        <li key={title} className="flex gap-4">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Icon className="size-5" />
          </span>
          <div className="flex flex-col gap-1">
            <h3 className="font-semibold text-foreground">
              <span className="mr-1.5 text-muted-foreground">{i + 1}.</span>
              {title}
            </h3>
            <p className="text-sm text-muted-foreground">{body}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

export default function HowItWorksPage() {
  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-14 px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex max-w-2xl flex-col gap-3">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">How {APP_NAME} works</h1>
        <p className="text-muted-foreground">
          {APP_NAME} connects you with independent stores in your neighborhood. They list what
          they have, you order, and they get it to you, by delivery or ready for pickup.
        </p>
      </div>

      <div className="grid gap-10 lg:grid-cols-2">
        <section id="shoppers" className="flex scroll-mt-24 flex-col gap-6 rounded-xl border p-6">
          <h2 className="text-xl font-semibold tracking-tight text-foreground">For shoppers</h2>
          <StepList steps={SHOPPER_STEPS} />
          <Button asChild className="mt-auto self-start">
            <Link href={ROUTES.stores}>Browse stores</Link>
          </Button>
        </section>

        <section id="sellers" className="flex scroll-mt-24 flex-col gap-6 rounded-xl border p-6">
          <h2 className="text-xl font-semibold tracking-tight text-foreground">For sellers</h2>
          <StepList steps={SELLER_STEPS} />
          <Button asChild variant="outline" className="mt-auto self-start">
            <Link href={ROUTES.sell}>Sell on {APP_NAME}</Link>
          </Button>
        </section>
      </div>

      <section className="flex flex-col gap-4">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-foreground">
            What happens after you order
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Every order moves through the same steps, and you can see where yours is from{" "}
            <Link href={ROUTES.orders} className="font-medium text-primary hover:underline">
              your orders
            </Link>
            . You can cancel while it&apos;s New or Processing.
          </p>
        </div>
        <OrderStatusFlow />
      </section>

      <section className="grid gap-6 sm:grid-cols-2">
        <div className="flex flex-col gap-2 rounded-xl border bg-muted/30 p-6">
          <h2 className="font-semibold text-foreground">Paying</h2>
          <p className="text-sm text-muted-foreground">
            Every order is Cash on Delivery: you pay the store when your order arrives or when you
            collect it. Nothing is charged when you place an order.
          </p>
        </div>
        <div className="flex flex-col gap-2 rounded-xl border bg-muted/30 p-6">
          <h2 className="font-semibold text-foreground">Returns</h2>
          <p className="text-sm text-muted-foreground">
            Return rules are set by each store and shown on the product page.{" "}
            <Link href={ROUTES.returns} className="font-medium text-primary hover:underline">
              How returns & refunds work
            </Link>
          </p>
        </div>
      </section>

      <p className="text-sm text-muted-foreground">
        More questions? The{" "}
        <Link href={ROUTES.help} className="font-medium text-primary hover:underline">
          Help center
        </Link>{" "}
        has answers on orders, payments, accounts, and selling.
      </p>
    </div>
  );
}
