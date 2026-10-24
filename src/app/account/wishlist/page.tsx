"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { HeartOff } from "lucide-react";

import { PaginationControls } from "@/components/shared/pagination-controls";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ROUTES } from "@/constants/routes";
import { WishlistItemCard } from "@/features/wishlist/components/wishlist-item-card";
import { useWishlist } from "@/features/wishlist/hooks";
import { useHasMounted } from "@/hooks/use-has-mounted";
import { useAuthStore } from "@/store/auth-store";
import type { WishlistTargetType } from "@/types/wishlist";

const TARGET_TABS: { value: WishlistTargetType | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "product", label: "Products" },
  { value: "store", label: "Stores" },
];

export default function WishlistPage() {
  const router = useRouter();
  const hasMounted = useHasMounted();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [targetType, setTargetType] = useState<WishlistTargetType | "all">("all");
  const [page, setPage] = useState(1);

  const wishlistQuery = useWishlist({
    targetType: targetType === "all" ? undefined : targetType,
    page,
    limit: 12,
  });

  useEffect(() => {
    if (hasMounted && !isAuthenticated) {
      router.replace(`${ROUTES.login}?redirect=${encodeURIComponent(ROUTES.wishlist)}`);
    }
  }, [hasMounted, isAuthenticated, router]);

  if (!hasMounted || !isAuthenticated) {
    return (
      <div className="mx-auto flex max-w-5xl flex-col gap-4 px-4 py-10">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  const items = wishlistQuery.data?.data ?? [];
  const meta = wishlistQuery.data?.meta;

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">Your wishlist</h1>

      <Tabs
        value={targetType}
        onValueChange={(value) => {
          setTargetType(value as WishlistTargetType | "all");
          setPage(1);
        }}
      >
        <TabsList>
          {TARGET_TABS.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {wishlistQuery.isLoading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square w-full" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 text-center text-muted-foreground">
          <HeartOff className="size-10" />
          <p>Nothing saved yet. Tap the heart on a product or store to add it here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((item) => (
            <WishlistItemCard key={item.id} item={item} />
          ))}
        </div>
      )}

      {meta && meta.totalPages > 1 && (
        <PaginationControls page={meta.page} totalPages={meta.totalPages} onPageChange={setPage} />
      )}
    </div>
  );
}
