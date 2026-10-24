import { ReviewsSection } from "@/components/shared/reviews-section";

interface ProductReviewsProps {
  productId: string | undefined;
  avgRating?: number;
  reviewCount?: number;
  className?: string;
}

/** Thin wrapper around the shared reviews UI, scoped to `targetType: "product"`. */
export function ProductReviews({ productId, avgRating, reviewCount, className }: ProductReviewsProps) {
  return (
    <ReviewsSection
      targetType="product"
      targetId={productId}
      avgRating={avgRating}
      reviewCount={reviewCount}
      className={className}
    />
  );
}
