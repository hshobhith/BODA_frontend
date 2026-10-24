import { z } from "zod";

export const createReviewSchema = z.object({
  rating: z.number().min(1, "Pick a star rating.").max(5),
  comment: z.string().trim().max(2000, "Keep your review under 2000 characters.").optional(),
});

export type CreateReviewFormValues = z.infer<typeof createReviewSchema>;
