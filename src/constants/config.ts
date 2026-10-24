/**
 * App-wide configuration constants, sourced from env where relevant.
 */

export const APP_NAME = "BODA";
export const APP_DESCRIPTION =
  "BODA is your local marketplace — discover nearby stores, shop trusted sellers, and get everyday essentials delivered fast.";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api/v1";

/** Public support inbox — also where the backend sends contact-form messages
 * (its `SUPPORT_EMAIL` env var), so keep the two in sync. */
export const SUPPORT_EMAIL = "support@boda.local";

/** OAuth 2.0 Web client ID for Google sign-in — must match the backend's
 * `GOOGLE_CLIENT_ID`. Empty means Google sign-in isn't configured. */
export const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

/** LocalStorage key used by the persisted Zustand auth store. */
export const AUTH_STORAGE_KEY = "boda-auth";

/** LocalStorage key used by the persisted Zustand UI store. */
export const UI_STORAGE_KEY = "boda-ui";

export const DEFAULT_QUERY_STALE_TIME_MS = 30_000;

/** How far (km) a store can be from the shopper and still be listed — with
 * its products — on /stores, /products and /search. The home page uses a
 * tighter radius of its own. */
export const BROWSE_RADIUS_KM = 25;
