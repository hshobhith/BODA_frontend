"use client";

import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  useApproveStore,
  usePendingStores,
  useRejectStore,
} from "../hooks";
import { STORE_TYPE_META, type Store } from "@/types/store";

/** Store type plus the licence the admin should verify before approving. */
function StoreTypeAndLicence({ store }: { store: Store }) {
  const meta = STORE_TYPE_META[store.storeType ?? "retail"];
  const missingLicence = !!meta.licenceLabel && !store.licenseInfo?.trim();
  return (
    <div className="flex flex-wrap items-center gap-2 text-sm">
      <Badge variant={store.storeType && store.storeType !== "retail" ? "default" : "secondary"}>
        {meta.label}
      </Badge>
      {meta.licenceLabel &&
        (missingLicence ? (
          <span className="font-medium text-destructive">No {meta.licenceLabel.toLowerCase()} given</span>
        ) : (
          <span className="text-muted-foreground">
            {meta.licenceLabel}: <span className="font-mono text-foreground">{store.licenseInfo}</span>
          </span>
        ))}
      {!meta.licenceLabel && store.licenseInfo && (
        <span className="text-muted-foreground">Licence: {store.licenseInfo}</span>
      )}
      {store.gstNumber && (
        <span className="text-muted-foreground">
          GST: <span className="font-mono text-foreground">{store.gstNumber}</span>
        </span>
      )}
    </div>
  );
}

/** Pending stores shown per page before pagination kicks in. */
const PENDING_PAGE_SIZE = 10;

export function StoreApprovalTable() {
  const [pendingPage, setPendingPage] = useState(1);
  const pendingQuery = usePendingStores({ page: pendingPage, limit: PENDING_PAGE_SIZE });
  const approve = useApproveStore();
  const [rejectTarget, setRejectTarget] = useState<Store | null>(null);
  const [reason, setReason] = useState("");
  const reject = useRejectStore();

  const pending = pendingQuery.data?.data ?? [];
  const pendingTotal = pendingQuery.data?.meta.total ?? 0;
  const pendingPages = Math.max(1, Math.ceil(pendingTotal / PENDING_PAGE_SIZE));

  // Approving/rejecting the last store on a page shrinks the total — step back
  // so the admin isn't left looking at an empty page while others remain.
  if (pendingQuery.data && pendingPage > pendingPages) {
    setPendingPage(pendingPages);
  }

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Pending approval ({pendingQuery.data?.meta.total ?? "…"})
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {pendingQuery.isLoading ? (
            <Skeleton className="h-24 w-full" />
          ) : pending.length === 0 ? (
            <p className="text-sm text-muted-foreground">No stores awaiting approval.</p>
          ) : (
            pending.map((store) => (
              <div
                key={store.id}
                className="flex flex-col gap-2 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex flex-col gap-1">
                  <p className="font-medium text-foreground">{store.name}</p>
                  <StoreTypeAndLicence store={store} />
                  <p className="text-sm text-muted-foreground">
                    {store.businessType} &middot; {store.addressLine}, {store.city}, {store.state}{" "}
                    {store.pincode} &middot; {store.phone} &middot; {store.email}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => approve.mutate(store.id)}>
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-destructive"
                    onClick={() => setRejectTarget(store)}
                  >
                    Reject
                  </Button>
                </div>
              </div>
            ))
          )}
          {pendingPages > 1 && (
            <div className="flex items-center justify-between gap-2 pt-2">
              <p className="text-sm text-muted-foreground">
                Showing {(pendingPage - 1) * PENDING_PAGE_SIZE + 1}–
                {Math.min(pendingPage * PENDING_PAGE_SIZE, pendingTotal)} of {pendingTotal}
              </p>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={pendingPage <= 1 || pendingQuery.isFetching}
                  onClick={() => setPendingPage((p) => p - 1)}
                >
                  Previous
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={pendingPage >= pendingPages || pendingQuery.isFetching}
                  onClick={() => setPendingPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!rejectTarget} onOpenChange={(open) => !open && setRejectTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject {rejectTarget?.name}</DialogTitle>
          </DialogHeader>
          <Textarea
            placeholder="Reason for rejection (shown to the seller)"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectTarget(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={!reason.trim() || reject.isPending}
              onClick={() => {
                if (rejectTarget) {
                  reject.mutate(
                    { id: rejectTarget.id, reason },
                    { onSuccess: () => setRejectTarget(null) }
                  );
                }
                setReason("");
              }}
            >
              Reject store
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
