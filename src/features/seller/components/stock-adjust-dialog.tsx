"use client";

import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Product } from "@/types/product";
import { useAdjustStock } from "../hooks";
import { stockAdjustSchema, type StockAdjustFormValues } from "../schemas";

const OVERALL_STOCK_VALUE = "__overall__";

interface StockAdjustDialogProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/** Quick modal for `PATCH /products/:id/adjust-stock`. */
export function StockAdjustDialog({ product, open, onOpenChange }: StockAdjustDialogProps) {
  const adjustStock = useAdjustStock();

  const form = useForm<StockAdjustFormValues>({
    resolver: zodResolver(stockAdjustSchema),
    defaultValues: { variantId: undefined, changeQty: 0, reason: "" },
  });

  useEffect(() => {
    if (open) {
      form.reset({ variantId: undefined, changeQty: 0, reason: "" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, product?.id]);

  const variantId = useWatch({ control: form.control, name: "variantId" });

  if (!product) return null;

  const hasVariants = (product.variants?.length ?? 0) > 0;

  function onSubmit(values: StockAdjustFormValues) {
    if (!product) return;
    adjustStock.mutate(
      {
        id: product.id,
        payload: {
          variantId: values.variantId,
          changeQty: values.changeQty,
          reason: values.reason,
        },
      },
      { onSuccess: () => onOpenChange(false) }
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adjust stock</DialogTitle>
          <DialogDescription>
            {product.name} — current stock: {product.stockQuantity}
          </DialogDescription>
        </DialogHeader>
        <form noValidate onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <FieldGroup>
            {hasVariants && (
              <Field>
                <FieldLabel htmlFor="adjust-variant">Variant</FieldLabel>
                <Select
                  value={variantId ?? OVERALL_STOCK_VALUE}
                  onValueChange={(value) =>
                    form.setValue(
                      "variantId",
                      value === OVERALL_STOCK_VALUE ? undefined : value
                    )
                  }
                >
                  <SelectTrigger id="adjust-variant" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={OVERALL_STOCK_VALUE}>Overall product stock</SelectItem>
                    {product.variants?.map((variant) => (
                      <SelectItem key={variant.id} value={variant.id}>
                        {variant.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            )}
            <Field data-invalid={!!form.formState.errors.changeQty}>
              <FieldLabel htmlFor="adjust-changeQty">
                Change quantity (negative to remove stock)
              </FieldLabel>
              <Input
                id="adjust-changeQty"
                type="number"
                {...form.register("changeQty", { valueAsNumber: true })}
              />
              <FieldError errors={[form.formState.errors.changeQty]} />
            </Field>
            <Field data-invalid={!!form.formState.errors.reason}>
              <FieldLabel htmlFor="adjust-reason">Reason</FieldLabel>
              <Input
                id="adjust-reason"
                placeholder="e.g. Damaged stock, recount, restock"
                {...form.register("reason")}
              />
              <FieldError errors={[form.formState.errors.reason]} />
            </Field>
          </FieldGroup>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={adjustStock.isPending}>
              {adjustStock.isPending && <Loader2 className="size-4 animate-spin" />}
              Save adjustment
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
