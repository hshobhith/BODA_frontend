"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ClipboardList,
  Home,
  LayoutDashboard,
  LayoutGrid,
  ListOrdered,
  MessageSquareText,
  Package,
  ShoppingCart,
  Store as StoreIcon,
  User as UserIcon,
  type LucideIcon,
} from "lucide-react";

import { ROUTES } from "@/constants/routes";
import { useCart, useCartCount } from "@/features/cart/hooks";
import { useStore } from "@/features/stores/hooks";
import { useHasMounted } from "@/hooks/use-has-mounted";
import { useStoreModeSlug } from "@/hooks/use-store-mode";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth-store";

interface Tab {
  href: string;
  label: string;
  icon: LucideIcon;
  isActive: (pathname: string) => boolean;
  badge?: number;
}

const under = (pathname: string, prefix: string) =>
  pathname === prefix || pathname.startsWith(`${prefix}/`);

/** Focused flows where a tab bar would only distract (or cover a submit button). */
const HIDDEN_PREFIXES = [
  "/auth",
  ROUTES.checkout,
  ROUTES.adminRoot,
  ROUTES.sellerOnboarding,
  ROUTES.sellerStoresNew,
];

const SELLER_TABS: Tab[] = [
  {
    href: ROUTES.sellerDashboard,
    label: "Dashboard",
    icon: LayoutDashboard,
    isActive: (p) => under(p, ROUTES.sellerDashboard),
  },
  {
    href: ROUTES.sellerOrders,
    label: "Orders",
    icon: ClipboardList,
    isActive: (p) => under(p, ROUTES.sellerOrders),
  },
  {
    href: ROUTES.sellerProducts,
    label: "Products",
    icon: Package,
    isActive: (p) => under(p, ROUTES.sellerProducts),
  },
  {
    href: ROUTES.sellerReviews,
    label: "Reviews",
    icon: MessageSquareText,
    isActive: (p) => under(p, ROUTES.sellerReviews),
  },
  {
    href: ROUTES.sellerStore,
    label: "My store",
    icon: StoreIcon,
    isActive: (p) => under(p, ROUTES.sellerStore),
  },
];

function shopperTabs({
  storeModeSlug,
  cartCount,
  signedIn,
}: {
  storeModeSlug: string | null;
  cartCount: number;
  signedIn: boolean;
}): Tab[] {
  const cart: Tab = {
    href: ROUTES.cart,
    label: "Cart",
    icon: ShoppingCart,
    isActive: (p) => under(p, ROUTES.cart),
    badge: cartCount,
  };
  const orders: Tab = {
    href: ROUTES.orders,
    label: "Orders",
    icon: ListOrdered,
    isActive: (p) => under(p, ROUTES.orders),
  };
  const account: Tab = signedIn
    ? {
        href: ROUTES.account,
        label: "Account",
        icon: UserIcon,
        isActive: (p) => under(p, ROUTES.account) && !under(p, ROUTES.orders),
      }
    : {
        href: ROUTES.login,
        label: "Log in",
        icon: UserIcon,
        isActive: (p) => under(p, ROUTES.account),
      };

  if (storeModeSlug) {
    const storeHref = ROUTES.storeDetail(storeModeSlug);
    return [
      { href: storeHref, label: "Store", icon: StoreIcon, isActive: (p) => under(p, storeHref) },
      cart,
      orders,
      account,
    ];
  }

  return [
    { href: ROUTES.home, label: "Home", icon: Home, isActive: (p) => p === ROUTES.home },
    {
      href: ROUTES.categories,
      label: "Categories",
      icon: LayoutGrid,
      isActive: (p) => under(p, ROUTES.categories) || under(p, ROUTES.products),
    },
    cart,
    orders,
    account,
  ];
}

function TabBar({
  tabs,
  pathname,
  hideFrom = "md:hidden",
}: {
  tabs: Tab[];
  pathname: string;
  /** Breakpoint where the page's own navigation takes over. */
  hideFrom?: "md:hidden" | "lg:hidden";
}) {
  return (
    <>
      {/* Keeps the end of every page (footer included) clear of the fixed bar. */}
      <div aria-hidden className={cn("h-[calc(4rem+env(safe-area-inset-bottom))]", hideFrom)} />
      <nav
        aria-label="Main"
        className={cn(
          "fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_16px_rgba(0,0,0,0.04)] backdrop-blur supports-backdrop-filter:bg-background/85",
          hideFrom
        )}
      >
        <ul className="mx-auto flex h-16 max-w-lg items-stretch">
          {tabs.map(({ href, label, icon: Icon, isActive, badge }) => {
            const active = isActive(pathname);
            return (
              <li key={label} className="flex-1">
                <Link
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex h-full flex-col items-center justify-center gap-1 text-[11px] font-medium transition-colors active:scale-95",
                    active ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  <span
                    className={cn(
                      "relative flex h-7 w-12 items-center justify-center rounded-full transition-colors",
                      active && "bg-primary/10"
                    )}
                  >
                    <Icon className="size-5" strokeWidth={active ? 2.4 : 2} />
                    {!!badge && badge > 0 && (
                      <span className="absolute -top-1 right-1 flex min-w-4.5 items-center justify-center rounded-full bg-destructive px-1 text-[10px] leading-4.5 font-semibold text-white">
                        {badge > 99 ? "99+" : badge}
                      </span>
                    )}
                  </span>
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}

function useSignedIn() {
  const hasMounted = useHasMounted();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return hasMounted && isAuthenticated;
}

function MarketplaceTabBar({ pathname }: { pathname: string }) {
  const signedIn = useSignedIn();
  const cartCount = useCartCount().data?.count ?? 0;
  return (
    <TabBar tabs={shopperTabs({ storeModeSlug: null, cartCount, signedIn })} pathname={pathname} />
  );
}

/** Store-only mode counts just this store's items, matching the header and cart page. */
function StoreModeTabBar({ slug, pathname }: { slug: string; pathname: string }) {
  const signedIn = useSignedIn();
  const storeId = useStore(slug).data?.id;
  const { data } = useCart();
  const cartCount = (data?.items ?? [])
    .filter((item) => item.product.storeId === storeId)
    .reduce((sum, item) => sum + item.quantity, 0);
  return (
    <TabBar tabs={shopperTabs({ storeModeSlug: slug, cartCount, signedIn })} pathname={pathname} />
  );
}

function ShopperTabBar({ pathname }: { pathname: string }) {
  const storeModeSlug = useStoreModeSlug();
  return storeModeSlug ? (
    <StoreModeTabBar slug={storeModeSlug} pathname={pathname} />
  ) : (
    <MarketplaceTabBar pathname={pathname} />
  );
}

/**
 * App-style bottom navigation for phones (hidden from `md` up, where the
 * header carries the same links). Sellers get their dashboard sections inside
 * `/seller/*`; everyone else gets the shopping tabs.
 */
export function MobileTabBar() {
  const pathname = usePathname();

  if (HIDDEN_PREFIXES.some((prefix) => under(pathname, prefix))) {
    return null;
  }
  if (under(pathname, ROUTES.sellerRoot)) {
    // The seller sidebar only appears from `lg`, so keep the tabs until then.
    return <TabBar tabs={SELLER_TABS} pathname={pathname} hideFrom="lg:hidden" />;
  }
  return <ShopperTabBar pathname={pathname} />;
}
