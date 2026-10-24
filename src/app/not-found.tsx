import type { Metadata } from "next";
import Link from "next/link";
import { MapPinOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";

export const metadata: Metadata = {
  title: "Page not found",
};

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center gap-5 px-4 py-24 text-center">
      <span className="flex size-14 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <MapPinOff className="size-7" />
      </span>
      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium text-primary">404</p>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Page not found</h1>
        <p className="text-muted-foreground">
          We couldn&apos;t find that page. It may have moved, or the link might be mistyped.
        </p>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button asChild>
          <Link href={ROUTES.home}>Back to home</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href={ROUTES.stores}>Browse stores</Link>
        </Button>
      </div>
      <p className="text-sm text-muted-foreground">
        Looking for something specific? Try the{" "}
        <Link href={ROUTES.help} className="font-medium text-primary hover:underline">
          Help center
        </Link>
        .
      </p>
    </div>
  );
}
