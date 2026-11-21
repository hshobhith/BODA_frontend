"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { ROUTES } from "@/constants/routes";
import { AdminStoreForm } from "@/features/admin/components/admin-store-form";

/** Admin sets up a store for a seller, by the seller's email. */
export default function AdminNewStorePage() {
  const router = useRouter();

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <div className="flex flex-col gap-3">
        <Link
          href={ROUTES.adminStores}
          className="flex w-fit items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          All stores
        </Link>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Add a store for a seller</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            The store is approved straight away. Next you can add its hours, delivery settings and
            products.
          </p>
        </div>
      </div>
      <AdminStoreForm onSuccess={(store) => router.push(ROUTES.adminStoreManage(store.id))} />
    </div>
  );
}
