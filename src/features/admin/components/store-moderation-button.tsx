"use client";

import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { Store } from "@/types/store";
import { useApproveStore, useSuspendStore } from "../hooks";

/**
 * Suspend an approved store (hides it from shoppers), or reinstate a
 * suspended one. Reinstating is the approve endpoint, which accepts a store
 * in any status. Renders nothing for pending/rejected stores — those are
 * handled in the Approvals tab.
 */
export function StoreModerationButton({ store }: { store: Pick<Store, "id" | "approvalStatus"> }) {
  const suspend = useSuspendStore();
  const reinstate = useApproveStore();

  if (store.approvalStatus === "approved") {
    return (
      <Button
        size="sm"
        variant="outline"
        className="text-destructive"
        disabled={suspend.isPending}
        onClick={() => suspend.mutate(store.id)}
      >
        {suspend.isPending && <Loader2 className="size-4 animate-spin" />}
        Suspend
      </Button>
    );
  }

  if (store.approvalStatus === "suspended") {
    return (
      <Button size="sm" variant="outline" disabled={reinstate.isPending} onClick={() => reinstate.mutate(store.id)}>
        {reinstate.isPending && <Loader2 className="size-4 animate-spin" />}
        Reinstate
      </Button>
    );
  }

  return null;
}
