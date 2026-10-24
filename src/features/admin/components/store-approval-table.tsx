"use client";

import { useState } from "react";
import { Search } from "lucide-react";

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
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  useApprovedStoreSearch,
  useApproveStore,
  usePendingStores,
  useRejectStore,
  useSuspendStore,
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

export function StoreApprovalTable() {
  const pendingQuery = usePendingStores();
  const approve = useApproveStore();
  const suspend = useSuspendStore();
  const [rejectTarget, setRejectTarget] = useState<Store | null>(null);
  const [reason, setReason] = useState("");
  const reject = useRejectStore();

  const [search, setSearch] = useState("");
  const searchQuery = useApprovedStoreSearch(search);

  const pending = pendingQuery.data?.data ?? [];

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
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Manage approved stores</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <div className="relative">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by store name or city..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          {search.trim() && (
            <div className="flex flex-col gap-2">
              {searchQuery.isLoading && <Skeleton className="h-16 w-full" />}
              {(searchQuery.data?.data ?? []).map((store) => (
                <div
                  key={store.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div>
                    <p className="font-medium text-foreground">{store.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {store.city}, {store.state} &middot;{" "}
                      <Badge variant="secondary" className="ml-1">
                        {store.approvalStatus}
                      </Badge>
                    </p>
                  </div>
                  {store.approvalStatus === "approved" && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-destructive"
                      onClick={() => suspend.mutate(store.id)}
                    >
                      Suspend
                    </Button>
                  )}
                </div>
              ))}
              {searchQuery.data && searchQuery.data.data.length === 0 && (
                <p className="text-sm text-muted-foreground">No matching stores.</p>
              )}
            </div>
          )}
          <p className="text-xs text-muted-foreground">
            There&apos;s no dedicated &quot;list all stores&quot; admin endpoint yet — this
            searches the public approved-stores index, which is enough to locate a store to
            suspend.
          </p>
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
