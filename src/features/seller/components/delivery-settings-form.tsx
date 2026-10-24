"use client";

import { Loader2 } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUpdateDeliverySettings } from "../hooks";
import {
  DELIVERY_MODE_OPTIONS,
  DELIVERY_SPEED_OPTIONS,
  deliverySettingsSchema,
  emptyToUndefined,
  type DeliverySettingsFormValues,
} from "../schemas";
import type { Store } from "@/types/store";

interface DeliverySettingsFormProps {
  store: Store;
}

/** `PUT /stores/me/store/delivery-settings` form. */
export function DeliverySettingsForm({ store }: DeliverySettingsFormProps) {
  const updateDeliverySettings = useUpdateDeliverySettings(store.id);
  const settings = store.deliverySettings;

  const form = useForm<DeliverySettingsFormValues>({
    resolver: zodResolver(deliverySettingsSchema),
    defaultValues: {
      mode: (settings?.mode as DeliverySettingsFormValues["mode"]) ?? "both",
      deliveryRadiusKm: settings?.deliveryRadiusKm ?? undefined,
      deliveryFee: settings?.deliveryFee ?? undefined,
      freeDeliveryThreshold: settings?.freeDeliveryThreshold ?? undefined,
      deliverySpeed: (settings?.deliverySpeed as DeliverySettingsFormValues["deliverySpeed"]) ?? "same_day",
      customWindowNote: "",
    },
  });

  const mode = useWatch({ control: form.control, name: "mode" });
  const deliverySpeed = useWatch({ control: form.control, name: "deliverySpeed" });
  const showDeliveryFields = mode !== "pickup_only";

  function onSubmit(values: DeliverySettingsFormValues) {
    updateDeliverySettings.mutate({
      ...values,
      customWindowNote: values.customWindowNote || undefined,
    });
  }

  return (
    <form noValidate onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <FieldGroup>
        <Field data-invalid={!!form.formState.errors.mode}>
          <FieldLabel htmlFor="delivery-mode">Mode</FieldLabel>
          <Select
            value={mode}
            onValueChange={(value) =>
              form.setValue("mode", value as DeliverySettingsFormValues["mode"], {
                shouldValidate: true,
              })
            }
          >
            <SelectTrigger id="delivery-mode" className="w-full">
              <SelectValue placeholder="Select mode" />
            </SelectTrigger>
            <SelectContent>
              {DELIVERY_MODE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FieldDescription>
            {mode === "pickup_only"
              ? "Every product in this store will be pickup only."
              : mode === "delivery"
                ? "Every product in this store will be delivery only."
                : "Each product can offer delivery, pickup, or both — set it when you add or edit the product."}
          </FieldDescription>
          <FieldError errors={[form.formState.errors.mode]} />
        </Field>

        {showDeliveryFields && (
          <div className="grid gap-4 sm:grid-cols-3">
            <Field data-invalid={!!form.formState.errors.deliveryRadiusKm}>
              <FieldLabel htmlFor="deliveryRadiusKm">Delivery radius (km)</FieldLabel>
              <Input
                id="deliveryRadiusKm"
                type="number"
                step="any"
                {...form.register("deliveryRadiusKm", { setValueAs: emptyToUndefined })}
              />
              <FieldError errors={[form.formState.errors.deliveryRadiusKm]} />
            </Field>
            <Field data-invalid={!!form.formState.errors.deliveryFee}>
              <FieldLabel htmlFor="deliveryFee">Delivery fee (₹)</FieldLabel>
              <Input
                id="deliveryFee"
                type="number"
                step="any"
                {...form.register("deliveryFee", { setValueAs: emptyToUndefined })}
              />
              <FieldError errors={[form.formState.errors.deliveryFee]} />
            </Field>
            <Field data-invalid={!!form.formState.errors.freeDeliveryThreshold}>
              <FieldLabel htmlFor="freeDeliveryThreshold">Free delivery over (₹)</FieldLabel>
              <Input
                id="freeDeliveryThreshold"
                type="number"
                step="any"
                {...form.register("freeDeliveryThreshold", { setValueAs: emptyToUndefined })}
              />
              <FieldError errors={[form.formState.errors.freeDeliveryThreshold]} />
            </Field>
          </div>
        )}

        <Field data-invalid={!!form.formState.errors.deliverySpeed}>
          <FieldLabel htmlFor="deliverySpeed">Delivery speed</FieldLabel>
          <Select
            value={deliverySpeed}
            onValueChange={(value) =>
              form.setValue("deliverySpeed", value as DeliverySettingsFormValues["deliverySpeed"], {
                shouldValidate: true,
              })
            }
          >
            <SelectTrigger id="deliverySpeed" className="w-full">
              <SelectValue placeholder="Select speed" />
            </SelectTrigger>
            <SelectContent>
              {DELIVERY_SPEED_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FieldError errors={[form.formState.errors.deliverySpeed]} />
        </Field>

        {deliverySpeed === "custom" && (
          <Field data-invalid={!!form.formState.errors.customWindowNote}>
            <FieldLabel htmlFor="customWindowNote">Custom window note</FieldLabel>
            <Input
              id="customWindowNote"
              placeholder="e.g. Delivered between 6-8pm on weekdays"
              {...form.register("customWindowNote")}
            />
            <FieldError errors={[form.formState.errors.customWindowNote]} />
          </Field>
        )}

        <Button type="submit" disabled={updateDeliverySettings.isPending} className="w-fit">
          {updateDeliverySettings.isPending && <Loader2 className="size-4 animate-spin" />}
          Save delivery settings
        </Button>
      </FieldGroup>
    </form>
  );
}
