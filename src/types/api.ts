/**
 * Shared API envelope types.
 *
 * The backend wraps every successful response as:
 *   { success: true, data: <payload> }
 * and every error as:
 *   { statusCode, message, error, path, timestamp }
 *
 * The axios response interceptor (see `services/api-client.ts`) unwraps the
 * success envelope so application code normally deals with `<payload>`
 * directly. These types exist for the interceptor itself and for any code
 * that needs to reason about the raw shape (e.g. error handling).
 */

export interface ApiSuccessEnvelope<T> {
  success: true;
  data: T;
}

export interface ApiErrorEnvelope {
  statusCode: number;
  message: string | string[];
  error: string;
  path: string;
  timestamp: string;
}

/** Normalized shape our UI code uses after unwrapping an ApiErrorEnvelope. */
export interface ApiError {
  statusCode: number;
  message: string;
  error: string;
  path?: string;
  timestamp?: string;
}

/**
 * Generic paginated list shape speculated during the app-shell bootstrap
 * pass, before any list endpoints existed to confirm against. Superseded by
 * `PaginatedResponse<T>` below (confirmed against the browsing feature
 * endpoints: stores/categories/products/reviews/wishlist) — kept only so
 * nothing that may already reference it breaks.
 */
export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/** Pagination metadata returned alongside every list endpoint's `data` array. */
export interface PageMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/**
 * Real paginated-list shape used by the browsing endpoints (stores,
 * categories, products, reviews, wishlist). Note this is nested one level
 * inside the `{ success, data }` envelope: the axios interceptor unwraps the
 * outer envelope, so callers receive this `{ data, meta }` shape directly.
 */
export interface PaginatedResponse<T> {
  data: T[];
  meta: PageMeta;
}
