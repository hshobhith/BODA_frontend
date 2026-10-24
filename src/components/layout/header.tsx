"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState, type FormEvent } from "react";
import {
  Heart,
  LayoutGrid,
  ListOrdered,
  LogOut,
  Menu,
  MapPin,
  MapPinned,
  Search,
  ShieldCheck,
  ShoppingCart,
  User as UserIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { BrandLogo } from "@/components/shared/brand-logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { ROUTES } from "@/constants/routes";
import { APP_NAME } from "@/constants/config";
import { useLogout } from "@/features/auth/hooks";
import { useCart, useCartCount } from "@/features/cart/hooks";
import { NotificationBell } from "@/features/notifications/components/notification-bell";
import { useStore } from "@/features/stores/hooks";
import { useStoreModeSlug } from "@/hooks/use-store-mode";
import { useAuthStore } from "@/store/auth-store";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: ROUTES.home, label: "Home" },
  { href: ROUTES.stores, label: "Stores" },
  { href: ROUTES.categories, label: "Categories" },
] as const;

// In store-only mode (a store's private link) the header is about that one
// store: the logo leads back to it, and search/location/marketplace nav are
// hidden. Server-rendered parts hide via the `store-mode:` CSS variant so
// they never flash; client-only parts read `useStoreModeSlug()`.

function Logo({ className }: { className?: string }) {
  const storeModeSlug = useStoreModeSlug();
  return (
    <Link
      href={storeModeSlug ? ROUTES.storeDetail(storeModeSlug) : ROUTES.home}
      className={cn("flex shrink-0 items-center", className)}
      aria-label={storeModeSlug ? "Back to the store" : `${APP_NAME} home`}
    >
      <BrandLogo height={32} priority />
    </Link>
  );
}

/** Store-only mode: the store's logo and name, linking back to it. */
function StoreModeIdentity() {
  const slug = useStoreModeSlug();
  const store = useStore(slug ?? "").data;
  if (!slug) return null;

  return (
    <Link
      href={ROUTES.storeDetail(slug)}
      className="flex min-w-0 items-center gap-2 sm:border-l sm:border-border sm:pl-3"
    >
      <span className="relative flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary text-sm font-semibold text-primary-foreground">
        {store?.logoUrl ? (
          <Image src={store.logoUrl} alt="" fill sizes="32px" className="object-cover" />
        ) : (
          (store?.name.trim().charAt(0).toUpperCase() ?? "")
        )}
      </span>
      {store ? (
        <span className="truncate text-sm font-semibold text-foreground sm:text-base">{store.name}</span>
      ) : (
        <Skeleton className="h-4 w-28" />
      )}
    </Link>
  );
}

function LocationIndicator({ className }: { className?: string }) {
  return (
    <button
      type="button"
      className={cn(
        "flex items-center gap-1.5 rounded-md px-2 py-1.5 text-left text-sm hover:bg-muted",
        className
      )}
    >
      <MapPin className="size-4 shrink-0 text-muted-foreground" />
      <span className="flex flex-col leading-tight">
        <span className="text-xs text-muted-foreground">Deliver to</span>
        <span className="max-w-40 truncate font-medium text-foreground">
          Select your location
        </span>
      </span>
    </button>
  );
}

function SearchBarFallback({ className }: { className?: string }) {
  return (
    <div className={cn("relative w-full", className)}>
      <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="search"
        placeholder="Search for stores, products, or categories"
        className="h-10 w-full rounded-full pl-9"
        aria-label="Search"
        disabled
      />
    </div>
  );
}

function SearchBarInner({ className }: { className?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = query.trim();
    router.push(trimmed ? `${ROUTES.search}?q=${encodeURIComponent(trimmed)}` : ROUTES.search);
  }

  return (
    <form onSubmit={handleSubmit} className={cn("relative w-full", className)} role="search">
      <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search for stores, products, or categories"
        className="h-10 w-full rounded-full pl-9"
        aria-label="Search"
      />
    </form>
  );
}

// `SearchBarInner` reads `?q=` via `useSearchParams`, which requires a
// Suspense boundary here (rather than relying on each page to provide one)
// since the Header — and therefore this component — is part of the shared
// root layout rendered on every route, including statically-generated ones.
function SearchBar({ className }: { className?: string }) {
  return (
    <Suspense fallback={<SearchBarFallback className={className} />}>
      <SearchBarInner className={className} />
    </Suspense>
  );
}

