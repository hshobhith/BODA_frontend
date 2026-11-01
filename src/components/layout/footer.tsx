import Link from "next/link";
import { Mail, Phone } from "lucide-react";
import type { SVGProps } from "react";

import { BrandLogo } from "@/components/shared/brand-logo";
import {
  APP_NAME,
  INSTAGRAM_URL,
  SUPPORT_EMAIL,
  SUPPORT_EMAIL_ALT,
  SUPPORT_PHONE,
  SUPPORT_PHONE_LABEL,
} from "@/constants/config";
import { ROUTES } from "@/constants/routes";

interface FooterColumn {
  title: string;
  links: { label: string; href: string }[];
}

const FOOTER_COLUMNS: FooterColumn[] = [
  {
    title: "About",
    links: [
      { label: "About BODA", href: ROUTES.about },
      { label: "How it works", href: ROUTES.howItWorks },
      { label: "Careers", href: ROUTES.careers },
      { label: "Contact us", href: ROUTES.contact },
    ],
  },
  {
    title: "Customers",
    links: [
      { label: "Browse stores", href: ROUTES.stores },
      { label: "Track an order", href: ROUTES.orders },
      { label: "Returns & refunds", href: ROUTES.returns },
      { label: "Help center", href: ROUTES.help },
    ],
  },
  {
    title: "Sellers",
    links: [
      { label: "Sell on BODA", href: ROUTES.sell },
      { label: "Seller dashboard", href: ROUTES.sellerDashboard },
      { label: "Seller guide", href: ROUTES.sellerGuide },
      { label: "Fees & pricing", href: `${ROUTES.sell}#fees` },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Terms of service", href: ROUTES.terms },
      { label: "Privacy policy", href: ROUTES.privacy },
      { label: "Cookie policy", href: ROUTES.cookies },
    ],
  },
];

// lucide-react has no brand icons, so Instagram's glyph is drawn here in
// lucide's style (24px grid, 2px stroke) to sit alongside the others.
function InstagramIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

const SOCIAL_LINKS = [
  { label: "BODA on Instagram", href: INSTAGRAM_URL, icon: InstagramIcon, external: true },
  { label: `Email ${SUPPORT_EMAIL}`, href: `mailto:${SUPPORT_EMAIL}`, icon: Mail, external: false },
  { label: `Call ${SUPPORT_PHONE_LABEL}`, href: `tel:${SUPPORT_PHONE}`, icon: Phone, external: false },
];

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-muted/30">
      {/* Store-only mode (a store's private link): no marketplace links, just the essentials. */}
      <div className="mx-auto hidden max-w-7xl flex-col items-center justify-between gap-3 px-4 py-6 text-sm text-muted-foreground sm:flex-row sm:px-6 lg:px-8 store-mode:flex">
        <p className="flex items-center gap-2">
          Powered by <BrandLogo height={18} />
        </p>
        <div className="flex items-center gap-4">
          <Link href={ROUTES.terms} className="transition-colors hover:text-foreground">
            Terms
          </Link>
          <Link href={ROUTES.privacy} className="transition-colors hover:text-foreground">
            Privacy
          </Link>
          <span>&copy; {year} {APP_NAME}</span>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 store-mode:hidden!">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-5">
          <div className="col-span-2 flex flex-col gap-3 sm:col-span-3 lg:col-span-1">
            <Link href={ROUTES.home} className="flex w-fit items-center" aria-label={`${APP_NAME} home`}>
              <BrandLogo height={30} />
            </Link>
            <p className="max-w-xs text-sm text-muted-foreground">
              Your local marketplace — discover nearby stores and get everyday
              essentials delivered fast.
            </p>
            <div className="mt-1 flex items-center gap-3">
              {SOCIAL_LINKS.map(({ label, href, icon: Icon, external }) => (
                <a
                  key={label}
                  href={href}
                  {...(external && { target: "_blank", rel: "noreferrer noopener" })}
                  aria-label={label}
                  title={label}
                  className="flex size-8 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                >
                  <Icon className="size-4" />
                </a>
              ))}
            </div>
            <ul className="flex flex-col gap-1 text-sm text-muted-foreground">
              {[SUPPORT_EMAIL, SUPPORT_EMAIL_ALT].map((email) => (
                <li key={email}>
                  <a href={`mailto:${email}`} className="break-all transition-colors hover:text-foreground">
                    {email}
                  </a>
                </li>
              ))}
              <li>
                <a href={`tel:${SUPPORT_PHONE}`} className="transition-colors hover:text-foreground">
                  {SUPPORT_PHONE_LABEL}
                </a>
              </li>
            </ul>
          </div>

          {FOOTER_COLUMNS.map((column) => (
            <div key={column.title} className="flex flex-col gap-3">
              <h3 className="text-sm font-semibold text-foreground">{column.title}</h3>
              <ul className="flex flex-col gap-2">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-border pt-6 text-sm text-muted-foreground sm:flex-row">
          <p>
            &copy; {year} {APP_NAME}. All rights reserved.
          </p>
          <p>Made for local commerce, everywhere.</p>
        </div>
      </div>
    </footer>
  );
}
