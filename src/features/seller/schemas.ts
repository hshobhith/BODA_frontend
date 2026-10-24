import { z } from "zod";

import { emailSchema } from "@/lib/validators/auth";

/**
 * Zod schemas for the seller dashboard's forms.
 *
 * Numeric fields follow the project-wide convention (see
 * `features/addresses/schemas.ts`): plain `z.number()` here, paired with
 * `form.register("field", { valueAsNumber: true })` on required fields in
 * the component. `z.coerce.number()` is deliberately avoided — it causes a
 * TypeScript resolver type mismatch with react-hook-form in this project's
 * zod v4 setup.
 *
 * Optional numeric fields (a discount price, a delivery radius, ...) can't
 * use `valueAsNumber` cleanly, since an empty input becomes `NaN` (which
 * `z.number()` rejects) rather than `undefined`. Those fields instead use
 * `register("field", { setValueAs: emptyToUndefined })` in the component,
 * paired with a plain `z.number().optional()` here — the empty string is
 * normalized to `undefined` before zod ever sees it.
 */
export function emptyToUndefined(value: string): number | undefined {
  if (value === "" || value === null || value === undefined) return undefined;
  const n = Number(value);
  return Number.isNaN(n) ? undefined : n;
}

const requiredPhoneSchema = z
  .string()
  .regex(/^\+?[1-9]\d{7,14}$/, "Enter a valid phone number");

// Confirmed live against `POST /stores`'s validation error (a first guess of
// "public"/"private" 400'd): "visibilityType must be one of the following
// values: radius_5, radius_10, radius_25, radius_50, state, country, global".
export const STORE_VISIBILITY_OPTIONS = [
  { value: "radius_5", label: "Within 5 km" },
  { value: "radius_10", label: "Within 10 km" },
  { value: "radius_25", label: "Within 25 km" },
  { value: "radius_50", label: "Within 50 km" },
  { value: "state", label: "Anywhere in the state" },
  { value: "country", label: "Anywhere in the country" },
  { value: "global", label: "Globally" },
] as const;

export const storeSchema = z.object({
  name: z.string().min(2, "Store name is required."),
  logoUrl: z.string().optional(),
  bannerUrl: z.string().optional(),
  description: z.string().optional(),
  storeType: z.enum(["retail", "restaurant", "pharmacy"]),
  businessType: z.string().min(1, "Business type is required."),
  gstNumber: z.string().optional(),
  licenseInfo: z.string().optional(),
  phone: requiredPhoneSchema,
  email: emailSchema,
  addressLine: z.string().min(3, "Address is required."),
  city: z.string().min(1, "City is required."),
  state: z.string().min(1, "State is required."),
  country: z.string().min(1, "Country is required."),
  pincode: z.string().min(3, "Pincode is required."),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  visibilityType: z.enum([
    "radius_5",
    "radius_10",
    "radius_25",
    "radius_50",
    "state",
    "country",
    "global",
  ]),
}).refine((store) => store.storeType === "retail" || !!store.licenseInfo?.trim(), {
  message: "A licence number is required for this store type.",
  path: ["licenseInfo"],
});
export type StoreFormValues = z.infer<typeof storeSchema>;

export const DAY_LABELS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

export const workingHourRowSchema = z.object({
  dayOfWeek: z.number().min(0).max(6),
  openTime: z.string().optional(),
  closeTime: z.string().optional(),
  breakStart: z.string().optional(),
  breakEnd: z.string().optional(),
  isHoliday: z.boolean(),
});

export const workingHoursSchema = z.object({
  hours: z.array(workingHourRowSchema).length(7, "Expected all 7 days."),
});
export type WorkingHoursFormValues = z.infer<typeof workingHoursSchema>;

export const DELIVERY_MODE_OPTIONS = [
  { value: "pickup_only", label: "Pickup only" },
  { value: "delivery", label: "Delivery only" },
  { value: "both", label: "Delivery & pickup" },
] as const;

export const DELIVERY_SPEED_OPTIONS = [
  { value: "10_min", label: "10 minutes" },
  { value: "same_day", label: "Same day" },
  { value: "next_day", label: "Next day" },
  { value: "3_5_days", label: "3–5 days" },
  { value: "custom", label: "Custom window" },
] as const;

export const deliverySettingsSchema = z.object({
  mode: z.enum(["pickup_only", "delivery", "both"]),
  deliveryRadiusKm: z.number().optional(),
  deliveryFee: z.number().optional(),
  freeDeliveryThreshold: z.number().optional(),
  deliverySpeed: z.enum(["10_min", "same_day", "next_day", "3_5_days", "custom"]),
  customWindowNote: z.string().optional(),
});
export type DeliverySettingsFormValues = z.infer<typeof deliverySettingsSchema>;

