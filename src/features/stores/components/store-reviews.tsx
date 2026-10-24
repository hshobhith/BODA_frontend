import { ReviewsSection } from "@/components/shared/reviews-section";

interface StoreReviewsProps {
  storeId: string | undefined;
  avgRating?: number;
  reviewCount?: number;
  className?: string;
}

/** Thin wrapper around the shared reviews UI, scoped to `targetType: "store"`. */
export function StoreReviews({ storeId, avgRating, reviewCount, className }: StoreReviewsProps) {
  return (
    <ReviewsSection
      targetType="store"
      targetId={storeId}
      avgRating={avgRating}
      reviewCount={reviewCount}
      className={className}
    />
  );
}
