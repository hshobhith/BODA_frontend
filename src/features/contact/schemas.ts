import { z } from "zod";

import { emailSchema } from "@/lib/validators/auth";
import type { ContactTopic } from "@/types/contact";

export const CONTACT_TOPIC_OPTIONS: { value: ContactTopic; label: string }[] = [
  { value: "order", label: "Help with an order" },
  { value: "returns", label: "Returns & refunds" },
  { value: "account", label: "My account" },
  { value: "selling", label: "Selling on BODA" },
  { value: "other", label: "Something else" },
];

// Limits mirror the backend DTO so the user sees the error inline rather than
// as a 400 toast.
export const contactMessageSchema = z.object({
  name: z.string().trim().min(1, "Enter your name.").max(100, "Keep your name under 100 characters."),
  email: emailSchema,
  topic: z.enum(["order", "returns", "account", "selling", "other"], {
    error: "Pick a topic.",
  }),
  orderNumber: z
    .string()
    .trim()
    .max(50, "That order number looks too long.")
    .regex(/^[A-Za-z0-9-]*$/, "Order numbers only contain letters, digits and dashes."),
  message: z
    .string()
    .trim()
    .min(10, "Tell us a little more (at least 10 characters).")
    .max(5000, "Keep your message under 5000 characters."),
});

export type ContactMessageFormValues = z.infer<typeof contactMessageSchema>;
