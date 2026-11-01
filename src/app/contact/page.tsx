import type { Metadata } from "next";
import Link from "next/link";
import { AtSign, CircleHelp, Mail, PackageSearch, Phone, RotateCcw } from "lucide-react";

import {
  APP_NAME,
  INSTAGRAM_URL,
  SUPPORT_EMAIL,
  SUPPORT_EMAIL_ALT,
  SUPPORT_PHONE,
  SUPPORT_PHONE_LABEL,
} from "@/constants/config";
import { ROUTES } from "@/constants/routes";
import { ContactForm } from "@/features/contact/components/contact-form";

export const metadata: Metadata = {
  title: "Contact us",
  description: `Get help with an order, a return, or anything else on ${APP_NAME}.`,
};

const SHORTCUTS = [
  {
    icon: PackageSearch,
    title: "Track an order",
    body: "Live status for anything you've ordered, from placed to delivered or picked up.",
    href: ROUTES.orders,
  },
  {
    icon: RotateCcw,
    title: "Returns & refunds",
    body: "How cancellations, returns, and refunds work, and who to contact first.",
    href: ROUTES.returns,
  },
  {
    icon: CircleHelp,
    title: "Help center",
    body: "Answers on payments, delivery, your account, and selling.",
    href: ROUTES.help,
  },
];

export default function ContactPage() {
  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-10 px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex max-w-2xl flex-col gap-3">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Contact us</h1>
        <p className="text-muted-foreground">
          Questions about an order, a store, or your account? Send us a message, or check the
          quick answers first. Your question may already be covered.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
        {/* Wrapper keeps the card at its own height instead of stretching to the sidebar's. */}
        <div>
          <ContactForm />
        </div>

        <aside className="flex flex-col gap-4">
          <h2 className="text-sm font-semibold text-foreground">Quick answers</h2>
          {SHORTCUTS.map(({ icon: Icon, title, body, href }) => (
            <Link
              key={title}
              href={href}
              className="flex gap-3 rounded-xl border p-4 transition-colors hover:bg-muted/50"
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon className="size-4.5" />
              </span>
              <span className="flex flex-col gap-0.5">
                <span className="text-sm font-semibold text-foreground">{title}</span>
                <span className="text-xs text-muted-foreground">{body}</span>
              </span>
            </Link>
          ))}

          <div className="flex flex-col gap-2 rounded-xl border bg-muted/30 p-4">
            <h2 className="text-sm font-semibold text-foreground">Reach us directly</h2>
            <p className="text-xs text-muted-foreground">
              Email, call, or message us on Instagram. Include your order number if it&apos;s
              about a specific order.
            </p>
            {[SUPPORT_EMAIL, SUPPORT_EMAIL_ALT].map((email) => (
              <a
                key={email}
                href={`mailto:${email}`}
                className="flex items-center gap-1.5 text-sm font-medium break-all text-primary hover:underline"
              >
                <Mail className="size-4 shrink-0" />
                {email}
              </a>
            ))}
            <a
              href={`tel:${SUPPORT_PHONE}`}
              className="flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
            >
              <Phone className="size-4 shrink-0" />
              {SUPPORT_PHONE_LABEL}
            </a>
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noreferrer noopener"
              className="flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
            >
              <AtSign className="size-4 shrink-0" />
              @boda.insta on Instagram
            </a>
          </div>
        </aside>
      </div>
    </div>
  );
}
