import type { MetadataRoute } from "next";

import { PUBLIC_APP_URL } from "@/constants/config";

/**
 * /robots.txt — lets search engines crawl the public marketplace and keeps them
 * out of private, per-user pages (dashboards, account, cart, checkout, login)
 * that only show a login redirect to a crawler anyway.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/seller/",
        "/admin/",
        "/account/",
        "/auth/",
        "/cart",
        "/checkout",
        // A store's private QR-code link; the same store is indexed at /stores/<slug>.
        "/s/",
      ],
    },
    sitemap: `${PUBLIC_APP_URL}/sitemap.xml`,
    host: PUBLIC_APP_URL,
  };
}
