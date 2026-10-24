"use client";

import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { useCreateReview } from "@/features/reviews/hooks";
import { createReviewSchema, type CreateReviewFormValues } from "@/features/reviews/schemas";
import type { ReviewTargetType } from "@/types/review";
import { StarRatingInput } from "./star-rating-input";

interface WriteReviewDialogProps {
  targetType: ReviewTargetType;
  targetId: string | undefined;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/** Modal form for `POST /reviews`, shared by the product and store review sections. */
export function WriteReviewDialog({
  targetType,
  targetId,
  open,
  onOpenChange,
}: WriteReviewDialogProps) {
  const createReview = useCreateReview(targetType, targetId);

  const form = useForm<CreateReviewFormValues>({
    resolver: zodResolver(createReviewSchema),
    defaultValues: { rating: 0, comment: "" },
  });

  useEffect(() => {
    if (open) {
      form.reset({ rating: 0, comment: "" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function onSubmit(values: CreateReviewFormValues) {
    createReview.mutate(
      { rating: values.rating, comment: values.comment || undefined },
      { onSuccess: () => onOpenChange(false) }
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Write a review</DialogTitle>
          <DialogDescription>Share what you thought — your rating and comment will be public.</DialogDescription>
        </DialogHeader>
        <form noValidate onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <FieldGroup>
            <Field data-invalid={!!form.formState.errors.rating}>
              <FieldLabel htmlFor="review-rating">Rating</FieldLabel>
              <Controller
                control={form.control}
                name="rating"
                render={({ field }) => (
                  <StarRatingInput value={field.value} onChange={field.onChange} />
                )}
              />
              <FieldError errors={[form.formState.errors.rating]} />
            </Field>
            <Field data-invalid={!!form.formState.errors.comment}>
              <FieldLabel htmlFor="review-comment">Comment (optional)</FieldLabel>
              <Textarea
                id="review-comment"
                placeholder="What did you like or dislike?"
                rows={4}
                {...form.register("comment")}
              />
              <FieldError errors={[form.formState.errors.comment]} />
            </Field>
          </FieldGroup>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createReview.isPending}>
              {createReview.isPending && <Loader2 className="size-4 animate-spin" />}
              Post review
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
