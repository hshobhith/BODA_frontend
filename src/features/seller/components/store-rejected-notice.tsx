"use client";

import Link from "next/link";
import { Loader2, Pencil, Send, ShieldAlert } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import type { Store } from "@/types/store";
import { useResubmitStore } from "../hooks";

/**
 * Shown while a store is rejected: the admin's reason, where to fix it, and a
 * button to send it back for approval. `showEditLink` is off on the settings
 * page itself, where the seller is already editing.
 */
export function StoreRejectedNotice({
  store,
  showEditLink = true,
}: {
  store: Store;
  showEditLink?: boolean;
}) {
  const resubmit = useResubmitStore(store.id);

  return (
    <Alert variant="destructive">
      <ShieldAlert />
      <AlertTitle>Application rejected</AlertTitle>
      <AlertDescription className="flex flex-col gap-3">
        <p>
          <span className="font-medium">Reason: </span>
          {store.rejectionReason ?? "No reason was given. Contact support for details."}
        </p>
        <p className="text-muted-foreground">
          Fix the details mentioned above in your store settings, then send your store for approval
          again.
        </p>
        <div className="flex flex-wrap gap-2">
          {showEditLink && (
            <Button asChild size="sm" variant="outline" className="gap-1.5">
              <Link href={ROUTES.sellerStore}>
                <Pencil className="size-3.5" />
                Edit store details
              </Link>
            </Button>
          )}
          <Button
            size="sm"
            className="gap-1.5"
            onClick={() => resubmit.mutate()}
            disabled={resubmit.isPending}
          >
            {resubmit.isPending ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Send className="size-3.5" />
            )}
            Request approval again
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
}
