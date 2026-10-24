/** Confirmed live against GET /addresses. */
export interface Address {
  id: string;
  userId: string;
  label: string;
  line1: string;
  line2?: string | null;
  city: string;
  state: string;
  country: string;
  pincode: string;
  lat: number;
  lng: number;
  isDefault: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateAddressPayload {
  label: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
  lat: number;
  lng: number;
  isDefault?: boolean;
}

export type UpdateAddressPayload = Partial<CreateAddressPayload>;
