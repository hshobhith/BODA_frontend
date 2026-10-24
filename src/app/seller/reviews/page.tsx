"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { SellerReviewList } from "@/features/seller/components/seller-review-list";
import { useSelectedStoreId } from "@/features/seller/hooks";

export default function SellerReviewsPage() {
  const selectedStoreId = useSelectedStoreId();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Reviews</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          See what shoppers are saying about your store and products, and reply.
        </p>
      </div>

      {selectedStoreId ? (
        <SellerReviewList storeId={selectedStoreId} />
      ) : (
        <Skeleton className="h-64 w-full" />
      )}
    </div>
  );
}
