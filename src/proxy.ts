import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { ROUTES } from "@/constants/routes";
import {
  STORE_MODE_COOKIE,
  STORE_MODE_MAX_AGE_SECONDS,
  STORE_SLUG_PATTERN,
  isPathAllowedInStoreMode,
  readStoreModeSlug,
} from "@/lib/store-mode";

/**
 * Request-level routing, run before every page (and RSC navigation) request.
 *
 * NOTE ON NAMING: the brief asked for `middleware.ts`, but this project
 * scaffolded on Next.js 16, which renamed the `middleware` file convention
 * to `proxy` (middleware.ts still works as a deprecated alias, but emits a
 * build-time deprecation warning pointing here:
 * https://nextjs.org/docs/messages/middleware-to-proxy). We use the current,
 * non-deprecated convention instead.
 *
 * What it does today: store-only mode (see `src/lib/store-mode.ts`).
 *   - `/s/<slug>` (a store's private link / table QR) turns the mode on and
 *     redirects to the store.
 *   - While it's on, in-app navigation to anything outside that store is
 *     redirected back to it. Arriving from outside the app (typed URL,
 *     bookmark, another app's link) turns it off instead.
 *
 * TODO (later pass, once the backend's token/session shape is finalized):
 * role-based gating for `/seller/*` and `/admin/*`. Today tokens live in
 * localStorage via Zustand, which this server-side proxy cannot read, so this
 * needs a decision: either mirror the role into a readable cookie on login,
 * or accept those stay client-side-only guards (see the seller/admin layouts).
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const entry = pathname.match(/^\/s\/([^/]+)\/?$/);
  if (entry) {
    const slug = decodeURIComponent(entry[1]).toLowerCase();
    if (!STORE_SLUG_PATTERN.test(slug)) {
      return NextResponse.redirect(new URL(ROUTES.stores, request.url));
    }
    const response = NextResponse.redirect(new URL(ROUTES.storeDetail(slug), request.url));
    response.cookies.set(STORE_MODE_COOKIE, slug, {
      path: "/",
      maxAge: STORE_MODE_MAX_AGE_SECONDS,
      sameSite: "lax",
      secure: request.nextUrl.protocol === "https:",
    });
    return response;
  }

  const slug = readStoreModeSlug(request.headers.get("cookie") ?? "");
  if (!slug || isPathAllowedInStoreMode(pathname, slug)) {
    return NextResponse.next();
  }

  // `none` = typed/bookmarked, `cross-site`/`same-site` = followed from
  // elsewhere. Only clicks inside the app itself are kept in the store.
  const fetchSite = request.headers.get("sec-fetch-site");
  if (fetchSite && fetchSite !== "same-origin") {
    const response = NextResponse.next();
    response.cookies.delete(STORE_MODE_COOKIE);
    return response;
  }

  return NextResponse.redirect(new URL(ROUTES.storeDetail(slug), request.url));
}

export const config = {
  // Pages only — not build assets, optimized images, or public/ files.
  matcher: ["/((?!_next/static|_next/image|favicon\\.ico|.*\\.[a-zA-Z0-9]+$).*)"],
};
