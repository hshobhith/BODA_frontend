import type { Metadata } from "next";

import { PolicySections, type PolicySection } from "@/components/shared/policy-sections";
import { APP_NAME } from "@/constants/config";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: `The terms that govern using ${APP_NAME}.`,
};

const SECTIONS: PolicySection[] = [
  {
    title: "1. What BODA is",
    body: [
      `${APP_NAME} is a marketplace that connects customers with independent local stores ("sellers") for pickup and delivery orders. ${APP_NAME} is not the seller of record for products listed by third-party stores — each seller is responsible for the accuracy of their own listings, pricing, stock, and fulfillment.`,
    ],
  },
  {
    title: "2. Accounts",
    body: [
      "You must provide accurate information when registering and are responsible for keeping your login credentials secure. You're responsible for activity that happens under your account.",
      "Sellers are responsible for the accuracy of their store details, product listings, stock levels, and fulfillment (pickup/delivery) commitments.",
    ],
  },
  {
    title: "3. Orders, pricing & payment",
    body: [
      "Prices, stock, and delivery/pickup availability are set by each store and can change without notice. Placing an order is an offer to purchase, which the seller may accept or, in limited cases (e.g. an item going out of stock), cancel.",
      "Cash on Delivery (COD) is the payment method supported at this stage — payment is collected at the time of delivery or pickup.",
    ],
  },
  {
    title: "4. Cancellations, returns & refunds",
    body: [
      "Orders can be cancelled while still new or in processing. Once packed, shipped, or out for delivery, cancellation is at the seller's discretion.",
      "Return and refund eligibility is set per product/store and shown on the product page — check it before ordering. For a problem with a specific order, contact us with the order number and we'll help coordinate with the seller.",
    ],
  },
  {
    title: "5. Reviews & conduct",
    body: [
      "Reviews should reflect a genuine experience with a product or store. We may remove reviews or listings that are fraudulent, abusive, or otherwise violate these terms.",
      "Don't use the platform to sell prohibited or illegal goods, misrepresent a store or its stock, or attempt to circumvent order/payment flows.",
    ],
  },
  {
    title: "6. Limitation of liability",
    body: [
      `${APP_NAME} provides the marketplace platform "as is" and is not liable for a seller's fulfillment, product quality, or delivery timing beyond facilitating the connection between buyer and seller and providing order-tracking tools.`,
    ],
  },
  {
    title: "7. Changes to these terms",
    body: [
      "We may update these terms as the platform evolves. Continued use after a change means you accept the updated terms.",
    ],
  },
];

export default function TermsPage() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-8 px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Terms of Service</h1>
        <p className="text-sm text-muted-foreground">
          These terms govern your use of {APP_NAME}. By using the platform, you agree to them.
        </p>
      </div>

      <PolicySections sections={SECTIONS} />
    </div>
  );
}
