import { API_BASE_URL } from "@/constants/config";
import { apiClient } from "@/services/api-client";
import type { PaginatedResponse } from "@/types/api";
import type { CreatePosSalePayload, Order, OrderStatus } from "@/types/order";
import type {
  FoodType,
  Product,
  ProductDeliveryType,
  ProductStatus,
  ProductVideo,
} from "@/types/product";
import type {
  StoreDeliveryMode,
  StoreDeliverySpeed,
  StoreStatus,
  StoreType,
  StoreWorkingHour,
} from "@/types/store";
import type { Store, StoreDeliverySettings } from "@/types/store";

/**
 * Seller-scoped transport layer. Everything here talks to `/stores/me/...`,
 * the seller product-management endpoints, and `/orders/seller/mine` — all
 * distinct from the customer-facing `features/stores`/`features/products`
 * modules, which only ever read public/approved data. React Query hooks
 * wrapping these live in `./hooks.ts`.
 */

export interface CreateStorePayload {
  name: string;
  logoUrl?: string;
  bannerUrl?: string;
  description?: string;
  storeType?: StoreType;
  businessType: string;
  gstNumber?: string;
  licenseInfo?: string;
  phone: string;
  email: string;
  addressLine: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
  lat: number;
  lng: number;
  visibilityType: string;
}

/** storeType is fixed at creation, so it can't be updated. */
export type UpdateStorePayload = Partial<Omit<CreateStorePayload, "storeType">>;

export interface WorkingHoursPayload {
  hours: StoreWorkingHour[];
}

export interface DeliverySettingsPayload {
  mode: StoreDeliveryMode;
  deliveryRadiusKm?: number;
  deliveryFee?: number;
  freeDeliveryThreshold?: number;
  deliverySpeed: StoreDeliverySpeed;
  customWindowNote?: string;
}

export interface UpdateStoreStatusPayload {
  status: StoreStatus;
}

/**
 * Every `me/store*` call takes an optional `storeId` — a seller may own more
 * than one store. Omitting it falls back to the seller's first-created
 * store (matches the backend's default), which is all the `/seller` layout's
 * "does this seller have a store yet" check needs.
 */
export const sellerStoreApi = {
  listMyStores: () => apiClient.get<Store[]>("/stores/me/stores").then((r) => r.data),

  getMyStore: (storeId?: string) =>
    apiClient
      .get<Store>("/stores/me/store", { params: storeId ? { storeId } : undefined })
      .then((r) => r.data),

  createStore: (payload: CreateStorePayload) =>
    apiClient.post<Store>("/stores", payload).then((r) => r.data),

  updateStore: (payload: UpdateStorePayload, storeId?: string) =>
    apiClient
      .patch<Store>("/stores/me/store", payload, { params: storeId ? { storeId } : undefined })
      .then((r) => r.data),

  getWorkingHours: (storeId?: string) =>
    apiClient
      .get<StoreWorkingHour[]>("/stores/me/store/working-hours", {
        params: storeId ? { storeId } : undefined,
      })
      .then((r) => r.data),

  updateWorkingHours: (payload: WorkingHoursPayload, storeId?: string) =>
    apiClient
      .put<StoreWorkingHour[]>("/stores/me/store/working-hours", payload, {
        params: storeId ? { storeId } : undefined,
      })
      .then((r) => r.data),

  /** Returns just the saved settings row (its `id` is the settings' id, not the store's). */
  updateDeliverySettings: (payload: DeliverySettingsPayload, storeId?: string) =>
    apiClient
      .put<StoreDeliverySettings>("/stores/me/store/delivery-settings", payload, {
        params: storeId ? { storeId } : undefined,
      })
      .then((r) => r.data),

  updateStatus: (payload: UpdateStoreStatusPayload, storeId?: string) =>
    apiClient
      .patch<Store>("/stores/me/store/status", payload, { params: storeId ? { storeId } : undefined })
      .then((r) => r.data),
};

