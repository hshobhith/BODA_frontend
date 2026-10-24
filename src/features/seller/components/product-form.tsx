"use client";

import { useRef, useState } from "react";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm, useWatch } from "react-hook-form";

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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useCategoryTree } from "@/features/categories/hooks";
import { effectiveDeliveryType } from "@/features/products/delivery";
import type { Product } from "@/types/product";
import type { StoreDeliveryMode, StoreType } from "@/types/store";
import type { BarcodeLookupResult } from "../api";
import { useCreateProduct, useUpdateProduct } from "../hooks";
import {
  emptyToUndefined,
  FOOD_TYPE_OPTIONS,
  PRODUCT_DELIVERY_TYPE_OPTIONS,
  productSchema,
  type ProductFormValues,
} from "../schemas";
import { flattenCategories } from "../utils";
import { AddonGroupsEditor } from "./addon-groups-editor";
import { BarcodeLookupPanel } from "./barcode-lookup-panel";
import { ImageUploader } from "./image-uploader";

interface ProductFormProps {
  storeId: string;
  /** Picks which type-specific sections (restaurant / pharmacy) to show. */
  storeType?: StoreType;
  /** The store's delivery setting; a single-method store fixes every product's delivery type. */
  storeDeliveryMode?: StoreDeliveryMode | null;
  /** Present when editing; omitted when creating a new product. */
  product?: Product;
  /** Creating only: open the barcode camera straight away. */
  autoScan?: boolean;
  onSuccess?: (product: Product) => void;
}

const NO_FOOD_TYPE = "unspecified";

/** Fields a barcode lookup can fill in, and what "empty" is for each. */
const LOOKUP_FIELD_EMPTY = {
  name: "",
  brand: "",
  description: "",
  categoryId: "",
  weight: undefined,
  tags: "",
  composition: "",
  requiresPrescription: false,
} as const;
type LookupField = keyof typeof LOOKUP_FIELD_EMPTY;

