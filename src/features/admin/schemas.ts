import { z } from "zod";

import { emailSchema } from "@/lib/validators/auth";

/** "Whose store is this" — the seller part of the admin's add-store form. */
export const storeSellerSchema = z.object({
  sellerEmail: emailSchema,
  sellerName: z.string().max(120, "Keep the name under 120 characters").optional(),
  sellerPhone: z.string().optional(),
});

export type StoreSellerFormValues = z.infer<typeof storeSellerSchema>;
