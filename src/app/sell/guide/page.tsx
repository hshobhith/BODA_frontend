import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";

import { StartSellingActions } from "@/features/auth/components/start-selling-actions";
import { OrderStatusFlow } from "@/features/orders/components/order-status-flow";
import { APP_NAME } from "@/constants/config";
import { ROUTES } from "@/constants/routes";

export const metadata: Metadata = {
  title: "Seller guide",
  description: `How to set up and run your store on ${APP_NAME}: products, stock, delivery, and orders.`,
};

const linkClass = "font-medium text-primary hover:underline";

interface GuideSection {
  id: string;
  title: string;
  content: ReactNode;
}

function Steps({ items }: { items: ReactNode[] }) {
  return (
    <ul className="flex list-disc flex-col gap-1.5 pl-5 text-sm text-muted-foreground marker:text-muted-foreground/60">
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  );
}

const SECTIONS: GuideSection[] = [
  {
    id: "setup",
    title: "Setting up your store",
    content: (
      <>
        <p>
          After you create a seller account you&apos;re taken to store setup. You&apos;ll need:
        </p>
        <Steps
          items={[
            "Store name, business type, and an optional description.",
            "A phone number and email customers can reach you on. Both are shown on your store page.",
            "Your address, plus a pin on the map. The pin is what distance-based search uses, so place it accurately.",
            "Who can find you: within 5–50 km, anywhere in your state or country, or everywhere.",
            "Optionally, your GST number and license details.",
          ]}
        />
        <p>
          You can add a logo and banner and change any of these details later under{" "}
          <strong>Store settings → Basic info</strong>.
        </p>
      </>
    ),
  },
  {
    id: "approval",
    title: "Approval and opening",
    content: (
      <>
        <p>
          Every new store is reviewed by our team before customers can see it. While it&apos;s
          pending, your dashboard says so. If a store isn&apos;t approved, the reason is
          shown there too.
        </p>
        <p>
          <strong>Approval doesn&apos;t open your store automatically.</strong> Once approved, go
          to Store settings and set the status at the top to <strong>Open for business</strong>.
          Use <strong>Temporarily closed</strong> or <strong>On vacation</strong> whenever you need
          a break.
        </p>
      </>
    ),
  },
  {
    id: "hours",
    title: "Opening hours",
    content: (
      <p>
        Under <strong>Store settings → Working hours</strong>, set opening and closing times for
        each day, with an optional break (for example, a lunch hour). Mark days you&apos;re shut
        as holidays. Customers see your hours on your store page.
      </p>
    ),
  },
  {
    id: "delivery",
    title: "Delivery settings",
    content: (
      <>
        <p>
          Under <strong>Store settings → Delivery settings</strong>, choose how customers get their
          orders:
        </p>
        <Steps
          items={[
            "Mode: pickup only, delivery, or both. Checkout only offers what you enable.",
            "Delivery radius, the distance you're willing to deliver.",
            "Delivery fee, a flat amount added to delivery orders.",
            "Free-delivery threshold: orders at or above this amount skip the delivery fee.",
            "Delivery speed: 10 minutes, same day, next day, 3–5 days, or custom.",
          ]}
        />
        <p>
          You can also limit individual products to delivery or pickup only from the product form.
        </p>
      </>
    ),
  },
  {
    id: "products",
    title: "Adding products",
    content: (
      <>
        <p>
          Go to <strong>Products → Add product</strong>. Name, category, price, and stock quantity
          are required; everything else helps customers decide:
        </p>
        <Steps
          items={[
            "Photos. The first image is the one shown in listings.",
            "A discount price, if the item is on offer. Customers see the original price struck through.",
            "Brand, SKU, barcode, weight, and tags.",
            "A return policy. It's shown on the product page, so be specific (for example, “Returnable within 7 days if unopened”).",
            "Variants such as sizes or pack quantities, each with its own SKU, price difference, and stock.",
          ]}
        />
      </>
    ),
  },
  {
    id: "stock",
    title: "Managing stock",
    content: (
      <p>
        Stock goes down automatically when an order is placed and back up if it&apos;s cancelled
        or returned. For anything else, such as a new delivery from your supplier, breakage, or a
        recount, use <strong>Adjust stock</strong> on the product and give a reason, so you keep an
        accurate history. Each product has a <em>low stock alert</em> level, and products below it
        are flagged on your dashboard.
      </p>
    ),
  },
  {
    id: "orders",
    title: "Fulfilling orders",
    content: (
      <>
        <p>New orders appear under Orders. Move each one forward as you work on it:</p>
        <OrderStatusFlow />
        <Steps
          items={[
            "The customer can follow every step on their order timeline.",
            "Marking an order Delivered also marks it paid, since that's when you collect the cash.",
            "You can cancel an order up to the Packed stage. Customers can cancel on their own only while it's New or Processing.",
            "If a delivered order comes back, mark it Returned (its stock is restored), then Refunded once you've paid the customer back.",
          ]}
        />
      </>
    ),
  },
  {
    id: "walk-in",
    title: "Walk-in (offline) sales",
    content: (
      <p>
        Sold something over the counter? Use <strong>Record an offline sale</strong> on the Orders
        page. It deducts stock and creates a receipt just like an online order, with an optional
        customer name, phone, and note, so your stock stays accurate across both channels.
      </p>
    ),
  },
  {
    id: "reviews",
    title: "Reviews",
    content: (
      <p>
        The Reviews page collects reviews of your store and of your products in one place. Reply
        to thank customers or to address a complaint. Replies are public, and you can remove a
        reply later.
      </p>
    ),
  },
  {
    id: "sharing",
    title: "Sharing your store",
    content: (
      <p>
        Under <strong>Store settings → Share store</strong>, copy your store&apos;s link for social
        media or messaging apps, or download a QR code to print for your counter or shopfront.
      </p>
    ),
  },
  {
    id: "multiple-stores",
    title: "Running more than one store",
    content: (
      <p>
        Use the store switcher at the top of the seller menu to move between your stores, or
        choose <strong>Add another store</strong> to set up a new one. Each store is approved
        separately and has its own products, hours, delivery settings, and orders.
      </p>
    ),
  },
];

