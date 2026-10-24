import type { Metadata } from "next";
import Link from "next/link";

import { PolicySections, type PolicySection } from "@/components/shared/policy-sections";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { APP_NAME, AUTH_STORAGE_KEY } from "@/constants/config";
import { ROUTES } from "@/constants/routes";

export const metadata: Metadata = {
  title: "Cookie Policy",
  description: `What ${APP_NAME} stores in your browser, and why.`,
};

// Keep in sync with what the app actually persists: the Zustand `persist`
// stores (store/auth-store.ts, store/active-store-store.ts) and next-themes'
// default storage key. The app sets no cookies of its own.
const STORED_ITEMS = [
  {
    key: AUTH_STORAGE_KEY,
    purpose:
      "Keeps you signed in: your access and refresh tokens plus basic profile details (name, email, role). Cleared when you log out.",
    who: "Everyone who signs in",
  },
  {
    key: "boda-active-store",
    purpose: "Remembers which of your stores is selected in the seller dashboard.",
    who: "Sellers only",
  },
  {
    key: "theme",
    purpose: "Remembers whether you picked light mode, dark mode, or your system setting.",
    who: "Everyone",
  },
];

const SECTIONS: PolicySection[] = [
  {
    title: "Location",
    body: [
      "If you allow it, your browser shares your current location so the homepage can show stores near you. Those coordinates are sent with the search request and aren't saved to your account. You can say no and browse all stores instead.",
    ],
  },
  {
    title: "Third-party requests",
    body: [
      "When a map is shown (for example, when you pick a delivery address or a store location), map tiles are loaded directly from OpenStreetMap's tile servers, which receive your IP address and standard browser request details under their own policies. Address search on the map is routed through our own server rather than sent from your browser.",
      "The sign-in button on the log-in and sign-up pages is loaded from Google (accounts.google.com). Google may set or read its own cookies there to sign you in, under Google's privacy policy. These are Google's cookies, not ours.",
    ],
  },
  {
    title: "Managing what's stored",
    body: [
      "Logging out clears your sign-in session. You can also remove everything at any time by clearing this site's data in your browser settings. You'll be signed out and your preferences will reset.",
    ],
  },
  {
    title: "Changes & questions",
    body: [
      <>
        If {APP_NAME} ever adds cookies or analytics, this page will be updated first. For
        questions, see our{" "}
        <Link href={ROUTES.privacy} className="font-medium text-primary hover:underline">
          Privacy Policy
        </Link>{" "}
        or{" "}
        <Link href={ROUTES.contact} className="font-medium text-primary hover:underline">
          contact us
        </Link>
        .
      </>,
    ],
  },
];

export default function CookiePolicyPage() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-8 px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Cookie Policy</h1>
        <p className="text-sm text-muted-foreground">
          The short version: {APP_NAME}{" "}
          sets no cookies of its own and uses no advertising or analytics trackers. It keeps a few small items in your browser&apos;s local storage so
          the app works.
        </p>
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="font-semibold text-foreground">What we store in your browser</h2>
        <div className="rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>What it&apos;s for</TableHead>
                <TableHead className="hidden sm:table-cell">Applies to</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {STORED_ITEMS.map((item) => (
                <TableRow key={item.key}>
                  <TableCell className="align-top font-mono text-xs">{item.key}</TableCell>
                  <TableCell className="text-sm whitespace-normal text-muted-foreground">
                    {item.purpose}
                  </TableCell>
                  <TableCell className="hidden align-top text-sm text-muted-foreground sm:table-cell">
                    {item.who}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <p className="text-sm text-muted-foreground">
          None of these are used for tracking or shared with third parties.
        </p>
      </section>

      <PolicySections sections={SECTIONS} />
    </div>
  );
}
