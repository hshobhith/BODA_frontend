"use client";

import { useState } from "react";
import { Loader2, MessageSquareText, Pencil, Store as StoreIcon, Trash2 } from "lucide-react";

import { PaginationControls } from "@/components/shared/pagination-controls";
import { RatingStars } from "@/components/shared/rating-stars";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useReplyToReview, useRemoveReply, useSellerReviews } from "@/features/reviews/hooks";
import type { Review } from "@/types/review";

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

function ReplyComposer({ review }: { review: Review }) {
  const [draft, setDraft] = useState(review.sellerReply ?? "");
  const [editing, setEditing] = useState(!review.sellerReply);
  const reply = useReplyToReview();
  const removeReply = useRemoveReply();

  if (!editing && review.sellerReply) {
    return (
      <div className="mt-2 rounded-md border border-border bg-muted/40 p-3">
        <div className="flex items-start justify-between gap-2">
          <p className="text-xs font-semibold text-foreground">Your reply</p>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" className="size-6" onClick={() => setEditing(true)}>
              <Pencil className="size-3.5" />
              <span className="sr-only">Edit reply</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="size-6 text-destructive"
              onClick={() => removeReply.mutate(review.id)}
              disabled={removeReply.isPending}
            >
              <Trash2 className="size-3.5" />
              <span className="sr-only">Remove reply</span>
            </Button>
          </div>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">{review.sellerReply}</p>
      </div>
    );
  }

  return (
    <div className="mt-2 flex flex-col gap-2">
      <Textarea
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        placeholder="Write a reply shoppers will see under this review..."
        rows={2}
      />
      <div className="flex gap-2">
        <Button
          size="sm"
          disabled={!draft.trim() || reply.isPending}
          onClick={() =>
            reply.mutate(
              { reviewId: review.id, reply: draft.trim() },
              { onSuccess: () => setEditing(false) }
            )
          }
        >
          {reply.isPending && <Loader2 className="size-4 animate-spin" />}
          {review.sellerReply ? "Save reply" : "Reply"}
        </Button>
        {review.sellerReply && (
          <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>
            Cancel
          </Button>
        )}
      </div>
    </div>
  );
}

interface SellerReviewListProps {
  storeId: string | undefined;
}

/** Reviews on the seller's store and its products, with an inline reply composer per review. */
export function SellerReviewList({ storeId }: SellerReviewListProps) {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError } = useSellerReviews(storeId, { page, limit: REVIEWS_PER_PAGE });

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-28 w-full" />
        ))}
      </div>
    );
  }

  if (isError) {
    return <p className="text-sm text-destructive">Couldn&apos;t load reviews. Please try again.</p>;
  }

  if (!data || data.data.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-border py-16 text-center">
        <MessageSquareText className="size-8 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">No reviews yet.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <ul className="flex flex-col gap-4">
        {data.data.map((review) => (
          <li key={review.id} className="rounded-lg border border-border p-4">
            <div className="flex gap-3">
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
                  {review.targetType === "store" && (
                    <Badge variant="secondary" className="gap-1 text-xs">
                      <StoreIcon className="size-3" />
                      Store review
                    </Badge>
                  )}
                </div>
                <RatingStars rating={review.rating} hideCount size="sm" />
                <p className="text-sm text-muted-foreground">{review.comment}</p>
                <ReplyComposer review={review} />
              </div>
            </div>
          </li>
        ))}
      </ul>
      <PaginationControls page={page} totalPages={data.meta.totalPages} onPageChange={setPage} />
    </div>
  );
}
