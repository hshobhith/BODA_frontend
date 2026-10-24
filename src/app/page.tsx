"use client";

import Link from "next/link";
import { MapPin, RefreshCw, ShieldCheck, Sparkles, Truck } from "lucide-react";

import { ProductCardSkeleton } from "@/components/shared/product-card-skeleton";
import { StoreCardSkeleton } from "@/components/shared/store-card-skeleton";
import { Button } from "@/components/ui/button";
import { CategoryNav } from "@/features/categories/components/category-nav";
import { useCategoryTree } from "@/features/categories/hooks";
import { ProductCard } from "@/features/products/components/product-card";
import { useNearbyProducts } from "@/features/products/hooks";
import { NoStoresNearby } from "@/features/stores/components/no-stores-nearby";
import { StoreCard } from "@/features/stores/components/store-card";
import { useNearbyStores } from "@/features/stores/hooks";
import { useGeolocation } from "@/hooks/use-geolocation";
import { ROUTES } from "@/constants/routes";
import { APP_NAME } from "@/constants/config";

const VALUE_PROPS = [
  {
    icon: MapPin,
    title: "Hyperlocal discovery",
    description: "Find trusted stores and sellers right around your neighborhood.",
  },
  {
    icon: Truck,
    title: "Fast, reliable delivery",
    description: "Get everyday essentials delivered on your schedule.",
  },
  {
    icon: ShieldCheck,
    title: "Secure checkout",
    description: "Shop confidently with buyer protection on every order.",
  },
  {
    icon: Sparkles,
    title: "Curated for you",
    description: "Personalized picks from the sellers you'll love.",
  },
];

function SectionHeading({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: { label: string; href: string };
}) {
  return (
    <div className="mb-6 flex items-end justify-between gap-4">
      <div>
        <h2 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
          {title}
        </h2>
        {description && (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {action && (
        <Button asChild variant="ghost" size="sm" className="shrink-0">
          <Link href={action.href}>{action.label}</Link>
        </Button>
      )}
    </div>
  );
}

const NEARBY_RADIUS_KM = 15;
const NEARBY_LIMIT = 8;
const TRENDING_LIMIT = 10;

type Geolocation = ReturnType<typeof useGeolocation>;

function NearbyStoresSection({ geolocation }: { geolocation: Geolocation }) {
  const nearby = useNearbyStores(
    { lat: geolocation.lat ?? 0, lng: geolocation.lng ?? 0, radiusKm: NEARBY_RADIUS_KM, limit: NEARBY_LIMIT },
    { enabled: geolocation.status === "success" }
  );

  // Waiting on the browser's permission prompt / first geolocation attempt.
  if (geolocation.status === "idle" || geolocation.status === "loading") {
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: NEARBY_LIMIT }).map((_, i) => (
          <StoreCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  // Location denied/unavailable: don't crash or silently fall back to a
  // possibly-wrong default location — ask, and let the user browse anyway.
  if (geolocation.status === "error" || geolocation.status === "unsupported") {
    return (
      <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-border bg-muted/40 py-10 text-center">
        <MapPin className="size-6 text-muted-foreground" />
        <p className="max-w-sm text-sm text-muted-foreground">
          Enable location access to see stores delivering near you.
        </p>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={geolocation.request} className="gap-1.5">
            <RefreshCw className="size-3.5" />
            Enable location
          </Button>
          <Button asChild size="sm">
            <Link href={ROUTES.stores}>Browse all stores</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (nearby.isLoading) {
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: NEARBY_LIMIT }).map((_, i) => (
          <StoreCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (nearby.isError || !nearby.data) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-border py-10 text-center">
        <p className="text-sm text-muted-foreground">
          Couldn&apos;t load stores near you. Try browsing all stores instead.
        </p>
        <Button asChild size="sm" variant="outline">
          <Link href={ROUTES.stores}>Browse all stores</Link>
        </Button>
      </div>
    );
  }

  if (nearby.data.data.length === 0) {
    return <NoStoresNearby />;
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {nearby.data.data.map((store) => (
        <StoreCard key={store.id} store={store} />
      ))}
    </div>
  );
}

function TrendingProductsSection({ geolocation }: { geolocation: Geolocation }) {
  // No dedicated "trending" endpoint exists yet — using the newest-first
  // product listing as an MVP stand-in until the backend exposes one. Same
  // radius as the nearby stores above, so it never shows a store's products
  // where the store itself isn't listed.
  const products = useNearbyProducts(
    { sortBy: "newest", limit: TRENDING_LIMIT },
    geolocation,
    NEARBY_RADIUS_KM
  );

  if (products.isPending) {
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {Array.from({ length: TRENDING_LIMIT }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (products.isError || !products.data || products.data.data.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-border py-10 text-center">
        <p className="text-sm text-muted-foreground">
          {geolocation.status === "success"
            ? "No products from stores near you yet."
            : "No products to show yet."}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
      {products.data.data.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

function CategoriesSection() {
  const { data: categories, isLoading } = useCategoryTree();

  if (isLoading) {
    return (
      <div className="flex gap-3 overflow-x-auto pb-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-24 w-20 shrink-0 animate-pulse rounded-xl bg-muted" />
        ))}
      </div>
    );
  }

  if (!categories || categories.length === 0) {
    return null;
  }

  return <CategoryNav categories={categories} />;
}

export default function Home() {
  const geolocation = useGeolocation();

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border bg-gradient-to-b from-accent/60 to-background">
        <div className="mx-auto flex max-w-7xl flex-col items-start gap-6 px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-muted-foreground">
            <Sparkles className="size-3.5 text-primary" />
            Now live in your city
          </span>
          <h1 className="max-w-2xl text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Everything local, delivered to your door.
          </h1>
          <p className="max-w-xl text-base text-muted-foreground sm:text-lg">
            {APP_NAME} connects you with nearby stores and trusted sellers —
            groceries, essentials, and everything in between, just a few taps
            away.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href={ROUTES.stores}>Browse stores</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href={ROUTES.sell}>Become a seller</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Value props */}
      <section className="border-b border-border">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 py-10 sm:px-6 lg:grid-cols-4 lg:px-8">
          {VALUE_PROPS.map(({ icon: Icon, title, description }) => (
            <div key={title} className="flex flex-col gap-2">
              <span className="flex size-10 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                <Icon className="size-5" />
              </span>
              <h3 className="text-sm font-semibold text-foreground">{title}</h3>
              <p className="text-sm text-muted-foreground">{description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <SectionHeading title="Shop by category" />
        <CategoriesSection />
      </section>

      {/* Nearby stores */}
      <section className="mx-auto w-full max-w-7xl border-t border-border px-4 py-12 sm:px-6 lg:px-8">
        <SectionHeading
          title="Nearby Stores"
          description="Popular stores currently delivering in your area."
          action={{ label: "View all", href: ROUTES.stores }}
        />
        <NearbyStoresSection geolocation={geolocation} />
      </section>

      {/* Trending products */}
      <section className="mx-auto w-full max-w-7xl border-t border-border px-4 py-12 pb-16 sm:px-6 lg:px-8">
        <SectionHeading
          title="Trending Products"
          description={
            geolocation.status === "success"
              ? "Freshly listed picks from stores near you."
              : "Freshly listed picks across all stores."
          }
          action={{ label: "View all", href: ROUTES.products }}
        />
        <TrendingProductsSection geolocation={geolocation} />
      </section>
    </div>
  );
}
