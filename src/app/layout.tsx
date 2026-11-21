import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";

import "./globals.css";

import { Footer } from "@/components/layout/footer";
import { FooterGate } from "@/components/layout/footer-gate";
import { Header } from "@/components/layout/header";
import { MobileTabBar } from "@/components/layout/mobile-tab-bar";
import { Toaster } from "@/components/ui/sonner";
import { NotificationsListener } from "@/features/notifications/components/notifications-listener";
import {
  APP_DESCRIPTION,
  APP_NAME,
  INSTAGRAM_URL,
  PUBLIC_APP_URL,
  SUPPORT_EMAIL,
  SUPPORT_PHONE,
} from "@/constants/config";
import { ROUTES } from "@/constants/routes";
import { STORE_MODE_BOOT_SCRIPT } from "@/lib/store-mode";
import { QueryProvider } from "@/providers/query-provider";
import { ThemeProvider } from "@/providers/theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  // The live domain, not SITE_URL (an env var that can still hold an old preview
  // address): every absolute URL Google and link previews see is built from this.
  metadataBase: new URL(PUBLIC_APP_URL),
  title: {
    default: `${APP_NAME} — Your Local Marketplace`,
    template: `%s | ${APP_NAME}`,
  },
  description: APP_DESCRIPTION,
  applicationName: APP_NAME,
  keywords: [
    "BODA",
    "bodaborcha",
    "local marketplace",
    "nearby stores",
    "local shops near me",
    "online grocery delivery",
    "order from local stores",
    "restaurants near me",
    "pharmacy near me",
    "sell online for free",
    "online shopping India",
  ],
  authors: [{ name: APP_NAME }],
  creator: APP_NAME,
  manifest: "/manifest.json",
  // app/favicon.ico is served automatically; these add sharper sizes.
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/icons/apple-touch-icon.png",
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: PUBLIC_APP_URL,
    siteName: APP_NAME,
    title: `${APP_NAME} — Your Local Marketplace`,
    description: APP_DESCRIPTION,
    images: [
      {
        url: "/brand/boda-og.png",
        width: 1200,
        height: 630,
        alt: `${APP_NAME} logo`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${APP_NAME} — Your Local Marketplace`,
    description: APP_DESCRIPTION,
    images: ["/brand/boda-og.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

/**
 * Schema.org data for Google: who runs the site (name, logo, contact, social
 * profile) and how to search it, which can show a search box under the site's
 * Google result. https://developers.google.com/search/docs/appearance/structured-data
 */
const STRUCTURED_DATA = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${PUBLIC_APP_URL}/#organization`,
      name: APP_NAME,
      url: PUBLIC_APP_URL,
      logo: `${PUBLIC_APP_URL}/icons/icon-512.png`,
      email: SUPPORT_EMAIL,
      sameAs: [INSTAGRAM_URL],
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "customer support",
        email: SUPPORT_EMAIL,
        telephone: SUPPORT_PHONE,
        areaServed: "IN",
        availableLanguage: ["en"],
      },
    },
    {
      "@type": "WebSite",
      "@id": `${PUBLIC_APP_URL}/#website`,
      name: APP_NAME,
      url: PUBLIC_APP_URL,
      description: APP_DESCRIPTION,
      publisher: { "@id": `${PUBLIC_APP_URL}/#organization` },
      inLanguage: "en-IN",
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: `${PUBLIC_APP_URL}${ROUTES.search}?q={search_term_string}`,
        },
        "query-input": "required name=search_term_string",
      },
    },
  ],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // Lets the app draw under the iPhone home indicator; the bottom tab bar
  // pads itself with env(safe-area-inset-bottom).
  viewportFit: "cover",
  // The app opens in light mode regardless of the phone's setting.
  themeColor: "#ffffff",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: STORE_MODE_BOOT_SCRIPT }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(STRUCTURED_DATA) }}
        />
      </head>
      <body className="flex min-h-full flex-col">
        <ThemeProvider>
          <QueryProvider>
            <Header />
            <main className="flex-1">{children}</main>
            <FooterGate>
              <Footer />
            </FooterGate>
            <MobileTabBar />
            {/* On phones, keep toasts above the bottom tab bar. */}
            <Toaster mobileOffset={{ bottom: "calc(4.5rem + env(safe-area-inset-bottom))" }} />
            <NotificationsListener />
          </QueryProvider>
        </ThemeProvider>
        {/* Vercel Web Analytics without the @vercel/analytics package: Vercel serves this
            script from the site itself, and it tracks client-side navigations on its own.
            Only rendered in Vercel builds — elsewhere the path doesn't exist. */}
        {process.env.VERCEL === "1" && (
          <>
            <Script id="vercel-analytics-queue" strategy="afterInteractive">
              {"window.va = window.va || function () { (window.vaq = window.vaq || []).push(arguments); };"}
            </Script>
            <Script src="/_vercel/insights/script.js" strategy="afterInteractive" />
          </>
        )}
      </body>
    </html>
  );
}
