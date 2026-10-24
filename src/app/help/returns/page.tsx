import type { Metadata } from "next";
import Link from "next/link";
import { Mail } from "lucide-react";

import { PolicySections, type PolicySection } from "@/components/shared/policy-sections";
import { Button } from "@/components/ui/button";
import { OrderStatusBadge } from "@/features/orders/components/order-status-badge";
import { APP_NAME } from "@/constants/config";
import { ROUTES } from "@/constants/routes";

export const metadata: Metadata = {
  title: "Returns & refunds",
  description: `How cancellations, returns, and refunds work for orders on ${APP_NAME}.`,
};

const linkClass = "font-medium text-primary hover:underline";

const SECTIONS: PolicySection[] = [
  {
    title: "1. Check the return policy before you buy",
    body: [
      `Every store on ${APP_NAME} is an independent business, so return eligibility is set by the seller, product by product. When a seller has set one, it's shown under "Return policy" on the product page.`,
      "If a product doesn't list a return policy, ask the store before ordering — their phone number and email are on the store page.",
    ],
  },
  {
    title: "2. Changed your mind? Cancel instead",
    body: [
      <>
        You can cancel an order yourself while it&apos;s <OrderStatusBadge status="new" /> or{" "}
        <OrderStatusBadge status="processing" /> — open it from{" "}
        <Link href={ROUTES.orders} className={linkClass}>
          your orders
        </Link>{" "}
        and choose Cancel. Since payment is Cash on Delivery, there&apos;s nothing to refund.
      </>,
      "Once an order is packed, only the store can cancel it, so contact them directly as soon as possible.",
    ],
  },
  {
    title: "3. Requesting a return",
    body: [
      "Contact the store with your order number (it starts with BODA-) and the reason for the return. If the item arrived damaged or isn't what you ordered, say so straight away and keep the packaging.",
      <>
        If the store doesn&apos;t respond or you can&apos;t agree on a fix,{" "}
        <Link href={ROUTES.contact} className={linkClass}>
          contact us
        </Link>{" "}
        with the order number and we&apos;ll follow up with the seller.
      </>,
    ],
  },
  {
    title: "4. Tracking a return",
    body: [
      <>
        When the store accepts the return, they mark the order{" "}
        <OrderStatusBadge status="returned" />, and then <OrderStatusBadge status="refunded" />{" "}
        once you&apos;ve been paid back. Both steps appear on the order&apos;s timeline.
      </>,
    ],
  },
  {
    title: "5. How refunds are paid",
    body: [
      `${APP_NAME} doesn't process card or online payments at this stage. Every order is paid in cash to the store at delivery or pickup, so refunds are paid by the store too. Agree with them how you'll receive it.`,
    ],
  },
];

export default function ReturnsPage() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-8 px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-2">
        <Link href={ROUTES.help} className="text-sm font-medium text-primary hover:underline">
          &larr; Help center
        </Link>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Returns & refunds</h1>
        <p className="text-sm text-muted-foreground">
          How cancellations, returns, and refunds work for orders placed on {APP_NAME}.
        </p>
      </div>

      <PolicySections sections={SECTIONS} />

      <div className="flex flex-col gap-3 rounded-xl border bg-muted/30 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-semibold text-foreground">Problem with an order?</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Send us the order number and what went wrong. We&apos;ll take it from there.
          </p>
        </div>
        <Button asChild className="gap-1.5">
          <Link href={ROUTES.contact}>
            <Mail className="size-4" />
            Contact support
          </Link>
        </Button>
      </div>
    </div>
  );
}