/** Full create/edit form for a seller's product, including images and variants. */
export function ProductForm({
  storeId,
  storeType = "retail",
  storeDeliveryMode,
  product,
  autoScan = false,
  onSuccess,
}: ProductFormProps) {
  const isEditing = Boolean(product);
  const isRestaurant = storeType === "restaurant";
  const isPharmacy = storeType === "pharmacy";
  const { data: categoryTree } = useCategoryTree();
  const categoryOptions = flattenCategories(categoryTree ?? []);
  const createProduct = useCreateProduct(storeId);
  const updateProduct = useUpdateProduct();
  const isPending = createProduct.isPending || updateProduct.isPending;

  const [images, setImages] = useState<string[]>(
    () => product?.images?.slice().sort((a, b) => a.sortOrder - b.sortOrder).map((img) => img.url) ?? []
  );

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: product?.name ?? "",
      description: product?.description ?? "",
      categoryId: product?.category?.id ?? "",
      sku: product?.sku ?? "",
      barcode: product?.barcode ?? "",
      brand: product?.brand ?? "",
      price: product?.price ?? 0,
      discountPrice: product?.discountPrice ?? undefined,
      stockQuantity: product?.stockQuantity ?? 0,
      lowStockThreshold: undefined,
      // Dishes are made to order, so restaurants start without stock counting.
      trackInventory: product?.trackInventory ?? !isRestaurant,
      isAvailable: product?.isAvailable ?? true,
      weight: product?.weight ?? undefined,
      deliveryType: (product?.deliveryType as ProductFormValues["deliveryType"]) ?? undefined,
      returnPolicy: product?.returnPolicy ?? "",
      tags: product?.tags?.join(", ") ?? "",
      variants:
        product?.variants?.map((v) => ({
          name: v.name,
          sku: v.sku ?? "",
          priceDelta: v.priceDelta,
          stockQuantity: v.stockQuantity,
        })) ?? [],
      foodType: product?.foodType ?? undefined,
      preparationTimeMins: product?.preparationTimeMins ?? undefined,
      addonGroups:
        product?.addonGroups?.map((group) => ({
          groupId: group.id,
          name: group.name,
          minSelect: group.minSelect,
          maxSelect: group.maxSelect,
          options: group.options.map((option) => ({
            optionId: option.id,
            name: option.name,
            price: option.price,
            isAvailable: option.isAvailable,
          })),
        })) ?? [],
      requiresPrescription: product?.requiresPrescription ?? false,
      composition: product?.composition ?? "",
      expiryDate: product?.expiryDate ?? "",
    },
  });

  const { fields, append, remove } = useFieldArray({ control: form.control, name: "variants" });
  const deliveryType = useWatch({ control: form.control, name: "deliveryType" });
  // Pickup-only / delivery-only stores decide for every product. The product's
  // own saved choice is kept untouched and applies again if the store offers both.
  const storeFixesDelivery = storeDeliveryMode === "pickup_only" || storeDeliveryMode === "delivery";
  const categoryId = useWatch({ control: form.control, name: "categoryId" });
  const trackInventory = useWatch({ control: form.control, name: "trackInventory" });
  const isAvailable = useWatch({ control: form.control, name: "isAvailable" });
  const foodType = useWatch({ control: form.control, name: "foodType" });
  const requiresPrescription = useWatch({ control: form.control, name: "requiresPrescription" });

  // What the last barcode lookup filled in, so the next scan can replace it
  // without wiping anything the seller has since typed themselves.
  const lookupFilled = useRef<{ fields: Partial<Record<LookupField, unknown>>; images: string[] }>({
    fields: {},
    images: [],
  });

  /** Pre-fill from a barcode lookup. Price, stock and anything not found are left to the seller. */
  function applyBarcodeLookup(result: BarcodeLookupResult) {
    const options = { shouldDirty: true, shouldValidate: true } as const;
    const previous = lookupFilled.current;
    for (const [field, value] of Object.entries(previous.fields) as [LookupField, unknown][]) {
      if (form.getValues(field) === value) form.setValue(field, LOOKUP_FIELD_EMPTY[field], options);
    }
    const previousImages = previous.images;
    setImages((current) =>
      previousImages.length > 0 && current.join() === previousImages.join() ? [] : current
    );

    form.setValue("barcode", result.barcode, options);
    const suggestion = result.suggestion;
    const filled: Partial<Record<LookupField, unknown>> = {};
    const fill = <F extends LookupField>(field: F, value: ProductFormValues[F] | null | undefined) => {
      if (value === null || value === undefined || value === "") return;
      form.setValue(field, value as never, options);
      filled[field] = value;
    };
    if (suggestion) {
      fill("name", suggestion.name);
      fill("brand", suggestion.brand);
      fill("description", suggestion.description);
      fill("categoryId", suggestion.categoryId);
      fill("weight", suggestion.weight);
      fill("tags", suggestion.tags.join(", "));
      if (isPharmacy) {
        fill("composition", suggestion.composition);
        fill("requiresPrescription", suggestion.requiresPrescription || null);
      }
    }
    const suggestedImages = suggestion?.images.map((image) => image.url) ?? [];
    // Keep photos the seller added themselves; otherwise use the catalogue ones.
    if (suggestedImages.length > 0) {
      setImages((current) => (current.length > 0 ? current : suggestedImages));
    }
    lookupFilled.current = { fields: filled, images: suggestedImages };
  }

  function onSubmit(values: ProductFormValues) {
    const payload = {
      name: values.name,
      description: values.description || undefined,
      categoryId: values.categoryId,
      sku: values.sku || undefined,
      barcode: values.barcode || undefined,
      brand: values.brand || undefined,
      price: values.price,
      discountPrice: values.discountPrice,
      stockQuantity: values.stockQuantity,
      lowStockThreshold: values.lowStockThreshold,
      weight: values.weight,
      deliveryType: values.deliveryType,
      returnPolicy: values.returnPolicy || undefined,
      tags: values.tags
        ? values.tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean)
        : undefined,
      images: images.map((url, index) => ({ url, sortOrder: index })),
      // Always send the full array, even empty — this form is always the
      // source of truth for a product's variant list, so an empty array
      // must mean "clear all variants," not "leave variants untouched"
      // (the latter is what `undefined` means to the backend).
      variants: (values.variants ?? []).map((v) => ({ ...v, sku: v.sku || undefined })),
      trackInventory: values.trackInventory,
      isAvailable: values.isAvailable,
      // null (not undefined) so clearing a field on edit actually clears it.
      expiryDate: values.expiryDate || null,
      ...(isRestaurant && {
        foodType: values.foodType ?? null,
        preparationTimeMins: values.preparationTimeMins ?? null,
        addonGroups: (values.addonGroups ?? []).map((group) => ({
          id: group.groupId,
          name: group.name,
          minSelect: group.minSelect,
          maxSelect: group.maxSelect,
          options: group.options.map((option) => ({
            id: option.optionId,
            name: option.name,
            price: option.price,
            isAvailable: option.isAvailable,
          })),
        })),
      }),
      ...(isPharmacy && {
        requiresPrescription: values.requiresPrescription,
        composition: values.composition || null,
      }),
    };

    if (isEditing && product) {
      updateProduct.mutate(
        { id: product.id, payload },
        { onSuccess: (updated) => onSuccess?.(updated) }
      );
    } else {
      createProduct.mutate(payload, { onSuccess: (created) => onSuccess?.(created) });
    }
  }

  return (
    <form noValidate onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6">
      <FieldGroup>
        {!isEditing && (
          <BarcodeLookupPanel storeId={storeId} autoScan={autoScan} onResult={applyBarcodeLookup} />
        )}

        <Field data-invalid={!!form.formState.errors.name}>
          <FieldLabel htmlFor="product-name">Product name</FieldLabel>
          <Input id="product-name" {...form.register("name")} />
          <FieldError errors={[form.formState.errors.name]} />
        </Field>

        <Field data-invalid={!!form.formState.errors.description}>
          <FieldLabel htmlFor="product-description">Description</FieldLabel>
          <Textarea id="product-description" {...form.register("description")} />
          <FieldError errors={[form.formState.errors.description]} />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field data-invalid={!!form.formState.errors.categoryId}>
            <FieldLabel htmlFor="product-category">Category</FieldLabel>
            <Select
              value={categoryId}
              onValueChange={(value) => form.setValue("categoryId", value, { shouldValidate: true })}
            >
              <SelectTrigger id="product-category" className="w-full">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categoryOptions.map((option) => (
                  <SelectItem key={option.id} value={option.id}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldError errors={[form.formState.errors.categoryId]} />
          </Field>
          <Field data-invalid={!!form.formState.errors.brand}>
            <FieldLabel htmlFor="product-brand">{isPharmacy ? "Manufacturer / brand" : "Brand"}</FieldLabel>
            <Input id="product-brand" {...form.register("brand")} />
            <FieldError errors={[form.formState.errors.brand]} />
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field data-invalid={!!form.formState.errors.sku}>
            <FieldLabel htmlFor="product-sku">SKU</FieldLabel>
            <Input id="product-sku" {...form.register("sku")} />
            <FieldError errors={[form.formState.errors.sku]} />
          </Field>
          <Field data-invalid={!!form.formState.errors.barcode}>
            <FieldLabel htmlFor="product-barcode">Barcode</FieldLabel>
            <Input id="product-barcode" {...form.register("barcode")} />
            <FieldError errors={[form.formState.errors.barcode]} />
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field data-invalid={!!form.formState.errors.price}>
            <FieldLabel htmlFor="product-price">Price (₹)</FieldLabel>
            <Input
              id="product-price"
              type="number"
              step="any"
              {...form.register("price", { valueAsNumber: true })}
            />
            <FieldError errors={[form.formState.errors.price]} />
          </Field>
          <Field data-invalid={!!form.formState.errors.discountPrice}>
            <FieldLabel htmlFor="product-discountPrice">Discount price (₹, optional)</FieldLabel>
            <Input
              id="product-discountPrice"
              type="number"
              step="any"
              {...form.register("discountPrice", { setValueAs: emptyToUndefined })}
            />
            <FieldError errors={[form.formState.errors.discountPrice]} />
          </Field>
        </div>

        <div className="grid gap-4 rounded-lg border border-border p-3 sm:grid-cols-2">
          <Field orientation="horizontal" className="gap-3">
            <Switch
              id="product-isAvailable"
              checked={isAvailable}
              onCheckedChange={(checked) => form.setValue("isAvailable", checked)}
            />
            <div className="flex flex-col gap-0.5">
              <FieldLabel htmlFor="product-isAvailable">Available to order</FieldLabel>
              <FieldDescription className="text-xs">
                Turn off to show it as sold out without deleting it.
              </FieldDescription>
            </div>
          </Field>
          <Field orientation="horizontal" className="gap-3">
            <Switch
              id="product-trackInventory"
              checked={trackInventory}
              onCheckedChange={(checked) => form.setValue("trackInventory", checked)}
            />
            <div className="flex flex-col gap-0.5">
              <FieldLabel htmlFor="product-trackInventory">Track stock count</FieldLabel>
              <FieldDescription className="text-xs">
                Turn off for made-to-order items like cooked food.
              </FieldDescription>
            </div>
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {trackInventory && (
            <>
              <Field data-invalid={!!form.formState.errors.stockQuantity}>
                <FieldLabel htmlFor="product-stockQuantity">Stock quantity</FieldLabel>
                <Input
                  id="product-stockQuantity"
                  type="number"
                  {...form.register("stockQuantity", { valueAsNumber: true })}
                />
                <FieldError errors={[form.formState.errors.stockQuantity]} />
              </Field>
              <Field data-invalid={!!form.formState.errors.lowStockThreshold}>
                <FieldLabel htmlFor="product-lowStockThreshold">Low stock alert at</FieldLabel>
                <Input
                  id="product-lowStockThreshold"
                  type="number"
                  {...form.register("lowStockThreshold", { setValueAs: emptyToUndefined })}
                />
                <FieldError errors={[form.formState.errors.lowStockThreshold]} />
              </Field>
            </>
          )}
          <Field data-invalid={!!form.formState.errors.weight}>
            <FieldLabel htmlFor="product-weight">Weight (kg, optional)</FieldLabel>
            <Input
              id="product-weight"
              type="number"
              step="any"
              {...form.register("weight", { setValueAs: emptyToUndefined })}
            />
            <FieldError errors={[form.formState.errors.weight]} />
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field data-invalid={!!form.formState.errors.deliveryType}>
            <FieldLabel htmlFor="product-deliveryType">Delivery type</FieldLabel>
            <Select
              value={storeFixesDelivery ? effectiveDeliveryType(storeDeliveryMode, deliveryType) : (deliveryType ?? "")}
              disabled={storeFixesDelivery}
              onValueChange={(value) =>
                form.setValue("deliveryType", value as ProductFormValues["deliveryType"], {
                  shouldValidate: true,
                })
              }
            >
              <SelectTrigger id="product-deliveryType" className="w-full">
                <SelectValue placeholder="Select delivery type" />
              </SelectTrigger>
              <SelectContent>
                {PRODUCT_DELIVERY_TYPE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {storeFixesDelivery && (
              <FieldDescription>
                Your store offers {storeDeliveryMode === "pickup_only" ? "pickup" : "delivery"} only
                (Store settings → Delivery), so it applies to every product.
              </FieldDescription>
            )}
            <FieldError errors={[form.formState.errors.deliveryType]} />
          </Field>
          <Field data-invalid={!!form.formState.errors.tags}>
            <FieldLabel htmlFor="product-tags">Tags (comma-separated)</FieldLabel>
            <Input id="product-tags" placeholder="organic, fresh, bestseller" {...form.register("tags")} />
            <FieldError errors={[form.formState.errors.tags]} />
          </Field>
        </div>

        {isRestaurant && (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field data-invalid={!!form.formState.errors.foodType}>
              <FieldLabel htmlFor="product-foodType">Veg / non-veg</FieldLabel>
              <Select
                value={foodType ?? NO_FOOD_TYPE}
                onValueChange={(value) =>
                  form.setValue(
                    "foodType",
                    value === NO_FOOD_TYPE ? undefined : (value as ProductFormValues["foodType"])
                  )
                }
              >
                <SelectTrigger id="product-foodType" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NO_FOOD_TYPE}>Not specified</SelectItem>
                  {FOOD_TYPE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldError errors={[form.formState.errors.foodType]} />
            </Field>
            <Field data-invalid={!!form.formState.errors.preparationTimeMins}>
              <FieldLabel htmlFor="product-preparationTimeMins">Preparation time (minutes)</FieldLabel>
              <Input
                id="product-preparationTimeMins"
                type="number"
                min={0}
                placeholder="e.g. 20"
                {...form.register("preparationTimeMins", { setValueAs: emptyToUndefined })}
              />
              <FieldError errors={[form.formState.errors.preparationTimeMins]} />
            </Field>
          </div>
        )}

        {isPharmacy && (
          <div className="flex flex-col gap-4 rounded-lg border border-border p-3">
            <Field orientation="horizontal" className="gap-3">
              <Switch
                id="product-requiresPrescription"
                checked={requiresPrescription}
                onCheckedChange={(checked) => form.setValue("requiresPrescription", checked)}
              />
              <div className="flex flex-col gap-0.5">
                <FieldLabel htmlFor="product-requiresPrescription">Prescription required (Rx)</FieldLabel>
                <FieldDescription className="text-xs">
                  Customers must upload a prescription, and you approve it before the order goes ahead.
                </FieldDescription>
              </div>
            </Field>
            <Field data-invalid={!!form.formState.errors.composition}>
              <FieldLabel htmlFor="product-composition">Composition / salt</FieldLabel>
              <Input
                id="product-composition"
                placeholder="e.g. Paracetamol 500mg"
                {...form.register("composition")}
              />
              <FieldError errors={[form.formState.errors.composition]} />
            </Field>
          </div>
        )}

        {!isRestaurant && (
          <Field data-invalid={!!form.formState.errors.expiryDate} className="sm:max-w-xs">
            <FieldLabel htmlFor="product-expiryDate">
              Expiry date{isPharmacy ? "" : " (optional)"}
            </FieldLabel>
            <Input id="product-expiryDate" type="date" {...form.register("expiryDate")} />
            <FieldDescription className="text-xs">
              Earliest expiry of the stock you have. Customers can&apos;t buy it after this date.
            </FieldDescription>
            <FieldError errors={[form.formState.errors.expiryDate]} />
          </Field>
        )}

        <Field data-invalid={!!form.formState.errors.returnPolicy}>
          <FieldLabel htmlFor="product-returnPolicy">Return policy</FieldLabel>
          <Textarea id="product-returnPolicy" {...form.register("returnPolicy")} />
          <FieldError errors={[form.formState.errors.returnPolicy]} />
        </Field>

        <ImageUploader
          value={images}
          onChange={setImages}
          multiple
          folder="products"
          label="Product images"
        />

        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">Variants (optional)</span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => append({ name: "", sku: "", priceDelta: 0, stockQuantity: 0 })}
            >
              <Plus className="size-4" />
              Add variant
            </Button>
          </div>
          {fields.length === 0 && (
            <p className="text-sm text-muted-foreground">
              {isRestaurant
                ? "No variants — add some for portion sizes like Half / Full."
                : "No variants — this product will be sold as a single item."}
            </p>
          )}
          {fields.map((field, index) => (
            <div
              key={field.id}
              className="grid gap-3 rounded-lg border border-border p-3 sm:grid-cols-[2fr_1.5fr_1fr_1fr_auto] sm:items-end"
            >
              <Field data-invalid={!!form.formState.errors.variants?.[index]?.name}>
                <FieldLabel htmlFor={`variant-name-${index}`} className="text-xs">
                  Name
                </FieldLabel>
                <Input
                  id={`variant-name-${index}`}
                  placeholder="e.g. 1kg pack"
                  {...form.register(`variants.${index}.name`)}
                />
                <FieldError errors={[form.formState.errors.variants?.[index]?.name]} />
              </Field>
              <Field>
                <FieldLabel htmlFor={`variant-sku-${index}`} className="text-xs">
                  SKU
                </FieldLabel>
                <Input id={`variant-sku-${index}`} {...form.register(`variants.${index}.sku`)} />
              </Field>
              <Field data-invalid={!!form.formState.errors.variants?.[index]?.priceDelta}>
                <FieldLabel htmlFor={`variant-priceDelta-${index}`} className="text-xs">
                  Price Δ (₹)
                </FieldLabel>
                <Input
                  id={`variant-priceDelta-${index}`}
                  type="number"
                  step="any"
                  {...form.register(`variants.${index}.priceDelta`, { valueAsNumber: true })}
                />
                <FieldError errors={[form.formState.errors.variants?.[index]?.priceDelta]} />
              </Field>
              {/* Not rendered (value kept) when stock isn't tracked — it'd be ignored anyway. */}
              {trackInventory && (
                <Field data-invalid={!!form.formState.errors.variants?.[index]?.stockQuantity}>
                  <FieldLabel htmlFor={`variant-stock-${index}`} className="text-xs">
                    Stock
                  </FieldLabel>
                  <Input
                    id={`variant-stock-${index}`}
                    type="number"
                    {...form.register(`variants.${index}.stockQuantity`, { valueAsNumber: true })}
                  />
                  <FieldError errors={[form.formState.errors.variants?.[index]?.stockQuantity]} />
                </Field>
              )}
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="text-destructive hover:text-destructive"
                onClick={() => remove(index)}
                aria-label="Remove variant"
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          ))}
        </div>

        {isRestaurant && <AddonGroupsEditor form={form} />}

        <Button type="submit" disabled={isPending} className="w-fit">
          {isPending && <Loader2 className="size-4 animate-spin" />}
          {isEditing ? "Save changes" : "Create product"}
        </Button>
      </FieldGroup>
    </form>
  );
}
