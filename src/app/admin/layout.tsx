"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ClipboardList,
  LayoutDashboard,
  ListTree,
  Menu,
  ShoppingBag,
  Store,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { ROUTES } from "@/constants/routes";
import { useHasMounted } from "@/hooks/use-has-mounted";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth-store";

const NAV_ITEMS = [
  { href: ROUTES.adminDashboard, label: "Dashboard", icon: LayoutDashboard },
  { href: ROUTES.adminUsers, label: "Users", icon: Users },
  { href: ROUTES.adminStores, label: "Stores", icon: Store },
  { href: ROUTES.adminOrders, label: "Orders", icon: ShoppingBag },
  { href: ROUTES.adminCategories, label: "Categories", icon: ListTree },
  { href: ROUTES.adminAuditLogs, label: "Audit log", icon: ClipboardList },
];

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav className="flex flex-col gap-1">
      {NAV_ITEMS.map((item) => {
        const active = pathname?.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
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

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const hasMounted = useHasMounted();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const role = useAuthStore((state) => state.user?.role);

  useEffect(() => {
    if (!hasMounted) return;
    if (!isAuthenticated) {
      router.replace(`${ROUTES.login}?redirect=${encodeURIComponent(ROUTES.adminDashboard)}`);
      return;
    }
    if (role !== "admin") {
      toast.error("You don't have access to the admin console.");
      router.replace(ROUTES.home);
    }
  }, [hasMounted, isAuthenticated, role, router]);

  if (!hasMounted || !isAuthenticated || role !== "admin") {
    return (
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-10">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-6xl gap-8 px-4 py-8 sm:px-6 lg:px-8">
      <aside className="hidden w-56 shrink-0 md:block">
        <NavLinks />
      </aside>
      <div className="flex-1">
        <div className="mb-4 flex items-center justify-between md:hidden">
          <h2 className="text-lg font-semibold text-foreground">Admin</h2>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" aria-label="Open admin menu">
                <Menu className="size-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-4">
              <NavLinks />
            </SheetContent>
          </Sheet>
        </div>
        {children}
      </div>
    </div>
  );
}
