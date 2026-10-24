import { z } from "zod";

export const addressSchema = z.object({
  label: z.string().min(1, "Give this address a label, e.g. Home or Work."),
  line1: z.string().min(3, "Enter the address line."),
  line2: z.string().optional(),
  city: z.string().min(1, "City is required."),
  state: z.string().min(1, "State is required."),
  country: z.string().min(1, "Country is required."),
  pincode: z.string().min(3, "Pincode is required."),
  // Plain z.number() (not z.coerce) so the resolver's input/output types
  // match for react-hook-form — the input itself uses `valueAsNumber` to
  // hand back a real number instead of a string.
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  isDefault: z.boolean().optional(),
});

export type AddressFormValues = z.infer<typeof addressSchema>;
