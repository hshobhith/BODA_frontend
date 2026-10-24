"use client";

import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
  FieldTitle,
} from "@/components/ui/field";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import type { UserRole } from "@/types/auth";

export type AccountType = Extract<UserRole, "customer" | "seller">;

const ACCOUNT_TYPE_OPTIONS = [
  {
    value: "customer",
    title: "I'm a Customer",
    description: "Shop from local stores near you.",
  },
  {
    value: "seller",
    title: "I'm a Seller",
    description: "List products and sell to local customers.",
  },
] as const;

/** Customer/seller picker shared by the sign-up forms. */
export function AccountTypeField({
  value,
  onChange,
  invalid,
}: {
  value: AccountType;
  onChange: (value: AccountType) => void;
  invalid?: boolean;
}) {
  return (
    <Field data-invalid={invalid}>
      <FieldLabel htmlFor="role-customer" className="sr-only">
        Account type
      </FieldLabel>
      <RadioGroup
        value={value}
        onValueChange={(next) => onChange(next as AccountType)}
        className="grid grid-cols-1 gap-3 sm:grid-cols-2"
      >
        {ACCOUNT_TYPE_OPTIONS.map((option) => (
          <FieldLabel key={option.value} htmlFor={`role-${option.value}`}>
            <Field
              orientation="horizontal"
              className={cn(
                "rounded-lg border p-3 transition-colors",
                value === option.value ? "border-primary/40 bg-primary/5" : "border-input"
              )}
            >
              <RadioGroupItem value={option.value} id={`role-${option.value}`} />
              <FieldContent>
                <FieldTitle>{option.title}</FieldTitle>
                <FieldDescription>{option.description}</FieldDescription>
              </FieldContent>
            </Field>
          </FieldLabel>
        ))}
      </RadioGroup>
    </Field>
  );
}
