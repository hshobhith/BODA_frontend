"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Skeleton } from "@/components/ui/skeleton";
import { useAddresses, useCreateAddress } from "../hooks";
import { AddressForm } from "./address-form";

interface AddressPickerProps {
  value: string | undefined;
  onChange: (addressId: string) => void;
}

export function AddressPicker({ value, onChange }: AddressPickerProps) {
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const addressesQuery = useAddresses();
  const createAddress = useCreateAddress();

  if (addressesQuery.isLoading) {
    return (
      <div className="flex flex-col gap-2">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
      </div>
    );
  }

  const addresses = addressesQuery.data ?? [];

  return (
    <div className="flex flex-col gap-3">
      {addresses.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          You don&apos;t have a saved address yet. Add one to continue.
        </p>
      ) : (
        <RadioGroup value={value} onValueChange={onChange} className="flex flex-col gap-2">
          {addresses.map((address) => (
            <Label
              key={address.id}
              htmlFor={`addr-${address.id}`}
              className="flex cursor-pointer items-start gap-3 rounded-lg border p-3 text-sm font-normal has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/5"
            >
              <RadioGroupItem id={`addr-${address.id}`} value={address.id} className="mt-0.5" />
              <span>
                <span className="font-medium text-foreground">{address.label}</span>
                <br />
                <span className="text-muted-foreground">
                  {address.line1}
                  {address.line2 ? `, ${address.line2}` : ""}, {address.city}, {address.state}{" "}
                  {address.pincode}
                </span>
              </span>
            </Label>
          ))}
        </RadioGroup>
      )}

      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-fit gap-1"
          onClick={() => setAddDialogOpen(true)}
        >
          <Plus className="size-3.5" /> Add new address
        </Button>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add a delivery address</DialogTitle>
          </DialogHeader>
          <AddressForm
            isPending={createAddress.isPending}
            onSubmit={(values) =>
              createAddress.mutate(
                { ...values, line2: values.line2 || undefined },
                {
                  onSuccess: (created) => {
                    setAddDialogOpen(false);
                    onChange(created.id);
                  },
                }
              )
            }
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