function DesktopNav() {
  return (
    <nav className="hidden items-center gap-1 md:flex store-mode:hidden!">
      {NAV_LINKS.map((link) => (
        <Button key={link.href} asChild variant="ghost" size="sm">
          <Link href={link.href}>{link.label}</Link>
        </Button>
      ))}
    </nav>
  );
}

function CartLink({ itemCount }: { itemCount: number }) {
  return (
    <Button asChild variant="ghost" size="icon" className="relative" aria-label="View cart">
      <Link href={ROUTES.cart}>
        <ShoppingCart className="size-5" />
        {itemCount > 0 && (
          <Badge
            variant="default"
            className="absolute -top-1 -right-1 size-4.5 justify-center rounded-full bg-destructive p-0 text-[10px] text-white dark:text-white"
          >
            {itemCount}
          </Badge>
        )}
      </Link>
    </Button>
  );
}

function MarketplaceCartButton() {
  const { data } = useCartCount();
  return <CartLink itemCount={data?.count ?? 0} />;
}

/** Store-only mode: counts just this store's items, matching the cart page. */
function StoreCartButton({ slug }: { slug: string }) {
  const storeId = useStore(slug).data?.id;
  const { data } = useCart();
  const itemCount = (data?.items ?? [])
    .filter((item) => item.product.storeId === storeId)
    .reduce((sum, item) => sum + item.quantity, 0);
  return <CartLink itemCount={itemCount} />;
}

function CartButton() {
  const storeModeSlug = useStoreModeSlug();
  return storeModeSlug ? <StoreCartButton slug={storeModeSlug} /> : <MarketplaceCartButton />;
}

