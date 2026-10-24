"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PackageSearch } from "lucide-react";

import { PaginationControls } from "@/components/shared/pagination-controls";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ROUTES } from "@/constants/routes";
import { OrderCard } from "@/features/orders/components/order-card";
import { useMyOrders } from "@/features/orders/hooks";
import { useStore } from "@/features/stores/hooks";
import { useHasMounted } from "@/hooks/use-has-mounted";
import { useStoreModeSlug } from "@/hooks/use-store-mode";
import { useAuthStore } from "@/store/auth-store";
import type { OrderStatus } from "@/types/order";

const STATUS_TABS: { value: OrderStatus | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "new", label: "New" },
  { value: "processing", label: "Processing" },
  { value: "packed", label: "Packed" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
];

export default function MyOrdersPage() {
  const router = useRouter();
  const hasMounted = useHasMounted();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [status, setStatus] = useState<OrderStatus | "all">("all");
  const [page, setPage] = useState(1);

  // Store-only mode (a store's private link) lists just that store's orders.
  const storeModeSlug = useStoreModeSlug();
  const storeModeQuery = useStore(storeModeSlug ?? "");
  const ordersQuery = useMyOrders(
    {
      status: status === "all" ? undefined : status,
      storeId: storeModeQuery.data?.id,
      page,
      limit: 10,
    },
    !storeModeSlug || storeModeQuery.isSuccess
  );

  useEffect(() => {
    if (hasMounted && !isAuthenticated) {
      router.replace(`${ROUTES.login}?redirect=${encodeURIComponent(ROUTES.orders)}`);
    }
  }, [hasMounted, isAuthenticated, router]);

  if (!hasMounted || !isAuthenticated) {
    return (
      <div className="mx-auto flex max-w-3xl flex-col gap-4 px-4 py-10">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  const orders = ordersQuery.data?.data ?? [];
  const meta = ordersQuery.data?.meta;

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">Your orders</h1>

      <Tabs
        value={status}
        onValueChange={(value) => {
          setStatus(value as OrderStatus | "all");
          setPage(1);
        }}
      >
        <TabsList className="flex-wrap">
          {STATUS_TABS.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {ordersQuery.isLoading || storeModeQuery.isLoading ? (
        <div className="flex flex-col gap-3">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      ) : orders.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 text-center text-muted-foreground">
          <PackageSearch className="size-10" />
          <p>No orders found.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}

      {meta && meta.totalPages > 1 && (
        <PaginationControls page={meta.page} totalPages={meta.totalPages} onPageChange={setPage} />
      )}
    </div>
  );
}
