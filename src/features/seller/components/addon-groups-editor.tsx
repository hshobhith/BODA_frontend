"use client";

import { Plus, Trash2 } from "lucide-react";
import { useFieldArray, useWatch, type UseFormReturn } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import type { ProductFormValues } from "../schemas";

interface AddonGroupsEditorProps {
  form: UseFormReturn<ProductFormValues>;
}

/**
 * Restaurant add-ons: groups like "Extras" (pick up to 3) or "Spice level"
 * (pick exactly 1), each with priced options the customer chooses on the
 * product page.
 */
export function AddonGroupsEditor({ form }: AddonGroupsEditorProps) {
  const { fields, append, remove } = useFieldArray({ control: form.control, name: "addonGroups" });

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <span className="text-sm font-medium text-foreground">Add-ons &amp; choices (optional)</span>
          <p className="text-xs text-muted-foreground">
            e.g. &quot;Extras&quot; with cheese +₹20, or a required &quot;Spice level&quot; (min 1, max 1).
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() =>
            append({
              name: "",
              minSelect: 0,
              maxSelect: 1,
              options: [{ name: "", price: 0, isAvailable: true }],
            })
          }
        >
          <Plus className="size-4" />
          Add group
        </Button>
      </div>
      {fields.map((field, index) => (
        <AddonGroupRow key={field.id} form={form} index={index} onRemove={() => remove(index)} />
      ))}
    </div>
  );
}

function AddonGroupRow({
  form,
  index,
  onRemove,
}: {
  form: UseFormReturn<ProductFormValues>;
  index: number;
  onRemove: () => void;
}) {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: `addonGroups.${index}.options`,
  });
  const options = useWatch({ control: form.control, name: `addonGroups.${index}.options` });
  const errors = form.formState.errors.addonGroups?.[index];

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border p-3">
      <div className="grid gap-3 sm:grid-cols-[2fr_1fr_1fr_auto] sm:items-end">
        <Field data-invalid={!!errors?.name}>
          <FieldLabel htmlFor={`addon-group-name-${index}`} className="text-xs">
            Group name
          </FieldLabel>
          <Input
            id={`addon-group-name-${index}`}
            placeholder="e.g. Extras"
            {...form.register(`addonGroups.${index}.name`)}
          />
          <FieldError errors={[errors?.name]} />
        </Field>
        <Field data-invalid={!!errors?.minSelect}>
          <FieldLabel htmlFor={`addon-group-min-${index}`} className="text-xs">
            Min choices
          </FieldLabel>
          <Input
            id={`addon-group-min-${index}`}
            type="number"
            min={0}
            {...form.register(`addonGroups.${index}.minSelect`, { valueAsNumber: true })}
          />
          <FieldError errors={[errors?.minSelect]} />
        </Field>
        <Field data-invalid={!!errors?.maxSelect}>
          <FieldLabel htmlFor={`addon-group-max-${index}`} className="text-xs">
            Max choices
          </FieldLabel>
          <Input
            id={`addon-group-max-${index}`}
            type="number"
            min={1}
            {...form.register(`addonGroups.${index}.maxSelect`, { valueAsNumber: true })}
          />
          <FieldError errors={[errors?.maxSelect]} />
        </Field>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="text-destructive hover:text-destructive"
          onClick={onRemove}
          aria-label="Remove add-on group"
        >
          <Trash2 className="size-4" />
        </Button>
      </div>

      <div className="flex flex-col gap-2 border-l-2 border-border pl-3">
        {fields.map((field, optionIndex) => {
          const optionErrors = errors?.options?.[optionIndex];
          const isAvailable = options?.[optionIndex]?.isAvailable ?? true;
          return (
            <div
              key={field.id}
              className="grid gap-2 sm:grid-cols-[2fr_1fr_auto_auto] sm:items-end"
            >
              <Field data-invalid={!!optionErrors?.name}>
                <FieldLabel htmlFor={`addon-${index}-${optionIndex}-name`} className="text-xs">
                  Option
                </FieldLabel>
                <Input
                  id={`addon-${index}-${optionIndex}-name`}
                  placeholder="e.g. Extra cheese"
                  {...form.register(`addonGroups.${index}.options.${optionIndex}.name`)}
                />
                <FieldError errors={[optionErrors?.name]} />
              </Field>
              <Field data-invalid={!!optionErrors?.price}>
                <FieldLabel htmlFor={`addon-${index}-${optionIndex}-price`} className="text-xs">
                  Extra price (₹)
                </FieldLabel>
                <Input
                  id={`addon-${index}-${optionIndex}-price`}
                  type="number"
                  step="any"
                  min={0}
                  {...form.register(`addonGroups.${index}.options.${optionIndex}.price`, {
                    valueAsNumber: true,
                  })}
                />
                <FieldError errors={[optionErrors?.price]} />
              </Field>
              <Field orientation="horizontal" className="w-fit gap-2 pb-2">
                <Switch
                  id={`addon-${index}-${optionIndex}-available`}
                  checked={isAvailable}
                  onCheckedChange={(checked) =>
                    form.setValue(`addonGroups.${index}.options.${optionIndex}.isAvailable`, checked)
                  }
                />
                <FieldLabel
                  htmlFor={`addon-${index}-${optionIndex}-available`}
                  className="text-xs font-normal"
                >
                  Available
                </FieldLabel>
              </Field>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="text-destructive hover:text-destructive"
                onClick={() => remove(optionIndex)}
                disabled={fields.length === 1}
                aria-label="Remove option"
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          );
        })}
        <FieldError errors={[errors?.options?.root ?? errors?.options]} />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="w-fit"
          onClick={() => append({ name: "", price: 0, isAvailable: true })}
        >
          <Plus className="size-4" />
          Add option
        </Button>
      </div>
    </div>
  );
}
