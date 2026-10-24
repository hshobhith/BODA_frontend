import Link from "next/link";
import type { ReactNode } from "react";
import { Store } from "lucide-react";

import { Card } from "@/components/ui/card";
import { APP_NAME } from "@/constants/config";
import { ROUTES } from "@/constants/routes";

/**
 * Shared chrome for every /auth/* page (login, register, forgot/reset
 * password, verify email). The root layout still renders the global
 * Header/Footer around this — this layout only owns the centered "branding +
 * card" section in between, so it applies uniformly across the whole /auth
 * segment without needing a Next.js route group.
 *
 * Mobile: the card runs full-bleed (no border/radius/shadow) so it reads as
 * part of the page. Desktop: it becomes a real card with breathing room.
 */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] w-full items-center justify-center bg-muted/30 px-0 py-0 sm:px-4 sm:py-16">
      <div className="w-full max-w-md">
        <Link
          href={ROUTES.home}
          className="mb-6 hidden items-center justify-center gap-1.5 text-lg font-bold tracking-tight text-foreground sm:flex"
          aria-label={`${APP_NAME} home`}
        >
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Store className="size-4.5" />
          </span>
          <span>{APP_NAME}</span>
        </Link>
        <Card className="w-full gap-6 rounded-none border-0 py-8 shadow-none ring-0 sm:rounded-2xl sm:border sm:px-2 sm:py-8 sm:shadow-sm sm:ring-1 sm:ring-foreground/10">
          {children}
        </Card>
      </div>
    </div>
  );
}
