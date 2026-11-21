"use client";

import { Suspense } from "react";
import { useParams, useSearchParams } from "next/navigation";

import { Skeleton } from "@/components/ui/skeleton";
import {
  ADMIN_STORE_TABS,
  AdminStoreManager,
  type AdminStoreTab,
} from "@/features/admin/components/admin-store-manager";

function AdminStoreContent() {
  const { id } = useParams<{ id: string }>();
  // `?tab=products` — the product pages send the admin back to that tab.
  const tab = useSearchParams().get("tab");
  const initialTab = ADMIN_STORE_TABS.includes(tab as AdminStoreTab) ? (tab as AdminStoreTab) : undefined;

  return <AdminStoreManager key={id} storeId={id} initialTab={initialTab} />;
}

export default function AdminStorePage() {
  return (
    <Suspense fallback={<Skeleton className="h-96 w-full" />}>
      <AdminStoreContent />
    </Suspense>
  );
}
