"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MapPinOff, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { ROUTES } from "@/constants/routes";
import { AddressCard } from "@/features/addresses/components/address-card";
import { AddressForm } from "@/features/addresses/components/address-form";
import {
  useAddresses,
  useCreateAddress,
  useDeleteAddress,
  useSetDefaultAddress,
  useUpdateAddress,
} from "@/features/addresses/hooks";
import { useHasMounted } from "@/hooks/use-has-mounted";
import { useAuthStore } from "@/store/auth-store";
import type { Address } from "@/types/address";

export default function AddressesPage() {
  const router = useRouter();
  const hasMounted = useHasMounted();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Address | null>(null);

  const addressesQuery = useAddresses();
  const createAddress = useCreateAddress();
  const updateAddress = useUpdateAddress();
  const deleteAddress = useDeleteAddress();
  const setDefaultAddress = useSetDefaultAddress();

  useEffect(() => {
    if (hasMounted && !isAuthenticated) {
      router.replace(`${ROUTES.login}?redirect=${encodeURIComponent(ROUTES.accountAddresses)}`);
    }
  }, [hasMounted, isAuthenticated, router]);

  if (!hasMounted || !isAuthenticated) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col gap-4 px-4 py-10">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  const addresses = addressesQuery.data ?? [];

  function openAddDialog() {
    setEditing(null);
    setDialogOpen(true);
  }

  function openEditDialog(address: Address) {
    setEditing(address);
    setDialogOpen(true);
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Saved addresses
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage the delivery addresses used at checkout.
          </p>
        </div>
        <Button type="button" onClick={openAddDialog} className="gap-1.5">
          <Plus className="size-4" />
          Add address
        </Button>
      </div>

      {addressesQuery.isLoading ? (
        <div className="flex flex-col gap-3">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      ) : addresses.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 text-center text-muted-foreground">
          <MapPinOff className="size-10" />
          <p>No saved addresses yet.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {addresses.map((address) => (
            <AddressCard
              key={address.id}
              address={address}
              onSetDefault={() => setDefaultAddress.mutate(address.id)}
              onEdit={() => openEditDialog(address)}
              onDelete={() => deleteAddress.mutate(address.id)}
              isDeleting={deleteAddress.isPending && deleteAddress.variables === address.id}
            />
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit address" : "Add a new address"}</DialogTitle>
          </DialogHeader>
          <AddressForm
            initialValues={editing ?? undefined}
            isPending={createAddress.isPending || updateAddress.isPending}
            submitLabel={editing ? "Save changes" : "Add address"}
            onSubmit={(values) => {
              const payload = { ...values, line2: values.line2 || undefined };
              if (editing) {
                updateAddress.mutate(
                  { id: editing.id, payload },
                  { onSuccess: () => setDialogOpen(false) }
                );
              } else {
                createAddress.mutate(payload, { onSuccess: () => setDialogOpen(false) });
              }
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