function UserMenu() {
  const user = useAuthStore((state) => state.user);
  const storeModeSlug = useStoreModeSlug();
  const logout = useLogout();
  const initials =
    user?.fullName
      ?.split(" ")
      .map((part) => part[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() ?? "U";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="gap-2 px-1.5" aria-label="Account menu">
          <Avatar size="sm">
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col gap-0.5">
            <span className="truncate text-sm font-medium">{user?.fullName}</span>
            <span className="truncate text-xs text-muted-foreground">{user?.email}</span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href={ROUTES.account}>
            <UserIcon className="mr-1.5 size-4" />
            Account settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={ROUTES.orders}>
            <ListOrdered className="mr-1.5 size-4" />
            Orders
          </Link>
        </DropdownMenuItem>
        {!storeModeSlug && (
          <DropdownMenuItem asChild>
            <Link href={ROUTES.wishlist}>
              <Heart className="mr-1.5 size-4" />
              Wishlist
            </Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuItem asChild>
          <Link href={ROUTES.accountAddresses}>
            <MapPinned className="mr-1.5 size-4" />
            Addresses
          </Link>
        </DropdownMenuItem>
        {user?.role === "seller" && (
          <DropdownMenuItem asChild>
            <Link href={ROUTES.sellerDashboard}>
              <LayoutGrid className="mr-1.5 size-4" />
              Seller Dashboard
            </Link>
          </DropdownMenuItem>
        )}
        {user?.role === "admin" && (
          <DropdownMenuItem asChild>
            <Link href={ROUTES.adminDashboard}>
              <ShieldCheck className="mr-1.5 size-4" />
              Admin Dashboard
            </Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          disabled={logout.isPending}
          onClick={() => logout.mutate()}
        >
          <LogOut className="mr-1.5 size-4" />
          {logout.isPending ? "Logging out..." : "Log out"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function AuthActions() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (isAuthenticated) {
    return <UserMenu />;
  }

  return (
    <div className="hidden items-center gap-2 sm:flex">
      <Button asChild variant="ghost" size="sm">
        <Link href={ROUTES.login}>Log in</Link>
      </Button>
      <Button asChild size="sm">
        <Link href={ROUTES.register}>Sign up</Link>
      </Button>
    </div>
  );
}

function MobileNav() {
  const [open, setOpen] = useState(false);
  const storeModeSlug = useStoreModeSlug();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const role = useAuthStore((state) => state.user?.role);
  const dashboard =
    role === "admin"
      ? { href: ROUTES.adminDashboard, label: "Admin dashboard" }
      : role === "seller"
        ? { href: ROUTES.sellerDashboard, label: "Seller dashboard" }
        : null;
  const logout = useLogout();

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open menu">
          <Menu className="size-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72">
        <SheetHeader>
          <SheetTitle>
            <Logo />
          </SheetTitle>
        </SheetHeader>
        <div className="flex flex-col gap-1 px-4">
          {storeModeSlug ? (
            <SheetClose asChild>
              <Link
                href={ROUTES.storeDetail(storeModeSlug)}
                className="rounded-md px-2 py-2 text-sm font-medium hover:bg-muted"
              >
                Back to the store
              </Link>
            </SheetClose>
          ) : (
            <>
              <LocationIndicator className="mb-2" />
              <SearchBar className="mb-3" />
              {NAV_LINKS.map((link) => (
                <SheetClose asChild key={link.href}>
                  <Link
                    href={link.href}
                    className="rounded-md px-2 py-2 text-sm font-medium hover:bg-muted"
                  >
                    {link.label}
                  </Link>
                </SheetClose>
              ))}
            </>
          )}
          <div className="my-2 h-px bg-border" />
          {isAuthenticated ? (
            <>
              {dashboard && (
                <SheetClose asChild>
                  <Link
                    href={dashboard.href}
                    className="rounded-md px-2 py-2 text-sm font-medium hover:bg-muted"
                  >
                    {dashboard.label}
                  </Link>
                </SheetClose>
              )}
              <SheetClose asChild>
                <Link
                  href={ROUTES.account}
                  className="rounded-md px-2 py-2 text-sm font-medium hover:bg-muted"
                >
                  Account settings
                </Link>
              </SheetClose>
              <SheetClose asChild>
                <Link
                  href={ROUTES.orders}
                  className="rounded-md px-2 py-2 text-sm font-medium hover:bg-muted"
                >
                  Orders
                </Link>
              </SheetClose>
              {!storeModeSlug && (
                <SheetClose asChild>
                  <Link
                    href={ROUTES.wishlist}
                    className="rounded-md px-2 py-2 text-sm font-medium hover:bg-muted"
                  >
                    Wishlist
                  </Link>
                </SheetClose>
              )}
              <SheetClose asChild>
                <Link
                  href={ROUTES.accountAddresses}
                  className="rounded-md px-2 py-2 text-sm font-medium hover:bg-muted"
                >
                  Addresses
                </Link>
              </SheetClose>
              <SheetClose asChild>
                <button
                  onClick={() => logout.mutate()}
                  disabled={logout.isPending}
                  className="rounded-md px-2 py-2 text-left text-sm font-medium text-destructive hover:bg-destructive/10 disabled:opacity-50"
                >
                  {logout.isPending ? "Logging out..." : "Log out"}
                </button>
              </SheetClose>
            </>
          ) : (
            <div className="flex flex-col gap-2 pt-2">
              <SheetClose asChild>
                <Button asChild variant="outline">
                  <Link href={ROUTES.login}>Log in</Link>
                </Button>
              </SheetClose>
              <SheetClose asChild>
                <Button asChild>
                  <Link href={ROUTES.register}>Sign up</Link>
                </Button>
              </SheetClose>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

export function Header() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80">
      <div className="mx-auto flex max-w-7xl items-center gap-2 px-4 py-2.5 sm:gap-3 sm:px-6 lg:px-8">
        <MobileNav />
        {/* On phones the store's own name takes the logo's place in store-only mode. */}
        <Logo className="max-sm:store-mode:hidden!" />
        <StoreModeIdentity />
        <LocationIndicator className="hidden lg:flex store-mode:hidden!" />
        <SearchBar className="hidden max-w-xl flex-1 md:block store-mode:hidden!" />
        <div className="ml-auto flex items-center gap-1 sm:gap-2">
          <DesktopNav />
          <ThemeToggle />
          <NotificationBell />
          <CartButton />
          <AuthActions />
        </div>
      </div>
      <div className="border-t border-border px-4 py-2 md:hidden store-mode:hidden!">
        <SearchBar />
      </div>
    </header>
  );
}
