import type { Metadata } from "next";
import Link from "next/link";

import { PolicySections, type PolicySection } from "@/components/shared/policy-sections";
import { APP_NAME } from "@/constants/config";
import { ROUTES } from "@/constants/routes";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `How ${APP_NAME} collects, uses, and protects your data.`,
};

const SECTIONS: PolicySection[] = [
  {
    title: "1. What we collect",
    body: [
      "Account details: when you sign in with Google, Google shares your name, email address, and profile picture with us. We also store the account type you choose and your phone number if you add one. We never see or store your Google password.",
      "Order activity: items ordered, delivery/pickup choice, and saved addresses, so we and the relevant seller can fulfill your order and you can track it.",
      "Location data you choose to provide: when you pick a location on the map (for a delivery address, or a store's location if you're a seller), those coordinates are stored to power distance-based search and delivery.",
    ],
  },
  {
    title: "2. How we use it",
    body: [
      "To create and secure your account, process orders, and show you relevant nearby stores and products.",
      "To let sellers see order details needed to fulfill an order (items, delivery address if applicable, contact info) — sellers don't see your payment details, since Cash on Delivery is handled directly at delivery/pickup.",
      "To send order-related notifications (status updates, confirmations).",
    ],
  },
  {
    title: "3. Third-party services",
    body: [
      "Map location search (picking an address or store location on the map) is powered by OpenStreetMap's Nominatim geocoding service. Search queries and coordinates you submit through the location picker are sent to that service to resolve an address — routed through our own backend rather than directly from your browser.",
      "Sign-in is handled by Google. When you use the Google button, Google processes that sign-in under its own privacy policy and tells us which Google account was used.",
      "Uploaded images (product photos, store logos/banners) are stored via our file storage provider.",
    ],
  },
  {
    title: "4. Cookies & browser storage",
    body: [
      <>
        {APP_NAME}{" "}
        doesn&apos;t use advertising or analytics cookies. It keeps a few small items in
        your browser&apos;s local storage (your sign-in session and display preferences) so the app
        works — see the{" "}
        <Link href={ROUTES.cookies} className="font-medium text-primary hover:underline">
          Cookie Policy
        </Link>{" "}
        for the full list.
      </>,
    ],
  },
  {
    title: "5. Data retention",
    body: [
      "Order history is retained to support returns, disputes, and your own order-tracking history. You can delete saved addresses at any time from your account; removing your account can be requested via support.",
    ],
  },
  {
    title: "6. Your choices",
    body: [
      "You can view and edit your profile, delivery addresses, and wishlist at any time from your account. You can also unlike a saved product/store to remove it from your wishlist.",
    ],
  },
  {
    title: "7. Contact",
    body: [
      <>
        Questions about this policy or your data can be sent through our{" "}
        <Link href={ROUTES.contact} className="font-medium text-primary hover:underline">
          Contact page
        </Link>
        .
      </>,
    ],
  },
];

export default function PrivacyPage() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-8 px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Privacy Policy</h1>
        <p className="text-sm text-muted-foreground">
          This describes what {APP_NAME}{" "}
          collects and how it&apos;s used.
        </p>
      </div>

      <PolicySections sections={SECTIONS} />
    </div>
  );
}
