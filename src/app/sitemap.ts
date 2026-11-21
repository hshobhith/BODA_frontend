import type { MetadataRoute } from "next";

import { API_BASE_URL, PUBLIC_APP_URL } from "@/constants/config";
import { ROUTES } from "@/constants/routes";

// Rebuilt at most once a day, so newly approved stores show up without a redeploy.
export const revalidate = 86400;

const PAGE_SIZE = 100;
/** Safety cap on API pages fetched per rebuild (10,000 stores). */
const MAX_PAGES = 100;

const STATIC_PAGES: { path: string; priority: number; changeFrequency: "daily" | "weekly" | "monthly" }[] = [
  { path: ROUTES.home, priority: 1, changeFrequency: "daily" },
  { path: ROUTES.stores, priority: 0.9, changeFrequency: "daily" },
  { path: ROUTES.categories, priority: 0.8, changeFrequency: "weekly" },
  { path: ROUTES.products, priority: 0.8, changeFrequency: "daily" },
  { path: ROUTES.sell, priority: 0.8, changeFrequency: "monthly" },
  { path: ROUTES.sellerGuide, priority: 0.6, changeFrequency: "monthly" },
  { path: ROUTES.howItWorks, priority: 0.6, changeFrequency: "monthly" },
  { path: ROUTES.about, priority: 0.5, changeFrequency: "monthly" },
  { path: ROUTES.contact, priority: 0.5, changeFrequency: "monthly" },
  { path: ROUTES.help, priority: 0.5, changeFrequency: "monthly" },
  { path: ROUTES.returns, priority: 0.4, changeFrequency: "monthly" },
  { path: ROUTES.careers, priority: 0.3, changeFrequency: "monthly" },
  { path: ROUTES.terms, priority: 0.2, changeFrequency: "monthly" },
  { path: ROUTES.privacy, priority: 0.2, changeFrequency: "monthly" },
  { path: ROUTES.cookies, priority: 0.2, changeFrequency: "monthly" },
];

interface StoreSummary {
  slug: string;
  updatedAt?: string;
}

/** Every approved store, via the public `/stores/search` endpoint (no query = all of them). */
async function fetchApprovedStores(): Promise<StoreSummary[]> {
  const stores: StoreSummary[] = [];
  for (let page = 1; page <= MAX_PAGES; page++) {
    const response = await fetch(`${API_BASE_URL}/stores/search?page=${page}&limit=${PAGE_SIZE}`, {
      next: { revalidate },
    });
    if (!response.ok) break;
    // Backend envelope: { success, data: { data: Store[], meta: { totalPages } } }
    const body = (await response.json()) as {
      data?: { data?: StoreSummary[]; meta?: { totalPages?: number } };
    };
    stores.push(...(body.data?.data ?? []));
    if (page >= (body.data?.meta?.totalPages ?? 0)) break;
  }
  return stores;
}

/**
 * /sitemap.xml — the public pages plus one entry per approved store, so Google
 * finds every storefront. If the API is unreachable at build time the sitemap
 * still lists the static pages rather than failing the build.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const entries: MetadataRoute.Sitemap = STATIC_PAGES.map((page) => ({
    url: `${PUBLIC_APP_URL}${page.path === "/" ? "" : page.path}`,
    lastModified: now,
    changeFrequency: page.changeFrequency,
    priority: page.priority,
  }));

  try {
    const stores = await fetchApprovedStores();
    for (const store of stores) {
      entries.push({
        url: `${PUBLIC_APP_URL}${ROUTES.storeDetail(store.slug)}`,
        lastModified: store.updatedAt ? new Date(store.updatedAt) : now,
        changeFrequency: "daily",
        priority: 0.7,
      });
    }
  } catch {
    // API down — ship the static part; the next rebuild picks the stores up.
  }

  return entries;
}
