import type { Metadata } from "next";

import { API_BASE_URL, APP_NAME, PUBLIC_APP_URL } from "@/constants/config";
import { ROUTES } from "@/constants/routes";
import type { Store, StoreType } from "@/types/store";

// The store page itself is a client component, so its search-engine metadata
// is produced here, on the server, from the same public store endpoint.

const SCHEMA_TYPE: Record<StoreType, string> = {
  retail: "Store",
  restaurant: "Restaurant",
  pharmacy: "Pharmacy",
};

async function fetchStore(slug: string): Promise<Store | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/stores/${encodeURIComponent(slug)}`, {
      next: { revalidate: 3600 },
    });
    if (!response.ok) return null;
    const body = (await response.json()) as { data?: Store };
    return body.data ?? null;
  } catch {
    return null;
  }
}

function storeDescription(store: Store): string {
  const place = [store.city, store.state].filter(Boolean).join(", ");
  const fallback = `Order from ${store.name}${place ? ` in ${place}` : ""} on ${APP_NAME} — browse products, check opening hours, and get pickup or delivery.`;
  const text = store.description?.trim() || fallback;
  return text.length > 160 ? `${text.slice(0, 157)}…` : text;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const store = await fetchStore(slug);
  if (!store) {
    return { title: "Store" };
  }

  const place = store.city ? ` in ${store.city}` : "";
  const title = `${store.name}${place}`;
  const description = storeDescription(store);
  const image = store.bannerUrl || store.logoUrl || "/brand/boda-og.png";

  // No canonical/og:url here: product pages under /stores/<slug>/products/*
  // inherit this metadata, and a store canonical would tell Google they're
  // duplicates of the store page.
  return {
    title,
    description,
    openGraph: {
      type: "website",
      title: `${title} | ${APP_NAME}`,
      description,
      images: [{ url: image, alt: store.name }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | ${APP_NAME}`,
      description,
      images: [image],
    },
  };
}

export default async function StoreLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const store = await fetchStore(slug);

  // Lets Google show the store as a local business (address, phone, map pin).
  const structuredData = store && {
    "@context": "https://schema.org",
    "@type": SCHEMA_TYPE[store.storeType ?? "retail"],
    name: store.name,
    url: `${PUBLIC_APP_URL}${ROUTES.storeDetail(store.slug)}`,
    description: storeDescription(store),
    image: store.bannerUrl || store.logoUrl || undefined,
    telephone: store.phone || undefined,
    address: {
      "@type": "PostalAddress",
      streetAddress: store.addressLine || undefined,
      addressLocality: store.city || undefined,
      addressRegion: store.state || undefined,
      postalCode: store.pincode || undefined,
      addressCountry: "IN",
    },
    geo:
      typeof store.lat === "number" && typeof store.lng === "number"
        ? { "@type": "GeoCoordinates", latitude: store.lat, longitude: store.lng }
        : undefined,
  };

  return (
    <>
      {structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      )}
      {children}
    </>
  );
}