export default function SellerGuidePage() {
  return (
    <div className="mx-auto flex max-w-6xl gap-12 px-4 py-12 sm:px-6 lg:px-8">
      <aside className="hidden w-52 shrink-0 lg:block">
        <nav aria-label="Guide sections" className="sticky top-24 flex flex-col gap-1">
          <p className="mb-2 px-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            On this page
          </p>
          {SECTIONS.map((section) => (
            <a
              key={section.id}
              href={`#${section.id}`}
              className="rounded-md px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              {section.title}
            </a>
          ))}
        </nav>
      </aside>

      <div className="flex min-w-0 max-w-3xl flex-1 flex-col gap-10">
        <div className="flex flex-col gap-3">
          <Link href={ROUTES.sell} className="text-sm font-medium text-primary hover:underline">
            &larr; Sell on {APP_NAME}
          </Link>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Seller guide</h1>
          <p className="text-muted-foreground">
            Everything you need to set up and run your store on {APP_NAME}, from first setup to
            your hundredth order. Questions this doesn&apos;t answer?{" "}
            <Link href={ROUTES.contact} className={linkClass}>
              Contact us
            </Link>
            .
          </p>
        </div>

        {SECTIONS.map((section) => (
          <section
            key={section.id}
            id={section.id}
            className="flex scroll-mt-24 flex-col gap-3 text-sm text-muted-foreground [&_strong]:text-foreground"
          >
            <h2 className="text-xl font-semibold tracking-tight text-foreground">
              {section.title}
            </h2>
            {section.content}
          </section>
        ))}

        <div className="flex flex-col gap-4 rounded-xl border bg-muted/30 p-6">
          <div>
            <h2 className="font-semibold text-foreground">Ready to open your store?</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              It takes a few minutes to set up. You can fill in the details later.
            </p>
          </div>
          <StartSellingActions />
        </div>
      </div>
    </div>
  );
}
