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
import { useCreateStore } from "../hooks";
import { STORE_VISIBILITY_OPTIONS, storeSchema, type StoreFormValues } from "../schemas";
import { STORE_TYPE_META, type Store } from "@/types/store";
import { StoreLocationSection, useStoreLocation } from "./store-location-section";
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
      // lat/lng start unset: the seller places the store in the location step.
      visibilityType: "radius_10",
    },
  });
  const location = useStoreLocation(form);

  const visibilityType = useWatch({ control: form.control, name: "visibilityType" });
  const storeType = useWatch({ control: form.control, name: "storeType" });
  const licenceLabel = STORE_TYPE_META[storeType].licenceLabel;

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
    <form
      noValidate
      onSubmit={async (event) => {
        event.preventDefault();
        // Match the pin to a just-typed address before validating and saving.
        await location.flush();
        await form.handleSubmit(onSubmit)();
      }}
      className="flex flex-col gap-6"
    >
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

        <StoreLocationSection form={form} location={location} />

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

        <Button type="submit" disabled={createStore.isPending} className="w-full">
          {createStore.isPending && <Loader2 className="size-4 animate-spin" />}
          Create store
        </Button>
      </FieldGroup>
    </form>
  );
}
