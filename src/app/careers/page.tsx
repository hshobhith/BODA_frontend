import type { Metadata } from "next";
import Link from "next/link";
import { Mail } from "lucide-react";

import { Button } from "@/components/ui/button";
import { APP_NAME, SUPPORT_EMAIL } from "@/constants/config";
import { ROUTES } from "@/constants/routes";

export const metadata: Metadata = {
  title: "Careers",
  description: `Work with the team building ${APP_NAME}, the marketplace for local stores.`,
};

const careersMailto = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(`Careers at ${APP_NAME}`)}`;

export default function CareersPage() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-10 px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-3">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Careers at {APP_NAME}</h1>
        <p className="text-muted-foreground">
          We&apos;re building the simplest way for neighborhood stores to sell online, and for
          people to shop from the businesses already around them. If that sounds like work
          you&apos;d enjoy, we&apos;d like to hear from you.
        </p>
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Open positions</h2>
        <div className="rounded-xl border border-dashed p-6 text-center">
          <p className="font-medium text-foreground">No open roles right now</p>
          <p className="mt-1 text-sm text-muted-foreground">
            New positions will be listed here when they open up.
          </p>
        </div>
      </section>

      <section className="flex flex-col items-start gap-3 rounded-xl border bg-muted/30 p-6">
        <h2 className="font-semibold text-foreground">Introduce yourself anyway</h2>
        <p className="text-sm text-muted-foreground">
          Engineering, design, seller partnerships, or customer support: if you think you could
          help, send us a short note about yourself and what you&apos;d like to work on. Include a
          link to your CV or portfolio.
        </p>
        <Button asChild variant="outline" className="gap-1.5">
          <a href={careersMailto}>
            <Mail className="size-4" />
            Email us
          </a>
        </Button>
      </section>

      <p className="text-sm text-muted-foreground">
        Run a local store? You don&apos;t need a job to work with us —{" "}
        <Link href={ROUTES.sell} className="font-medium text-primary hover:underline">
          sell on {APP_NAME}
        </Link>
        .
      </p>
    </div>
  );
}
