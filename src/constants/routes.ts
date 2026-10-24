/**
 * Central, typed route map for the whole app.
 *
 * This documents the URL contract that later feature passes (stores,
 * products, cart, seller dashboard, admin console, ...) will implement. Not
 * every path below has a corresponding page yet — this file exists so the
 * app shell (header, footer, nav, redirects) can reference stable route
 * constants instead of magic strings, and so future passes know exactly
 * which paths to create.
 *
 * Convention: functions are used for dynamic segments, plain strings for
 * static ones.
 */
export const ROUTES = {
  home: "/",

  // Discovery
  stores: "/stores",
  storeDetail: (slug: string) => `/stores/${slug}` as const,
  /** A store's private link: opens it in store-only mode (see lib/store-mode.ts). */
  storeOnly: (slug: string) => `/s/${slug}` as const,
  categories: "/categories",
  categoryDetail: (slug: string) => `/categories/${slug}` as const,
  /** Flat product browse/search route, e.g. `/products?search=...&categoryId=...`. */
  products: "/products",
  /** Reserved flat product URL. Product detail pages are nested under their
   * store (see `storeProductDetail`) so this isn't used by any page yet, but
   * stays here in case a canonical flat URL is needed later (e.g. redirects). */
  product: (slug: string) => `/products/${slug}` as const,
  /** Product detail lives under its store for a browsable, SEO-friendly URL. */
  storeProductDetail: (storeSlug: string, productIdOrSlug: string) =>
    `/stores/${storeSlug}/products/${productIdOrSlug}` as const,
  search: "/search",

  // Cart & checkout
  cart: "/cart",
  checkout: "/checkout",
  orderConfirmation: (orderId: string) => `/checkout/confirmation/${orderId}` as const,

  // Orders
  orders: "/account/orders",
  orderDetail: (orderId: string) => `/account/orders/${orderId}` as const,

  // Account
  account: "/account",
  accountProfile: "/account/profile",
  accountAddresses: "/account/addresses",
  accountSettings: "/account/settings",
  wishlist: "/account/wishlist",

  // Auth
  login: "/auth/login",
  register: "/auth/register",
  forgotPassword: "/auth/forgot-password",
  resetPassword: "/auth/reset-password",
  verifyEmail: "/auth/verify-email",

  // Seller
  sellerRoot: "/seller",
  sellerDashboard: "/seller/dashboard",
  sellerStore: "/seller/store",
  sellerProducts: "/seller/products",
  sellerProductNew: "/seller/products/new",
  sellerProductEdit: (id: string) => `/seller/products/${id}/edit` as const,
  sellerOrders: "/seller/orders",
  sellerReviews: "/seller/reviews",
  sellerOnboarding: "/seller/onboarding",
  /** Adds another store for a seller who already has at least one. */
  sellerStoresNew: "/seller/stores/new",

  // Admin
  adminRoot: "/admin",
  adminDashboard: "/admin/dashboard",
  adminUsers: "/admin/users",
  adminSellers: "/admin/sellers",
  adminStores: "/admin/stores",
  adminOrders: "/admin/orders",
  adminCategories: "/admin/categories",
  adminAuditLogs: "/admin/audit-logs",

  // Selling (public marketing/info pages, no auth required — unlike /seller/*)
  sell: "/sell",
  sellerGuide: "/sell/guide",

  // Misc
  about: "/about",
  howItWorks: "/how-it-works",
  careers: "/careers",
  contact: "/contact",
  help: "/help",
  returns: "/help/returns",
  terms: "/legal/terms",
  privacy: "/legal/privacy",
  cookies: "/legal/cookies",
} as const;

export type Routes = typeof ROUTES;
