"use client";

import { Loader2 } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { LocationPickerDialog } from "@/components/shared/location-picker";
import { useCreateStore } from "../hooks";
import { STORE_VISIBILITY_OPTIONS, storeSchema, type StoreFormValues } from "../schemas";
import { STORE_TYPE_META, type Store } from "@/types/store";
import { StoreTypeField } from "./store-type-field";

interface StoreOnboardingFormProps {
  onSuccess?: (store: Store) => void;
}

/**
 * `POST /stores` form. Used both by `/seller/onboarding` (a seller's very
 * first store) and `/seller/stores/new` (an additional store) — sellers may
 * own more than one.
 */
export function StoreOnboardingForm({ onSuccess }: StoreOnboardingFormProps) {
  const createStore = useCreateStore();

  const form = useForm<StoreFormValues>({
    resolver: zodResolver(storeSchema),
    defaultValues: {
      name: "",
      description: "",
      storeType: "retail",
      businessType: "",
      gstNumber: "",
      licenseInfo: "",
      phone: "",
      email: "",
      addressLine: "",
      city: "",
      state: "",
      country: "India",
      pincode: "",
      lat: 12.9716,
      lng: 77.5946,
      visibilityType: "radius_10",
    },
  });

  const visibilityType = useWatch({ control: form.control, name: "visibilityType" });
  const storeType = useWatch({ control: form.control, name: "storeType" });
  const licenceLabel = STORE_TYPE_META[storeType].licenceLabel;
  const lat = useWatch({ control: form.control, name: "lat" });
  const lng = useWatch({ control: form.control, name: "lng" });

  function onSubmit(values: StoreFormValues) {
    createStore.mutate(
      {
        ...values,
        description: values.description || undefined,
        gstNumber: values.gstNumber || undefined,
        licenseInfo: values.licenseInfo || undefined,
      },
      { onSuccess }
    );
  }

  return (
    <form noValidate onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6">
      <FieldGroup>
        <StoreTypeField
          value={storeType}
          onChange={(value) => form.setValue("storeType", value, { shouldValidate: true })}
        />

        <Field data-invalid={!!form.formState.errors.name}>
          <FieldLabel htmlFor="name">Store name</FieldLabel>
          <Input id="name" placeholder="e.g. Fresh Mart" {...form.register("name")} />
          <FieldError errors={[form.formState.errors.name]} />
        </Field>

        <Field data-invalid={!!form.formState.errors.description}>
          <FieldLabel htmlFor="description">Description (optional)</FieldLabel>
          <Textarea
            id="description"
            placeholder="Tell shoppers what your store sells"
            {...form.register("description")}
          />
          <FieldError errors={[form.formState.errors.description]} />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field data-invalid={!!form.formState.errors.businessType}>
            <FieldLabel htmlFor="businessType">Business type</FieldLabel>
            <Input
              id="businessType"
              placeholder={
                storeType === "restaurant"
                  ? "e.g. South Indian, Bakery, Cloud kitchen"
                  : storeType === "pharmacy"
                    ? "e.g. Chemist, Medical store"
                    : "e.g. Grocery, Electronics"
              }
              {...form.register("businessType")}
            />
            <FieldError errors={[form.formState.errors.businessType]} />
          </Field>
          <Field data-invalid={!!form.formState.errors.visibilityType}>
            <FieldLabel htmlFor="visibilityType">Visibility</FieldLabel>
            <Select
              value={visibilityType}
              onValueChange={(value) =>
                form.setValue("visibilityType", value as StoreFormValues["visibilityType"], {
                  shouldValidate: true,
                })
              }
            >
              <SelectTrigger id="visibilityType" className="w-full">
                <SelectValue placeholder="Select visibility" />
              </SelectTrigger>
              <SelectContent>
                {STORE_VISIBILITY_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldError errors={[form.formState.errors.visibilityType]} />
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field data-invalid={!!form.formState.errors.gstNumber}>
            <FieldLabel htmlFor="gstNumber">GST number (optional)</FieldLabel>
            <Input id="gstNumber" {...form.register("gstNumber")} />
            <FieldError errors={[form.formState.errors.gstNumber]} />
          </Field>
          <Field data-invalid={!!form.formState.errors.licenseInfo}>
            <FieldLabel htmlFor="licenseInfo">{licenceLabel ?? "License info (optional)"}</FieldLabel>
            <Input id="licenseInfo" {...form.register("licenseInfo")} />
            <FieldError errors={[form.formState.errors.licenseInfo]} />
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field data-invalid={!!form.formState.errors.phone}>
            <FieldLabel htmlFor="phone">Phone</FieldLabel>
            <Input id="phone" type="tel" {...form.register("phone")} />
            <FieldError errors={[form.formState.errors.phone]} />
          </Field>
          <Field data-invalid={!!form.formState.errors.email}>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <Input id="email" type="email" {...form.register("email")} />
            <FieldError errors={[form.formState.errors.email]} />
          </Field>
        </div>

        <Field data-invalid={!!form.formState.errors.addressLine}>
          <FieldLabel htmlFor="addressLine">Address line</FieldLabel>
          <Input id="addressLine" {...form.register("addressLine")} />
          <FieldError errors={[form.formState.errors.addressLine]} />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
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

        <div className="grid gap-4 sm:grid-cols-2">
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
                form.setValue("addressLine", result.line1 || form.getValues("addressLine"), {
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

        <Button type="submit" disabled={createStore.isPending} className="w-full">
          {createStore.isPending && <Loader2 className="size-4 animate-spin" />}
          Create store
        </Button>
      </FieldGroup>
    </form>
  );
}
