/** Reviews can target either a product or a store. */
export type ReviewTargetType = "product" | "store";

export interface ReviewUser {
  fullName: string;
  avatarUrl?: string | null;
}

export interface CreateReviewPayload {
  targetType: ReviewTargetType;
  targetId: string;
  rating: number;
  comment?: string;
}

export interface Review {
  id: string;
  targetType?: ReviewTargetType;
  targetId?: string;
  rating: number;
  comment: string;
  images?: string[];
  createdAt: string;
  user: ReviewUser;
  /** Set once the owning seller has replied via `PATCH /reviews/:id/reply`. */
  sellerReply?: string | null;
  sellerRepliedAt?: string | null;
}
