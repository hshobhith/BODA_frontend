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
import type { UpdateStorePayload } from "../api";
import { useUpdateStore } from "../hooks";
import { STORE_VISIBILITY_OPTIONS, storeSchema, type StoreFormValues } from "../schemas";
import { STORE_TYPE_META, type Store } from "@/types/store";
import { ImageUploader } from "./image-uploader";

interface StoreSettingsFormProps {
  store: Store;
}

/** `PATCH /stores/me/store` form for editing an existing store's basic info. */
export function StoreSettingsForm({ store }: StoreSettingsFormProps) {
  const updateStore = useUpdateStore(store.id);

  const form = useForm<StoreFormValues>({
    resolver: zodResolver(storeSchema),
    defaultValues: {
      name: store.name,
      logoUrl: store.logoUrl ?? "",
      bannerUrl: store.bannerUrl ?? "",
      description: store.description ?? "",
      storeType: store.storeType ?? "retail",
      businessType: store.businessType ?? "",
      gstNumber: store.gstNumber ?? "",
      licenseInfo: store.licenseInfo ?? "",
      phone: store.phone ?? "",
      email: store.email ?? "",
      addressLine: store.addressLine ?? "",
      city: store.city ?? "",
      state: store.state ?? "",
      country: store.country ?? "India",
      pincode: store.pincode ?? "",
      lat: store.lat ?? 12.9716,
      lng: store.lng ?? 77.5946,
      visibilityType: (store.visibilityType as StoreFormValues["visibilityType"]) ?? "radius_10",
    },
  });

  const visibilityType = useWatch({ control: form.control, name: "visibilityType" });
  const logoUrl = useWatch({ control: form.control, name: "logoUrl" });
  const bannerUrl = useWatch({ control: form.control, name: "bannerUrl" });
  const lat = useWatch({ control: form.control, name: "lat" });
  const lng = useWatch({ control: form.control, name: "lng" });

  const storeTypeMeta = STORE_TYPE_META[store.storeType ?? "retail"];

  function onSubmit(values: StoreFormValues) {
    const payload: UpdateStorePayload & { storeType?: unknown } = {
      ...values,
      logoUrl: values.logoUrl || undefined,
      bannerUrl: values.bannerUrl || undefined,
      description: values.description || undefined,
      gstNumber: values.gstNumber || undefined,
      licenseInfo: values.licenseInfo || undefined,
    };
    // storeType is only in the form for the licence rule; the API rejects it on update.
    delete payload.storeType;
    updateStore.mutate(payload);
  }

  return (
    <form noValidate onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6">
      <FieldGroup>
        <p className="text-sm text-muted-foreground">
          Store type: <span className="font-medium text-foreground">{storeTypeMeta.label}</span>
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <ImageUploader
            value={logoUrl ? [logoUrl] : []}
            onChange={(urls) => form.setValue("logoUrl", urls[0] ?? "", { shouldDirty: true })}
            multiple={false}
            folder="stores"
            label="Store logo"
          />
          <ImageUploader
            value={bannerUrl ? [bannerUrl] : []}
            onChange={(urls) => form.setValue("bannerUrl", urls[0] ?? "", { shouldDirty: true })}
            multiple={false}
            folder="stores"
            label="Store banner"
          />
        </div>

        <Field data-invalid={!!form.formState.errors.name}>
          <FieldLabel htmlFor="settings-name">Store name</FieldLabel>
          <Input id="settings-name" {...form.register("name")} />
          <FieldError errors={[form.formState.errors.name]} />
        </Field>

        <Field data-invalid={!!form.formState.errors.description}>
          <FieldLabel htmlFor="settings-description">Description</FieldLabel>
          <Textarea id="settings-description" {...form.register("description")} />
          <FieldError errors={[form.formState.errors.description]} />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field data-invalid={!!form.formState.errors.businessType}>
            <FieldLabel htmlFor="settings-businessType">Business type</FieldLabel>
            <Input id="settings-businessType" {...form.register("businessType")} />
            <FieldError errors={[form.formState.errors.businessType]} />
          </Field>
          <Field data-invalid={!!form.formState.errors.visibilityType}>
            <FieldLabel htmlFor="settings-visibilityType">Visibility</FieldLabel>
            <Select
              value={visibilityType}
              onValueChange={(value) =>
                form.setValue("visibilityType", value as StoreFormValues["visibilityType"], {
                  shouldValidate: true,
                })
              }
            >
              <SelectTrigger id="settings-visibilityType" className="w-full">
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
            <FieldLabel htmlFor="settings-gstNumber">GST number (optional)</FieldLabel>
            <Input id="settings-gstNumber" {...form.register("gstNumber")} />
            <FieldError errors={[form.formState.errors.gstNumber]} />
          </Field>
          <Field data-invalid={!!form.formState.errors.licenseInfo}>
            <FieldLabel htmlFor="settings-licenseInfo">
              {storeTypeMeta.licenceLabel ?? "License info (optional)"}
            </FieldLabel>
            <Input id="settings-licenseInfo" {...form.register("licenseInfo")} />
            <FieldError errors={[form.formState.errors.licenseInfo]} />
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field data-invalid={!!form.formState.errors.phone}>
            <FieldLabel htmlFor="settings-phone">Phone</FieldLabel>
            <Input id="settings-phone" type="tel" {...form.register("phone")} />
            <FieldError errors={[form.formState.errors.phone]} />
          </Field>
          <Field data-invalid={!!form.formState.errors.email}>
            <FieldLabel htmlFor="settings-email">Email</FieldLabel>
            <Input id="settings-email" type="email" {...form.register("email")} />
            <FieldError errors={[form.formState.errors.email]} />
          </Field>
        </div>

        <Field data-invalid={!!form.formState.errors.addressLine}>
          <FieldLabel htmlFor="settings-addressLine">Address line</FieldLabel>
          <Input id="settings-addressLine" {...form.register("addressLine")} />
          <FieldError errors={[form.formState.errors.addressLine]} />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field data-invalid={!!form.formState.errors.city}>
            <FieldLabel htmlFor="settings-city">City</FieldLabel>
            <Input id="settings-city" {...form.register("city")} />
            <FieldError errors={[form.formState.errors.city]} />
          </Field>
          <Field data-invalid={!!form.formState.errors.state}>
            <FieldLabel htmlFor="settings-state">State</FieldLabel>
            <Input id="settings-state" {...form.register("state")} />
            <FieldError errors={[form.formState.errors.state]} />
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field data-invalid={!!form.formState.errors.country}>
            <FieldLabel htmlFor="settings-country">Country</FieldLabel>
            <Input id="settings-country" {...form.register("country")} />
            <FieldError errors={[form.formState.errors.country]} />
          </Field>
          <Field data-invalid={!!form.formState.errors.pincode}>
            <FieldLabel htmlFor="settings-pincode">Pincode</FieldLabel>
            <Input id="settings-pincode" {...form.register("pincode")} />
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
              triggerLabel="Change location"
              onConfirm={(result) => {
                form.setValue("lat", result.lat, { shouldValidate: true, shouldDirty: true });
                form.setValue("lng", result.lng, { shouldValidate: true, shouldDirty: true });
              }}
            />
          </div>
          <FieldError errors={[form.formState.errors.lat, form.formState.errors.lng]} />
        </Field>

        <Button type="submit" disabled={updateStore.isPending} className="w-fit">
          {updateStore.isPending && <Loader2 className="size-4 animate-spin" />}
          Save changes
        </Button>
      </FieldGroup>
    </form>
  );
}