export const STORE_STATUS_OPTIONS = [
  { value: "open", label: "Open for business" },
  { value: "closed", label: "Closed" },
  { value: "temporarily_closed", label: "Temporarily closed" },
  { value: "vacation", label: "On vacation" },
] as const;

export const PRODUCT_DELIVERY_TYPE_OPTIONS = [
  { value: "delivery", label: "Delivery" },
  { value: "pickup", label: "Pickup" },
  { value: "both", label: "Delivery & pickup" },
] as const;

export const productVariantSchema = z.object({
  name: z.string().min(1, "Variant name is required."),
  sku: z.string().optional(),
  priceDelta: z.number(),
  stockQuantity: z.number().min(0, "Stock must be 0 or more."),
});
export type ProductVariantFormValues = z.infer<typeof productVariantSchema>;

// `optionId`/`groupId` rather than `id`: useFieldArray reserves `id` for its
// own row keys. Mapped back to `id` in the payload so the backend keeps
// existing ids stable (cart lines reference them).
export const productAddonOptionSchema = z.object({
  optionId: z.string().optional(),
  name: z.string().min(1, "Option name is required."),
  price: z.number().min(0, "Price must be 0 or more."),
  isAvailable: z.boolean(),
});

export const productAddonGroupSchema = z
  .object({
    groupId: z.string().optional(),
    name: z.string().min(1, "Group name is required."),
    minSelect: z.number().min(0, "Must be 0 or more."),
    maxSelect: z.number().min(1, "Allow at least 1 choice."),
    options: z.array(productAddonOptionSchema).min(1, "Add at least one option."),
  })
  .refine((group) => group.maxSelect >= group.minSelect, {
    message: "Max must be at least the min.",
    path: ["maxSelect"],
  })
  .refine((group) => group.minSelect <= group.options.length, {
    message: "Min is more than the number of options.",
    path: ["minSelect"],
  });
export type ProductAddonGroupFormValues = z.infer<typeof productAddonGroupSchema>;

export const FOOD_TYPE_OPTIONS = [
  { value: "veg", label: "Veg" },
  { value: "non_veg", label: "Non-veg" },
  { value: "egg", label: "Contains egg" },
] as const;

export const productSchema = z.object({
  name: z.string().min(2, "Product name is required."),
  description: z.string().optional(),
  categoryId: z.string().min(1, "Select a category."),
  sku: z.string().optional(),
  barcode: z.string().optional(),
  brand: z.string().optional(),
  price: z.number().min(0, "Price must be 0 or more."),
  discountPrice: z.number().optional(),
  stockQuantity: z.number().min(0, "Stock must be 0 or more."),
  lowStockThreshold: z.number().optional(),
  trackInventory: z.boolean(),
  isAvailable: z.boolean(),
  weight: z.number().optional(),
  deliveryType: z.enum(["delivery", "pickup", "both"]).optional(),
  returnPolicy: z.string().optional(),
  // Simple comma-separated input in the form; split into a string[] on
  // submit rather than modeling as an array here (a raw text field is much
  // friendlier to type into than a tag-array widget for this MVP).
  tags: z.string().optional(),
  variants: z.array(productVariantSchema).optional(),
  // Restaurant
  foodType: z.enum(["veg", "non_veg", "egg"]).optional(),
  preparationTimeMins: z.number().min(0, "Must be 0 or more.").optional(),
  addonGroups: z.array(productAddonGroupSchema).optional(),
  // Pharmacy (expiry also applies to groceries)
  requiresPrescription: z.boolean(),
  composition: z.string().optional(),
  expiryDate: z.string().optional(),
});
export type ProductFormValues = z.infer<typeof productSchema>;

export const posSaleItemSchema = z.object({
  productId: z.string().min(1, "Select a product."),
  variantId: z.string().optional(),
  quantity: z.number().min(1, "Quantity must be at least 1."),
});
export type PosSaleItemFormValues = z.infer<typeof posSaleItemSchema>;

export const posSaleSchema = z.object({
  items: z.array(posSaleItemSchema).min(1, "Add at least one item."),
  guestName: z.string().optional(),
  guestPhone: z.string().optional(),
  note: z.string().optional(),
});
export type PosSaleFormValues = z.infer<typeof posSaleSchema>;

export const stockAdjustSchema = z.object({
  variantId: z.string().optional(),
  changeQty: z.number().refine((n) => n !== 0, "Enter a non-zero quantity change."),
  reason: z.string().min(1, "Give a reason for this adjustment."),
});
export type StockAdjustFormValues = z.infer<typeof stockAdjustSchema>;
