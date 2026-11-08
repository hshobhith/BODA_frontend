"use client";

import Link from "next/link";
import {
  ChevronRight,
  Heart,
  LayoutGrid,
  ListOrdered,
  LogOut,
  MapPinned,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";

import { ROUTES } from "@/constants/routes";
import { useStoreModeSlug } from "@/hooks/use-store-mode";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth-store";
import { useLogout } from "../hooks";

function MenuRow({ href, label, icon: Icon }: { href: string; label: string; icon: LucideIcon }) {
  return (
    <li>
      <Link
        href={href}
        className="flex items-center gap-3 px-4 py-3.5 text-sm font-medium text-foreground transition-colors active:bg-muted"
      >
        <Icon className="size-5 text-muted-foreground" />
        <span className="flex-1">{label}</span>
        <ChevronRight className="size-4 text-muted-foreground" />
      </Link>
    </li>
  );
}

/**
 * App-style menu at the top of the account page on phones — the bottom tab
 * bar's Account tab lands here, so this replaces the header's account
 * dropdown (hidden on small screens). Desktop keeps using that dropdown.
 */
export function AccountMenuList({ className }: { className?: string }) {
  const role = useAuthStore((state) => state.user?.role);
  const storeModeSlug = useStoreModeSlug();
  const logout = useLogout();

  return (
    <nav aria-label="Account" className={cn("md:hidden", className)}>
      <ul className="divide-y overflow-hidden rounded-xl border bg-card">
        {role === "seller" && (
          <MenuRow href={ROUTES.sellerDashboard} label="Seller dashboard" icon={LayoutGrid} />
        )}
        {role === "admin" && (
          <MenuRow href={ROUTES.adminDashboard} label="Admin dashboard" icon={ShieldCheck} />
        )}
        <MenuRow href={ROUTES.orders} label="My orders" icon={ListOrdered} />
        {!storeModeSlug && <MenuRow href={ROUTES.wishlist} label="Wishlist" icon={Heart} />}
        <MenuRow href={ROUTES.accountAddresses} label="Saved addresses" icon={MapPinned} />
        <li>
          <button
            type="button"
            onClick={() => logout.mutate()}
            disabled={logout.isPending}
            className="flex w-full items-center gap-3 px-4 py-3.5 text-left text-sm font-medium text-destructive transition-colors active:bg-destructive/10 disabled:opacity-50"
          >
            <LogOut className="size-5" />
            {logout.isPending ? "Logging out…" : "Log out"}
          </button>
        </li>
      </ul>
    </nav>
  );
}
