"use client";

import Link from "next/link";
import { CheckCircle2, Clock, PackageSearch, ShieldAlert } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ROUTES } from "@/constants/routes";
import { AnalyticsOverview } from "@/features/seller/components/analytics-overview";
import { StoreShareCard } from "@/features/seller/components/store-share-card";
import { useMyStore, useSelectedStoreId, useSellerOrders } from "@/features/seller/hooks";
import { OrderCard } from "@/features/orders/components/order-card";
import type { Store } from "@/types/store";

function StoreApprovalBanner({ store }: { store: Store }) {
  if (store.approvalStatus === "pending") {
    return (
      <Alert>
        <Clock />
        <AlertTitle>Pending admin approval</AlertTitle>
        <AlertDescription>
          Your store is under review. You can keep setting up products and hours in the meantime —
          they&apos;ll be ready to go the moment you&apos;re approved.
        </AlertDescription>
      </Alert>
    );
  }

  if (store.approvalStatus === "rejected") {
    return (
      <Alert variant="destructive">
        <ShieldAlert />
        <AlertTitle>Application rejected</AlertTitle>
        <AlertDescription>
          {store.rejectionReason ?? "Please review your store details and contact support."}
        </AlertDescription>
      </Alert>
    );
  }

  if (store.approvalStatus === "suspended") {
    return (
      <Alert variant="destructive">
        <ShieldAlert />
        <AlertTitle>Store suspended</AlertTitle>
        <AlertDescription>
          Your store has been suspended and isn&apos;t visible to shoppers. Contact support for
          details.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert>
      <CheckCircle2 />
      <AlertTitle>You&apos;re approved and live</AlertTitle>
      <AlertDescription>Shoppers can find and order from {store.name}.</AlertDescription>
    </Alert>
  );
}

export default function SellerDashboardPage() {
  const selectedStoreId = useSelectedStoreId();
  const storeQuery = useMyStore(Boolean(selectedStoreId), selectedStoreId);
  const recentOrdersQuery = useSellerOrders({ limit: 5, storeId: selectedStoreId });
  const store = storeQuery.data;

  if (!store) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const recentOrders = recentOrdersQuery.data?.data ?? [];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">{store.name}</h1>
        <p className="mt-1 text-sm text-muted-foreground">Here&apos;s how your store is doing.</p>
      </div>

      <StoreApprovalBanner store={store} />

      {/* Keyed by store so switching stores resets the QR/banner state with the link. */}
      <StoreShareCard key={store.id} store={store} />

      <AnalyticsOverview storeId={store.id} />

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Recent orders</h2>
          <Button asChild variant="ghost" size="sm">
            <Link href={ROUTES.sellerOrders}>View all</Link>
          </Button>
        </div>
        {recentOrdersQuery.isLoading ? (
          <Skeleton className="h-20 w-full" />
        ) : recentOrders.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-10 text-center text-muted-foreground">
            <PackageSearch className="size-8" />
            <p className="text-sm">No orders yet.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {recentOrders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
