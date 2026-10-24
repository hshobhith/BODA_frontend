"use client";

import { Loader2 } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm, useWatch } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { LocationPickerDialog } from "@/components/shared/location-picker";
import type { Address } from "@/types/address";
import { addressSchema, type AddressFormValues } from "../schemas";

interface AddressFormProps {
  initialValues?: Address;
  onSubmit: (values: AddressFormValues) => void;
  isPending?: boolean;
  submitLabel?: string;
}

export function AddressForm({
  initialValues,
  onSubmit,
  isPending,
  submitLabel = "Save address",
}: AddressFormProps) {
  const form = useForm<AddressFormValues>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      label: initialValues?.label ?? "Home",
      line1: initialValues?.line1 ?? "",
      line2: initialValues?.line2 ?? "",
      city: initialValues?.city ?? "",
      state: initialValues?.state ?? "",
      country: initialValues?.country ?? "India",
      pincode: initialValues?.pincode ?? "",
      lat: initialValues?.lat ?? 12.9716,
      lng: initialValues?.lng ?? 77.5946,
      isDefault: initialValues?.isDefault ?? false,
    },
  });

  const lat = useWatch({ control: form.control, name: "lat" });
  const lng = useWatch({ control: form.control, name: "lng" });

  return (
    <form noValidate onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <FieldGroup>
        <Field data-invalid={!!form.formState.errors.label}>
          <FieldLabel htmlFor="label">Label</FieldLabel>
          <Input id="label" placeholder="Home, Work, ..." {...form.register("label")} />
          <FieldError errors={[form.formState.errors.label]} />
        </Field>
        <Field data-invalid={!!form.formState.errors.line1}>
          <FieldLabel htmlFor="line1">Address line</FieldLabel>
          <Input id="line1" placeholder="House no., street" {...form.register("line1")} />
          <FieldError errors={[form.formState.errors.line1]} />
        </Field>
        <Field>
          <FieldLabel htmlFor="line2">Landmark (optional)</FieldLabel>
          <Input id="line2" {...form.register("line2")} />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field data-invalid={!!form.formState.errors.city}>
            <FieldLabel htmlFor="city">City</FieldLabel>
            <Input id="city" {...form.register("city")} />
            <FieldError errors={[form.formState.errors.city]} />
          </Field>
          <Field data-invalid={!!form.formState.errors.state}>
            <FieldLabel htmlFor="state">State</FieldLabel>
            <Input id="state" {...form.register("state")} />
            <FieldError errors={[form.formState.errors.state]} />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field data-invalid={!!form.formState.errors.country}>
            <FieldLabel htmlFor="country">Country</FieldLabel>
            <Input id="country" {...form.register("country")} />
            <FieldError errors={[form.formState.errors.country]} />
          </Field>
          <Field data-invalid={!!form.formState.errors.pincode}>
            <FieldLabel htmlFor="pincode">Pincode</FieldLabel>
            <Input id="pincode" {...form.register("pincode")} />
            <FieldError errors={[form.formState.errors.pincode]} />
          </Field>
        </div>
        <Field>
          <FieldLabel>Location</FieldLabel>
          <div className="flex flex-col gap-2 rounded-lg border p-3">
            <p className="text-sm text-muted-foreground">
              {lat && lng ? `${lat.toFixed(5)}, ${lng.toFixed(5)}` : "No location set yet"}
            </p>
            <LocationPickerDialog
              value={{ lat, lng }}
              triggerLabel={lat && lng ? "Change location" : "Pick location on map"}
              onConfirm={(result) => {
                form.setValue("lat", result.lat, { shouldValidate: true });
                form.setValue("lng", result.lng, { shouldValidate: true });
                form.setValue("line1", result.line1 || form.getValues("line1"), {
                  shouldValidate: true,
                });
                form.setValue("city", result.city || form.getValues("city"), {
                  shouldValidate: true,
                });
                form.setValue("state", result.state || form.getValues("state"), {
                  shouldValidate: true,
                });
                form.setValue("country", result.country || form.getValues("country"), {
                  shouldValidate: true,
                });
                form.setValue("pincode", result.pincode || form.getValues("pincode"), {
                  shouldValidate: true,
                });
              }}
            />
          </div>
          <FieldError errors={[form.formState.errors.lat, form.formState.errors.lng]} />
        </Field>
        <Field orientation="horizontal">
          <Controller
            control={form.control}
            name="isDefault"
            render={({ field }) => (
              <Checkbox
                id="isDefault"
                checked={field.value}
                onCheckedChange={(checked) => field.onChange(checked === true)}
              />
            )}
          />
          <FieldLabel htmlFor="isDefault" className="font-normal">
            Set as default address
          </FieldLabel>
        </Field>
        <Button type="submit" disabled={isPending} className="w-full">
          {isPending && <Loader2 className="size-4 animate-spin" />}
          {submitLabel}
        </Button>
      </FieldGroup>
    </form>
  );
}
