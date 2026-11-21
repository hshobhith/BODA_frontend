"use client";

import Link from "next/link";
import { ArrowLeft, ExternalLink, Loader2, Mail, Plus, ScanBarcode } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ROUTES } from "@/constants/routes";
import { DeliverySettingsForm } from "@/features/seller/components/delivery-settings-form";
import { ProductTable } from "@/features/seller/components/product-table";
import { StoreSettingsForm } from "@/features/seller/components/store-settings-form";
import { StoreStatusToggle } from "@/features/seller/components/store-status-toggle";
import { WorkingHoursEditor } from "@/features/seller/components/working-hours-editor";
import { useMyStore } from "@/features/seller/hooks";
import type { ApiError } from "@/types/api";
import { useAdminStore, useResendSellerInvite } from "../hooks";
import { StoreModerationButton } from "./store-moderation-button";

export const ADMIN_STORE_TABS = ["details", "hours", "delivery", "products"] as const;
export type AdminStoreTab = (typeof ADMIN_STORE_TABS)[number];

interface AdminStoreManagerProps {
  storeId: string;
  initialTab?: AdminStoreTab;
}

/**
 * An admin managing a store on its seller's behalf: the same forms the
 * seller uses in `/seller/store` and `/seller/products`. The backend lets an
 * admin call those seller endpoints for any store when it passes `storeId`,
 * so whatever is saved here is exactly what the seller sees when they sign in.
 */
export function AdminStoreManager({ storeId, initialTab = "details" }: AdminStoreManagerProps) {
  const adminStoreQuery = useAdminStore(storeId);
  // Same query (and cache key) the seller forms update after saving.
  const storeQuery = useMyStore(true, storeId);
  const resendInvite = useResendSellerInvite();

  const store = storeQuery.data;
  const seller = adminStoreQuery.data?.seller;
  // From the admin query: approve/suspend refresh it, not the seller-side store cache.
  const approvalStatus = adminStoreQuery.data?.approvalStatus ?? store?.approvalStatus;

  if (storeQuery.isError) {
    const notFound = (storeQuery.error as unknown as ApiError)?.statusCode === 404;
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-center">
        <h1 className="text-xl font-semibold text-foreground">
          {notFound ? "Store not found" : "Could not load this store"}
        </h1>
        <Button asChild>
          <Link href={ROUTES.adminStores}>Back to stores</Link>
        </Button>
      </div>
    );
  }

  if (!store) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <Link
          href={ROUTES.adminStores}
          className="flex w-fit items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          All stores
        </Link>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="truncate text-2xl font-semibold tracking-tight text-foreground">{store.name}</h1>
              <Badge
                variant={
                  approvalStatus === "approved"
                    ? "default"
                    : approvalStatus === "suspended" || approvalStatus === "rejected"
                      ? "destructive"
                      : "secondary"
                }
                className="capitalize"
              >
                {approvalStatus}
              </Badge>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              Seller:{" "}
              {seller ? (
                <>
                  <span className="text-foreground">{seller.fullName}</span> &middot; {seller.email}
                </>
              ) : (
                "…"
              )}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {approvalStatus === "approved" && (
              <Button asChild variant="outline" size="sm">
                <Link href={ROUTES.storeDetail(store.slug)} target="_blank" rel="noreferrer">
                  <ExternalLink className="size-4" />
                  View public page
                </Link>
              </Button>
            )}
            <StoreModerationButton store={{ id: store.id, approvalStatus }} />
          </div>
        </div>
      </div>

      {seller && !seller.hasSignedIn && (
        <Alert>
          <Mail className="size-4" />
          <AlertTitle>{seller.email} hasn&apos;t signed in yet</AlertTitle>
          <AlertDescription className="flex flex-col gap-2">
            <span>
              When they sign in with Google using this email, this store — with everything you add
              here — will be in their seller dashboard, and they can manage it themselves.
            </span>
            <Button
              size="sm"
              variant="outline"
              className="w-fit"
              disabled={resendInvite.isPending}
              onClick={() => resendInvite.mutate(storeId)}
            >
              {resendInvite.isPending && <Loader2 className="size-4 animate-spin" />}
              Email them again
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <StoreStatusToggle store={store} />

      <Tabs defaultValue={initialTab}>
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="hours">Working hours</TabsTrigger>
          <TabsTrigger value="delivery">Delivery</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
        </TabsList>
        <TabsContent value="details" className="pt-4">
          <StoreSettingsForm store={store} />
        </TabsContent>
        <TabsContent value="hours" className="pt-4">
          <WorkingHoursEditor storeId={store.id} />
        </TabsContent>
        <TabsContent value="delivery" className="pt-4">
          <DeliverySettingsForm store={store} />
        </TabsContent>
        <TabsContent value="products" className="flex flex-col gap-4 pt-4">
          <div className="flex flex-wrap justify-end gap-2">
            <Button asChild variant="outline">
              <Link href={`${ROUTES.adminStoreProductNew(store.id)}?scan=1`}>
                <ScanBarcode className="size-4" />
                Scan barcode
              </Link>
            </Button>
            <Button asChild>
              <Link href={ROUTES.adminStoreProductNew(store.id)}>
                <Plus className="size-4" />
                Add product
              </Link>
            </Button>
          </div>
          <ProductTable
            storeId={store.id}
            editHref={(productId) => ROUTES.adminStoreProductEdit(store.id, productId)}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
