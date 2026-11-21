"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { StoreOnboardingForm } from "@/features/seller/components/store-onboarding-form";
import type { AdminCreatedStore } from "@/types/admin";
import { useAdminCreateStore } from "../hooks";
import { storeSellerSchema, type StoreSellerFormValues } from "../schemas";

interface AdminStoreFormProps {
  onSuccess?: (store: AdminCreatedStore) => void;
}

/**
 * The seller's own add-store form, plus whose store it is. The store is
 * created approved and belongs to the seller with that email: they see it in
 * their seller dashboard as soon as they sign in with it.
 */
export function AdminStoreForm({ onSuccess }: AdminStoreFormProps) {
  const createStore = useAdminCreateStore();
  const sellerForm = useForm<StoreSellerFormValues>({
    resolver: zodResolver(storeSellerSchema),
    defaultValues: { sellerEmail: "", sellerName: "", sellerPhone: "" },
  });
  const errors = sellerForm.formState.errors;

  const header = (
    <FieldSet className="rounded-lg border p-4">
      <FieldLegend>Seller</FieldLegend>
      <FieldDescription>
        The real seller&apos;s email. When they sign in with Google using this email, the store and
        everything you add here will be in their seller dashboard, and they can manage it from then
        on. If they don&apos;t have a BODA account yet, one is created and they&apos;re emailed.
      </FieldDescription>

      <Field data-invalid={!!errors.sellerEmail}>
        <FieldLabel htmlFor="sellerEmail">Seller email</FieldLabel>
        <Input
          id="sellerEmail"
          type="email"
          autoComplete="off"
          placeholder="seller@example.com"
          {...sellerForm.register("sellerEmail")}
        />
        <FieldError errors={[errors.sellerEmail]} />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field data-invalid={!!errors.sellerName}>
          <FieldLabel htmlFor="sellerName">Seller name (optional)</FieldLabel>
          <Input id="sellerName" autoComplete="off" {...sellerForm.register("sellerName")} />
          <FieldError errors={[errors.sellerName]} />
        </Field>
        <Field data-invalid={!!errors.sellerPhone}>
          <FieldLabel htmlFor="sellerPhone">Seller phone (optional)</FieldLabel>
          <Input id="sellerPhone" type="tel" autoComplete="off" {...sellerForm.register("sellerPhone")} />
          <FieldError errors={[errors.sellerPhone]} />
        </Field>
      </div>
      <FieldDescription>Name and phone are only used if a new account is created.</FieldDescription>
    </FieldSet>
  );

  return (
    <StoreOnboardingForm
      header={header}
      validateExtra={() => sellerForm.trigger()}
      submitLabel="Create store for seller"
      isSubmitting={createStore.isPending}
      onSubmitStore={(payload) => {
        const seller = sellerForm.getValues();
        createStore.mutate(
          {
            ...payload,
            sellerEmail: seller.sellerEmail.trim(),
            sellerName: seller.sellerName?.trim() || undefined,
            sellerPhone: seller.sellerPhone?.trim() || undefined,
          },
          { onSuccess }
        );
      }}
    />
  );
}