export interface SellerProductListParams {
  search?: string;
  categoryId?: string;
  status?: ProductStatus;
  page?: number;
  limit?: number;
}

export interface ProductImageInput {
  url: string;
  sortOrder?: number;
}

export interface ProductVariantInput {
  name: string;
  sku?: string;
  priceDelta: number;
  stockQuantity: number;
}

export interface CreateProductPayload {
  name: string;
  description?: string;
  categoryId: string;
  sku?: string;
  barcode?: string;
  brand?: string;
  price: number;
  discountPrice?: number;
  stockQuantity: number;
  lowStockThreshold?: number;
  weight?: number;
  deliveryType?: ProductDeliveryType;
  returnPolicy?: string;
  tags?: string[];
  images?: ProductImageInput[];
  videos?: ProductVideo[];
  variants?: ProductVariantInput[];
  trackInventory?: boolean;
  isAvailable?: boolean;
  /** null clears the value on update. */
  foodType?: FoodType | null;
  preparationTimeMins?: number | null;
  /** Send ids back for existing groups/options to keep customers' cart lines valid. */
  addonGroups?: ProductAddonGroupInput[];
  requiresPrescription?: boolean;
  composition?: string | null;
  expiryDate?: string | null;
}

export interface ProductAddonGroupInput {
  id?: string;
  name: string;
  minSelect: number;
  maxSelect: number;
  options: { id?: string; name: string; price: number; isAvailable: boolean }[];
}

export type UpdateProductPayload = Partial<CreateProductPayload>;

/** Catalogue details for a scanned barcode — never price or stock, which are per store. */
export interface ProductSuggestion {
  name: string;
  brand: string | null;
  description: string | null;
  categoryId: string | null;
  weight: number | null;
  tags: string[];
  images: ProductImageInput[];
  composition: string | null;
  requiresPrescription: boolean;
}

/** `GET /products/barcode/:code` — BODA's own catalogue first, then Open Food Facts. */
export interface BarcodeLookupResult {
  barcode: string;
  /** null when neither source knows the barcode. */
  source: "boda" | "openfoodfacts" | null;
  /** This store already lists the barcode. */
  existingProduct: { id: string; name: string } | null;
  suggestion: ProductSuggestion | null;
  /** Credit line to show when the data comes from Open Food Facts. */
  attribution: string | null;
}

export interface AdjustStockPayload {
  variantId?: string;
  changeQty: number;
  reason: string;
}

export interface DuplicateProductPayload {
  newName?: string;
}

/**
 * Shape of `GET /products/:id/inventory-history` entries — not confirmed
 * against a live response at the time this was written (only the endpoint
 * shape was confirmed), so kept loose enough that unexpected extra/missing
 * fields don't break rendering.
 */
export interface InventoryHistoryEntry {
  id: string;
  productId: string;
  variantId?: string | null;
  changeQty: number;
  reason: string;
  previousQty?: number;
  newQty?: number;
  createdAt: string;
  changedBy?: { id: string; fullName: string } | null;
}

