"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { MessageSquareText } from "lucide-react";

import { PaginationControls } from "@/components/shared/pagination-controls";
import { RatingStars } from "@/components/shared/rating-stars";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ROUTES } from "@/constants/routes";
import { WriteReviewDialog } from "@/features/reviews/components/write-review-dialog";
import { useReviews } from "@/features/reviews/hooks";
import { useHasMounted } from "@/hooks/use-has-mounted";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth-store";
import type { ReviewTargetType } from "@/types/review";

const REVIEWS_PER_PAGE = 10;

function initials(fullName: string) {
  return fullName
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function formatDate(iso: string) {
  try {
    return new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(new Date(iso));
  } catch {
    return iso;
  }
}

interface ReviewsSectionProps {
  targetType: ReviewTargetType;
  targetId: string | undefined;
  avgRating?: number;
  reviewCount?: number;
  className?: string;
}

/**
 * Paginated review list + average rating summary bar. Shared by
 * `features/products/components/product-reviews.tsx` and
 * `features/stores/components/store-reviews.tsx`, since both just call
 * `GET /reviews/target/:targetType/:targetId` with a different target type.
 */
export function ReviewsSection({
  targetType,
  targetId,
  avgRating = 0,
  reviewCount = 0,
  className,
}: ReviewsSectionProps) {
  const [page, setPage] = useState(1);
  const [writeOpen, setWriteOpen] = useState(false);
  const isProduct = targetType === "product";
  const { data, isLoading, isError } = useReviews(targetType, isProduct ? targetId : undefined, {
    page,
    limit: REVIEWS_PER_PAGE,
  });
  const hasMounted = useHasMounted();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return (
    <section className={cn("flex flex-col gap-5", className)}>
      <div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4 sm:flex-row sm:items-center sm:gap-6">
        <div className="flex flex-col items-center gap-1 sm:border-r sm:border-border sm:pr-6">
          <span className="text-3xl font-bold text-foreground">{avgRating.toFixed(1)}</span>
          <RatingStars rating={avgRating} hideCount size="md" />
          <span className="text-xs text-muted-foreground">
            {reviewCount.toLocaleString()} {reviewCount === 1 ? "review" : "reviews"}
          </span>
        </div>
        <p className="flex-1 text-sm text-muted-foreground">
          {isProduct
            ? "Ratings and reviews are from verified customers."
            : "This store's rating is the average of the reviews left on its products."}
        </p>
        {isProduct && hasMounted && (
          <div className="sm:self-start">
            {isAuthenticated ? (
              <Button variant="outline" size="sm" onClick={() => setWriteOpen(true)}>
                Write a review
              </Button>
            ) : (
              <Button variant="outline" size="sm" asChild>
                <Link href={ROUTES.login}>Log in to write a review</Link>
              </Button>
            )}
          </div>
        )}
      </div>

      {isProduct && (
        <>
          <WriteReviewDialog
            targetType={targetType}
            targetId={targetId}
            open={writeOpen}
            onOpenChange={setWriteOpen}
          />

          {isLoading && (
            <div className="flex flex-col gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex gap-3">
                  <Skeleton className="size-9 shrink-0 rounded-full" />
                  <div className="flex flex-1 flex-col gap-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {isError && (
            <p className="text-sm text-destructive">Couldn&apos;t load reviews. Please try again.</p>
          )}

          {!isLoading && !isError && data && data.data.length === 0 && (
            <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-border py-10 text-center">
              <MessageSquareText className="size-6 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                No reviews yet. Be the first to share one.
              </p>
            </div>
          )}

          {!isLoading && !isError && data && data.data.length > 0 && (
            <ul className="flex flex-col gap-5">
              {data.data.map((review) => (
                <li key={review.id} className="flex gap-3">
                  <Avatar size="sm" className="mt-0.5">
                    <AvatarImage src={review.user.avatarUrl ?? undefined} alt="" />
                    <AvatarFallback>{initials(review.user.fullName)}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-1 flex-col gap-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-medium text-foreground">
                        {review.user.fullName}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(review.createdAt)}
                      </span>
                    </div>
                    <RatingStars rating={review.rating} hideCount size="sm" />
                    <p className="text-sm text-muted-foreground">{review.comment}</p>
                    {review.sellerReply && (
                      <div className="mt-2 rounded-md border border-border bg-muted/40 p-3">
                        <p className="text-xs font-semibold text-foreground">
                          Reply from the seller
                        </p>
                        <p className="mt-1 text-sm text-muted-foreground">{review.sellerReply}</p>
                      </div>
                    )}
                    {review.images && review.images.length > 0 && (
                      <div className="mt-1 flex gap-2">
                        {review.images.map((url) => (
                          <div
                            key={url}
                            className="relative size-16 overflow-hidden rounded-md border border-border"
                          >
                            <Image src={url} alt="" fill sizes="64px" className="object-cover" />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}

          {data && (
            <PaginationControls
              page={page}
              totalPages={data.meta.totalPages}
              onPageChange={setPage}
            />
          )}
        </>
      )}
    </section>
  );
}
