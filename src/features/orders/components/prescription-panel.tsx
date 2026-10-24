"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, FileText, Loader2, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { PRESCRIPTION_STATUS_META, type Order } from "@/types/order";
import { usePrescriptionFile, useReviewPrescription } from "../hooks";

/** One prescription file, fetched with the user's token (there's no public URL). */
function PrescriptionFile({ orderId, index }: { orderId: string; index: number }) {
  const { data: blob, isLoading, isError } = usePrescriptionFile(orderId, index);
  const url = useMemo(() => (blob ? URL.createObjectURL(blob) : null), [blob]);
  useEffect(() => () => {
    if (url) URL.revokeObjectURL(url);
  }, [url]);

  if (isLoading) {
    return <Skeleton className="aspect-[3/4] w-full" />;
  }
  if (isError || !url || !blob) {
    return (
      <div className="flex aspect-[3/4] items-center justify-center rounded-md border border-dashed p-2 text-center text-xs text-muted-foreground">
        Couldn&apos;t load this file
      </div>
    );
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className="block overflow-hidden rounded-md border border-border hover:border-primary/50"
      title="Open full size"
    >
      {blob.type.startsWith("image/") ? (
        // eslint-disable-next-line @next/next/no-img-element -- blob: URL of a private file, not an optimizable remote image
        <img
          src={url}
          alt={`Prescription page ${index + 1}`}
          className="aspect-[3/4] w-full bg-muted object-contain"
        />
      ) : (
        <span className="flex aspect-[3/4] flex-col items-center justify-center gap-2 bg-muted text-sm text-muted-foreground">
          <FileText className="size-8" />
          Open PDF
        </span>
      )}
    </a>
  );
}

interface PrescriptionPanelProps {
  order: Order;
  /** Seller/admin: show approve/reject while the prescription is pending review. */
  canReview?: boolean;
  onReviewed?: () => void;
}

/** Prescription status, files, and (for the pharmacy) the approve/reject controls. */
export function PrescriptionPanel({ order, canReview = false, onReviewed }: PrescriptionPanelProps) {
  const review = useReviewPrescription();
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState("");

  const status = order.prescriptionStatus ?? "not_required";
  const meta = PRESCRIPTION_STATUS_META[status];
  const keys = order.prescriptionKeys ?? [];
  const isPending = status === "pending_review";

  function submit(approve: boolean) {
    review.mutate(
      { id: order.id, payload: { approve, note: approve ? undefined : reason.trim() } },
      { onSuccess: () => onReviewed?.() }
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="secondary" className={cn(meta.className, "border-0 font-medium")}>
          {meta.label}
        </Badge>
        {isPending && !canReview && (
          <span className="text-xs text-muted-foreground">
            The pharmacy will check it before preparing your order.
          </span>
        )}
      </div>

      {order.prescriptionNote && (
        <p className="text-sm text-muted-foreground">Pharmacy note: {order.prescriptionNote}</p>
      )}

      {keys.length > 0 && (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {keys.map((key, index) => (
            <PrescriptionFile key={key} orderId={order.id} index={index} />
          ))}
        </div>
      )}

      {canReview && isPending && (
        <div className="flex flex-col gap-2 border-t pt-3">
          {rejecting ? (
            <>
              <Textarea
                placeholder="Why are you rejecting it? The customer will see this."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                maxLength={500}
              />
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="destructive"
                  className="gap-2"
                  disabled={!reason.trim() || review.isPending}
                  onClick={() => submit(false)}
                >
                  {review.isPending ? <Loader2 className="size-4 animate-spin" /> : <X className="size-4" />}
                  Reject and cancel order
                </Button>
                <Button type="button" variant="ghost" onClick={() => setRejecting(false)}>
                  Back
                </Button>
              </div>
            </>
          ) : (
            <div className="flex flex-wrap gap-2">
              <Button type="button" className="gap-2" disabled={review.isPending} onClick={() => submit(true)}>
                {review.isPending ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
                Approve prescription
              </Button>
              <Button type="button" variant="outline" onClick={() => setRejecting(true)}>
                Reject
              </Button>
            </div>
          )}
          <p className="text-xs text-muted-foreground">
            Check that the prescription is valid and covers every Rx item before approving.
          </p>
        </div>
      )}
    </div>
  );
}
