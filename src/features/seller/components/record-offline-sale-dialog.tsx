"use client";

import { useEffect } from "react";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm, useWatch } from "react-hook-form";

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
import { useCreatePosSale, useSellerProducts } from "../hooks";
import { posSaleSchema, type PosSaleFormValues } from "../schemas";
import type { Product } from "@/types/product";

const OVERALL_STOCK_VALUE = "__overall__";

function emptyItem(): PosSaleFormValues["items"][number] {
  return { productId: "", variantId: undefined, quantity: 1 };
}

function lineTotal(product: Product | undefined, variantId: string | undefined, quantity: number) {
  if (!product || !quantity) return 0;
  const variant = product.variants?.find((v) => v.id === variantId);
  const unitPrice = (product.discountPrice ?? product.price) + (variant?.priceDelta ?? 0);
  return unitPrice * quantity;
}

interface RecordOfflineSaleDialogProps {
  storeId: string | undefined;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Records a sale that happened in person at the store — a walk-in customer
 * who paid cash at the counter, not through the app. Creates a real order
 * (already delivered/paid) so it decrements stock, counts toward revenue,
 * and gets a normal PDF invoice, same as any online order.
 */
export function RecordOfflineSaleDialog({ storeId, open, onOpenChange }: RecordOfflineSaleDialogProps) {
  const productsQuery = useSellerProducts(storeId, { status: "active", limit: 100 });
  const products = productsQuery.data?.data ?? [];
  const createPosSale = useCreatePosSale(storeId);

  const form = useForm<PosSaleFormValues>({
    resolver: zodResolver(posSaleSchema),
    defaultValues: { items: [emptyItem()], guestName: "", guestPhone: "", note: "" },
  });

  const { fields, append, remove } = useFieldArray({ control: form.control, name: "items" });
  const items = useWatch({ control: form.control, name: "items" });

  useEffect(() => {
    if (open) {
      form.reset({ items: [emptyItem()], guestName: "", guestPhone: "", note: "" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const total = (items ?? []).reduce((sum, item) => {
    const product = products.find((p) => p.id === item.productId);
    return sum + lineTotal(product, item.variantId, item.quantity || 0);
  }, 0);

  function onSubmit(values: PosSaleFormValues) {
    createPosSale.mutate(
      {
        items: values.items.map((item) => ({
          productId: item.productId,
          variantId: item.variantId,
          quantity: item.quantity,
        })),
        guestName: values.guestName || undefined,
        guestPhone: values.guestPhone || undefined,
        note: values.note || undefined,
      },
      { onSuccess: () => onOpenChange(false) }
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Record an offline sale</DialogTitle>
          <DialogDescription>
            For a sale made in person at your store. This deducts stock and creates a receipt, just
            like an online order.
          </DialogDescription>
        </DialogHeader>
        <form noValidate onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <FieldGroup>
            <div className="flex flex-col gap-3">
              {fields.map((field, index) => {
                const rowProductId = items?.[index]?.productId;
                const product = products.find((p) => p.id === rowProductId);
                const hasVariants = (product?.variants?.length ?? 0) > 0;

                return (
                  <div key={field.id} className="flex flex-col gap-2 rounded-lg border border-border p-3">
                    <div className="flex items-start gap-2">
                      <Field className="flex-1" data-invalid={!!form.formState.errors.items?.[index]?.productId}>
                        <FieldLabel>Product</FieldLabel>
                        <Select
                          value={rowProductId || undefined}
                          onValueChange={(value) => {
                            form.setValue(`items.${index}.productId`, value, { shouldValidate: true });
                            form.setValue(`items.${index}.variantId`, undefined);
                          }}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select a product" />
                          </SelectTrigger>
                          <SelectContent>
                            {products.map((p) => (
                              <SelectItem key={p.id} value={p.id}>
                                {p.name} — ₹{(p.discountPrice ?? p.price).toFixed(2)} ({p.stockQuantity} in stock)
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FieldError errors={[form.formState.errors.items?.[index]?.productId]} />
                      </Field>
                      {fields.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="mt-6 text-destructive"
                          onClick={() => remove(index)}
                        >
                          <Trash2 className="size-4" />
                          <span className="sr-only">Remove item</span>
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      {hasVariants && (
                        <Field>
                          <FieldLabel>Variant</FieldLabel>
                          <Select
                            value={items?.[index]?.variantId ?? OVERALL_STOCK_VALUE}
                            onValueChange={(value) =>
                              form.setValue(
                                `items.${index}.variantId`,
                                value === OVERALL_STOCK_VALUE ? undefined : value
                              )
                            }
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value={OVERALL_STOCK_VALUE}>Base product</SelectItem>
                              {product?.variants?.map((variant) => (
                                <SelectItem key={variant.id} value={variant.id}>
                                  {variant.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </Field>
                      )}
                      <Field
                        className={hasVariants ? "" : "col-span-2"}
                        data-invalid={!!form.formState.errors.items?.[index]?.quantity}
                      >
                        <FieldLabel>Quantity</FieldLabel>
                        <Input
                          type="number"
                          min={1}
                          {...form.register(`items.${index}.quantity`, { valueAsNumber: true })}
                        />
                        <FieldError errors={[form.formState.errors.items?.[index]?.quantity]} />
                      </Field>
                    </div>
                  </div>
                );
              })}
            </div>

            <Button type="button" variant="outline" size="sm" className="w-fit" onClick={() => append(emptyItem())}>
              <Plus className="size-4" />
              Add another item
            </Button>

            <div className="grid gap-3 sm:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="pos-guest-name">Customer name (optional)</FieldLabel>
                <Input id="pos-guest-name" {...form.register("guestName")} />
              </Field>
              <Field>
                <FieldLabel htmlFor="pos-guest-phone">Customer phone (optional)</FieldLabel>
                <Input id="pos-guest-phone" type="tel" {...form.register("guestPhone")} />
              </Field>
            </div>

            <div className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2">
              <span className="text-sm font-medium text-muted-foreground">Total</span>
              <span className="text-lg font-semibold text-foreground">₹{total.toFixed(2)}</span>
            </div>
          </FieldGroup>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createPosSale.isPending}>
              {createPosSale.isPending && <Loader2 className="size-4 animate-spin" />}
              Record sale
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
