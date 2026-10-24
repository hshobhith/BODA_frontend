"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ClipboardList, LayoutDashboard, MessageSquareText, Menu, Package, Store as StoreIcon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { ROUTES } from "@/constants/routes";
import { StoreSwitcher } from "@/features/seller/components/store-switcher";
import { useMyStore } from "@/features/seller/hooks";
import { useHasMounted } from "@/hooks/use-has-mounted";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth-store";
import type { ApiError } from "@/types/api";

const NAV_ITEMS = [
  { href: ROUTES.sellerDashboard, label: "Dashboard", icon: LayoutDashboard },
  { href: ROUTES.sellerStore, label: "Store settings", icon: StoreIcon },
  { href: ROUTES.sellerProducts, label: "Products", icon: Package },
  { href: ROUTES.sellerOrders, label: "Orders", icon: ClipboardList },
  { href: ROUTES.sellerReviews, label: "Reviews", icon: MessageSquareText },
] as const;

function SellerNavLinks({ pathname }: { pathname: string }) {
  return (
    <nav className="flex flex-col gap-1">
      {NAV_ITEMS.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-muted",
              isActive ? "bg-accent text-accent-foreground" : "text-muted-foreground"
            )}
          >
            <item.icon className="size-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

function SellerMobileNavLinks({ pathname }: { pathname: string }) {
  return (
    <nav className="flex flex-col gap-1 px-4">
      {NAV_ITEMS.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <SheetClose asChild key={item.href}>
            <Link
              href={item.href}
              className={cn(
                "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-muted",
                isActive ? "bg-accent text-accent-foreground" : "text-muted-foreground"
              )}
            >
              <item.icon className="size-4" />
              {item.label}
            </Link>
          </SheetClose>
        );
      })}
    </nav>
  );
}

function SellerLayoutSkeleton() {
  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-40 w-full" />
      <Skeleton className="h-64 w-full" />
    </div>
  );
}

/**
 * Shared seller shell: applies the seller-only route guard once so child
 * pages under `/seller/*` can assume access is already gated. Also redirects
 * a seller with no store yet to `/seller/onboarding` (except while already
 * on that page), and bounces a seller who already has a store away from
 * onboarding toward the dashboard.
 */
export default function SellerLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const hasMounted = useHasMounted();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const isSeller = user?.role === "seller";
  const isOnboardingPage = pathname === ROUTES.sellerOnboarding;

  const storeQuery = useMyStore(hasMounted && isAuthenticated && isSeller);
  const storeError = storeQuery.error as unknown as ApiError | undefined;
  const storeNotFound = storeQuery.isError && storeError?.statusCode === 404;

  useEffect(() => {
    if (!hasMounted) return;

    if (!isAuthenticated) {
      router.replace(`${ROUTES.login}?redirect=${encodeURIComponent(pathname)}`);
      return;
    }

    if (!isSeller) {
      toast.error("This area is for sellers only.");
      router.replace(ROUTES.home);
      return;
    }

    if (storeQuery.isSuccess && isOnboardingPage) {
      router.replace(ROUTES.sellerDashboard);
      return;
    }

    if (storeNotFound && !isOnboardingPage) {
      toast.info("Finish setting up your store to continue.");
      router.replace(ROUTES.sellerOnboarding);
    }
  }, [
    hasMounted,
    isAuthenticated,
    isSeller,
    storeQuery.isSuccess,
    storeNotFound,
    isOnboardingPage,
    pathname,
    router,
  ]);

  const guardResolved =
    hasMounted && isAuthenticated && isSeller && (isOnboardingPage || storeQuery.isSuccess);

  if (!guardResolved) {
    return <SellerLayoutSkeleton />;
  }

  // The onboarding page renders full-bleed, without the dashboard chrome.
  if (isOnboardingPage) {
    return <>{children}</>;
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:flex-row lg:px-8">
      <aside className="hidden shrink-0 lg:block lg:w-56">
        <div className="sticky top-20 flex flex-col gap-4">
          <StoreSwitcher />
          <p className="px-3 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            Seller tools
          </p>
          <SellerNavLinks pathname={pathname} />
        </div>
      </aside>

      <div className="flex items-center justify-between lg:hidden">
        <h1 className="text-lg font-semibold text-foreground">Seller dashboard</h1>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" aria-label="Open seller navigation">
              <Menu className="size-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64">
            <SheetHeader>
              <SheetTitle>Seller tools</SheetTitle>
            </SheetHeader>
            <div className="px-4 pb-2">
              <StoreSwitcher />
            </div>
            <SellerMobileNavLinks pathname={pathname} />
          </SheetContent>
        </Sheet>
      </div>

      <main className="min-w-0 flex-1">{children}</main>
    </div>
  );
}
