/**
 * Small shared types used across features. Kept intentionally minimal for
 * this bootstrap pass — feature-specific types (Store, Product, Order, etc.)
 * belong in their own `features/<feature>/types.ts` once those passes land.
 */

export interface Address {
  id?: string;
  label?: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  lat?: number;
  lng?: number;
  isDefault?: boolean;
}

export interface SelectOption<T = string> {
  label: string;
  value: T;
}

export type SortOrder = "asc" | "desc";

export interface WithId {
  id: string;
}
