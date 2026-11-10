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
import { APP_DESCRIPTION, APP_NAME, SITE_URL } from "@/constants/config";
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
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${APP_NAME} — Your Local Marketplace`,
    template: `%s | ${APP_NAME}`,
  },
  description: APP_DESCRIPTION,
  applicationName: APP_NAME,
  keywords: [
    "local marketplace",
    "multi-vendor",
    "local commerce",
    "nearby stores",
    "online shopping",
    "delivery",
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
    locale: "en_US",
    url: SITE_URL,
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