export const sellerProductsApi = {
  listMine: (storeId: string, params?: SellerProductListParams) =>
    apiClient
      .get<PaginatedResponse<Product>>(`/products/mine/store/${storeId}`, { params })
      .then((r) => r.data),

  getMineById: (id: string) =>
    apiClient.get<Product>(`/products/mine/${id}`).then((r) => r.data),

  create: (storeId: string, payload: CreateProductPayload) =>
    apiClient.post<Product>(`/products/store/${storeId}`, payload).then((r) => r.data),

  lookupBarcode: (code: string, storeId: string) =>
    apiClient
      .get<BarcodeLookupResult>(`/products/barcode/${encodeURIComponent(code)}`, { params: { storeId } })
      .then((r) => {
        const suggestion = r.data.suggestion;
        // Photos copied from Open Food Facts come back as our relative /uploads paths.
        return suggestion
          ? {
              ...r.data,
              suggestion: {
                ...suggestion,
                images: suggestion.images.map((image) => ({ ...image, url: resolveUploadUrl(image.url) })),
              },
            }
          : r.data;
      }),

  update: (id: string, payload: UpdateProductPayload) =>
    apiClient.patch<Product>(`/products/${id}`, payload).then((r) => r.data),

  archive: (id: string) =>
    apiClient.patch<Product>(`/products/${id}/archive`).then((r) => r.data),

  duplicate: (id: string, payload?: DuplicateProductPayload) =>
    apiClient.post<Product>(`/products/${id}/duplicate`, payload ?? {}).then((r) => r.data),

  adjustStock: (id: string, payload: AdjustStockPayload) =>
    apiClient.patch<Product>(`/products/${id}/adjust-stock`, payload).then((r) => r.data),

  getLowStock: (storeId: string) =>
    apiClient.get<Product[]>(`/products/store/${storeId}/low-stock`).then((r) => r.data),

  getInventoryHistory: (id: string, params?: { page?: number; limit?: number }) =>
    apiClient
      .get<PaginatedResponse<InventoryHistoryEntry>>(`/products/${id}/inventory-history`, {
        params,
      })
      .then((r) => r.data),
};

export interface SellerOrderListParams {
  status?: OrderStatus;
  page?: number;
  limit?: number;
  /** Narrows to one owned store; omitted, orders from every owned store are returned. */
  storeId?: string;
}

export const sellerOrdersApi = {
  listMine: (params?: SellerOrderListParams) =>
    apiClient
      .get<PaginatedResponse<Order>>("/orders/seller/mine", { params })
      .then((r) => r.data),

  /** Records an in-person sale — creates a real (already delivered/paid) order. */
  createPosSale: (storeId: string, payload: CreatePosSalePayload) =>
    apiClient.post<Order>(`/orders/store/${storeId}/pos`, payload).then((r) => r.data),
};

export interface UploadImageResponse {
  url: string;
}

/**
 * `POST /uploads/image` returns a *relative* path (e.g.
 * `/uploads/products/<hash>-name.png`), not a fully-qualified URL —
 * confirmed live. Passed straight into `next/image`, a relative path
 * resolves against the frontend's own origin (`/uploads/...` on port 3000)
 * instead of the backend that actually serves it, which 400s from the
 * `/_next/image` optimizer route. Every other image URL already in the app
 * (store logos, seeded product photos) happens to come back absolute, so
 * this only bites freshly-uploaded images — resolved here, once, so every
 * caller of `uploadImage` gets a URL that just works.
 */
function resolveUploadUrl(url: string): string {
  if (/^https?:\/\//i.test(url)) return url;
  const origin = API_BASE_URL.replace(/\/api\/v1\/?$/, "");
  return `${origin}${url.startsWith("/") ? "" : "/"}${url}`;
}

export const uploadsApi = {
  uploadImage: (file: File, folder?: string) => {
    const formData = new FormData();
    formData.append("file", file);
    return apiClient
      .post<UploadImageResponse>("/uploads/image", formData, {
        params: folder ? { folder } : undefined,
        // Deliberately NOT setting Content-Type: multipart/form-data here.
        // The apiClient instance defaults every request to
        // "Content-Type: application/json" (see services/api-client.ts), and
        // a fixed "multipart/form-data" string has no `boundary` parameter,
        // which makes the backend's multipart parser reject the body with a
        // 400 (confirmed live — this exact bug was hit and fixed during
        // testing). Setting it to `undefined` lets axios detect the
        // `FormData` payload and generate the correct
        // "multipart/form-data; boundary=..." header itself.
        headers: { "Content-Type": undefined },
      })
      .then((r) => ({ url: resolveUploadUrl(r.data.url) }));
  },
};
