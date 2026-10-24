"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import type { ProductAddonGroup } from "@/types/product";
import type { AddonSelection } from "../availability";

interface AddonSelectorProps {
  groups: ProductAddonGroup[];
  value: AddonSelection;
  onChange: (value: AddonSelection) => void;
}

function groupHint(group: ProductAddonGroup): string {
  if (group.minSelect > 0 && group.minSelect === group.maxSelect) {
    return `Required · choose ${group.minSelect}`;
  }
  if (group.minSelect > 0) {
    return `Required · choose ${group.minSelect}–${group.maxSelect}`;
  }
  return group.maxSelect === 1 ? "Optional" : `Optional · up to ${group.maxSelect}`;
}

function priceLabel(price: number): string {
  return price > 0 ? `+₹${price.toLocaleString()}` : "Free";
}

/** Customer-facing add-on picker: radios for pick-one groups, checkboxes otherwise. */
export function AddonSelector({ groups, value, onChange }: AddonSelectorProps) {
  return (
    <div className="flex flex-col gap-4">
      {groups.map((group) => {
        const selected = value[group.id] ?? [];
        const isSingle = group.maxSelect === 1;
        const atLimit = selected.length >= group.maxSelect;

        return (
          <fieldset key={group.id} className="flex flex-col gap-2 rounded-lg border border-border p-3">
            <legend className="px-1 text-sm font-medium text-foreground">
              {group.name}{" "}
              <span className="text-xs font-normal text-muted-foreground">{groupHint(group)}</span>
            </legend>

            {isSingle ? (
              <RadioGroup
                value={selected[0] ?? ""}
                onValueChange={(optionId) => onChange({ ...value, [group.id]: [optionId] })}
                className="gap-2"
              >
                {group.options.map((option) => {
                  const id = `addon-${group.id}-${option.id}`;
                  return (
                    <div key={option.id} className="flex items-center gap-2">
                      <RadioGroupItem id={id} value={option.id} disabled={!option.isAvailable} />
                      <Label htmlFor={id} className="flex-1 font-normal">
                        {option.name}
                        {!option.isAvailable && (
                          <span className="text-xs text-muted-foreground"> (unavailable)</span>
                        )}
                      </Label>
                      <span className="text-sm text-muted-foreground">{priceLabel(option.price)}</span>
                    </div>
                  );
                })}
              </RadioGroup>
            ) : (
              group.options.map((option) => {
                const id = `addon-${group.id}-${option.id}`;
                const checked = selected.includes(option.id);
                return (
                  <div key={option.id} className="flex items-center gap-2">
                    <Checkbox
                      id={id}
                      checked={checked}
                      disabled={!option.isAvailable || (!checked && atLimit)}
                      onCheckedChange={(next) =>
                        onChange({
                          ...value,
                          [group.id]: next
                            ? [...selected, option.id]
                            : selected.filter((optionId) => optionId !== option.id),
                        })
                      }
                    />
                    <Label htmlFor={id} className="flex-1 font-normal">
                      {option.name}
                      {!option.isAvailable && (
                        <span className="text-xs text-muted-foreground"> (unavailable)</span>
                      )}
                    </Label>
                    <span className="text-sm text-muted-foreground">{priceLabel(option.price)}</span>
                  </div>
                );
              })
            )}
          </fieldset>
        );
      })}
    </div>
  );
}
