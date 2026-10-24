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
import { STORE_TYPE_META, type StoreType } from "@/types/store";

const STORE_TYPES = Object.keys(STORE_TYPE_META) as StoreType[];

/** Shop / restaurant / pharmacy picker for a new store. */
export function StoreTypeField({
  value,
  onChange,
}: {
  value: StoreType;
  onChange: (value: StoreType) => void;
}) {
  return (
    <Field>
      <FieldLabel htmlFor="storeType-retail">What kind of store is this?</FieldLabel>
      <RadioGroup
        value={value}
        onValueChange={(next) => onChange(next as StoreType)}
        className="grid grid-cols-1 gap-3 sm:grid-cols-3"
      >
        {STORE_TYPES.map((type) => (
          <FieldLabel key={type} htmlFor={`storeType-${type}`}>
            <Field
              orientation="horizontal"
              className={cn(
                "h-full rounded-lg border p-3 transition-colors",
                value === type ? "border-primary/40 bg-primary/5" : "border-input"
              )}
            >
              <RadioGroupItem value={type} id={`storeType-${type}`} />
              <FieldContent>
                <FieldTitle>{STORE_TYPE_META[type].label}</FieldTitle>
                <FieldDescription>{STORE_TYPE_META[type].description}</FieldDescription>
              </FieldContent>
            </Field>
          </FieldLabel>
        ))}
      </RadioGroup>
      <FieldDescription>This can&apos;t be changed after the store is created.</FieldDescription>
    </Field>
  );
}
