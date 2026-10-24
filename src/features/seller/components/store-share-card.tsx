"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { Check, Clock, Copy, Download, Globe, Loader2, Lock, Palette, Share2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SITE_URL } from "@/constants/config";
import { ROUTES } from "@/constants/routes";
import type { Store } from "@/types/store";
import type { BannerLinkKind } from "../store-banner";
import { StoreBannerCanvas, useStoreBannerContent } from "./store-banner-canvas";
import { StoreBannerDialog, useBannerExport, type BannerSettings } from "./store-banner-dialog";

interface StoreShareCardProps {
  store: Store;
}

/**
 * Dashboard card for promoting the selected store, with two kinds of link:
 *   - public: the normal storefront (`/stores/<slug>`); customers can go on
 *     to browse the rest of BODA.
 *   - private: `/s/<slug>`, which opens the store in store-only mode — the
 *     whole site stays on this store (see `src/lib/store-mode.ts`). Meant
 *     for table QR codes at restaurants and hotels.
 * Each tab has its own link, plain QR code and promo banner. Everything is
 * derived from `store.slug`, so it follows the store switcher — the
 * dashboard keys this card by store id.
 */
export function StoreShareCard({ store }: StoreShareCardProps) {
  const [linkKind, setLinkKind] = useState<BannerLinkKind>("public");
  // Banner style choices carry across both tabs.
  const [settings, setSettings] = useState<BannerSettings>({ format: "square", theme: "midnight", variant: 0 });
  const isLive = store.approvalStatus === "approved";

  return (
    <Card>
      <CardHeader>
        <CardTitle>Share your store</CardTitle>
        <CardDescription>
          Customers who scan the code or open the link land on {store.name} and see everything you
          sell.
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-5">
        {!isLive && (
          <div className="flex items-start gap-2 rounded-lg bg-amber-500/10 px-3 py-2 text-sm text-amber-800 dark:text-amber-300">
            <Clock className="mt-0.5 size-4 shrink-0" />
            <p>
              This store isn&apos;t public yet. You can prepare the links and banners now;
              they&apos;ll open your storefront once it&apos;s approved.
            </p>
          </div>
        )}

        <Tabs value={linkKind} onValueChange={(value) => setLinkKind(value as BannerLinkKind)}>
          <TabsList>
            <TabsTrigger value="public" className="gap-1.5">
              <Globe className="size-4" />
              Public link
            </TabsTrigger>
            <TabsTrigger value="private" className="gap-1.5">
              <Lock className="size-4" />
              Private link
            </TabsTrigger>
          </TabsList>
          <TabsContent value="public" className="pt-3">
            <ShareLinkPanel store={store} kind="public" settings={settings} onSettingsChange={setSettings} />
          </TabsContent>
          <TabsContent value="private" className="pt-3">
            <ShareLinkPanel store={store} kind="private" settings={settings} onSettingsChange={setSettings} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

const LINK_LABEL: Record<BannerLinkKind, string> = {
  public: "Public store link",
  private: "Private store link",
};

interface ShareLinkPanelProps {
  store: Store;
  kind: BannerLinkKind;
  settings: BannerSettings;
  onSettingsChange: (settings: BannerSettings) => void;
}

function ShareLinkPanel({ store, kind, settings, onSettingsChange }: ShareLinkPanelProps) {
  const path = kind === "private" ? ROUTES.storeOnly(store.slug) : ROUTES.storeDetail(store.slug);
  const shareUrl = `${SITE_URL}${path}`;
  const fileSuffix = kind === "private" ? "-private" : "";
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [bannerOpen, setBannerOpen] = useState(false);
  const bannerContent = useStoreBannerContent(store, shareUrl, kind);
  const bannerExport = useBannerExport(store.name, shareUrl);
  const canShareLink = typeof navigator !== "undefined" && typeof navigator.share === "function";
  // The tile always previews (and quick-downloads) the square post; other
  // sizes are picked in the dialog.
  const squareSettings: BannerSettings = { ...settings, format: "square" };

  useEffect(() => {
    let cancelled = false;

    // Large enough to print sharply; displayed scaled down.
    QRCode.toDataURL(shareUrl, { width: 1024, margin: 2, errorCorrectionLevel: "M" })
      .then((dataUrl) => {
        if (!cancelled) setQrDataUrl(dataUrl);
      })
      .catch(() => {
        if (!cancelled) toast.error("Could not generate a QR code for your store link.");
      });

    return () => {
      cancelled = true;
    };
  }, [shareUrl]);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success("Store link copied.");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Couldn't copy the link. Copy it manually instead.");
    }
  }

  async function handleShare() {
    try {
      await navigator.share({ title: store.name, text: `${store.name} is now on BODA!`, url: shareUrl });
    } catch {
      // User cancelled the share sheet — not an error worth surfacing.
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,300px)]">
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium text-foreground">{LINK_LABEL[kind]}</p>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Input
                readOnly
                value={shareUrl}
                aria-label={LINK_LABEL[kind]}
                className="font-mono text-sm"
                onFocus={(e) => e.target.select()}
              />
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={handleCopy} className="gap-1.5">
                  {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
                  Copy
                </Button>
                {canShareLink && (
                  <Button type="button" variant="outline" onClick={handleShare} className="gap-1.5">
                    <Share2 className="size-4" />
                    Share
                  </Button>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {qrDataUrl ? (
              // eslint-disable-next-line @next/next/no-img-element -- generated data: URI, not an optimizable remote image
              <img
                src={qrDataUrl}
                alt={`QR code linking to ${store.name}`}
                width={112}
                height={112}
                className="size-28 shrink-0 rounded-lg border bg-white p-1.5"
              />
            ) : (
              <Skeleton className="size-28 shrink-0 rounded-lg" />
            )}
            <div className="flex flex-col items-start gap-2">
              <div>
                <p className="text-sm font-medium text-foreground">QR code</p>
                <p className="text-sm text-muted-foreground">
                  {kind === "private"
                    ? "Just the code — stick it on tables, menus or room cards."
                    : "Just the code — for packaging, bills or your own designs."}
                </p>
              </div>
              {qrDataUrl ? (
                <Button type="button" variant="outline" size="sm" asChild>
                  <a href={qrDataUrl} download={`${store.slug}${fileSuffix}-qr-code.png`} className="gap-1.5">
                    <Download className="size-4" />
                    Download QR
                  </a>
                </Button>
              ) : (
                <Skeleton className="h-7 w-32" />
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={() => setBannerOpen(true)}
            aria-label="Open the promo banner editor"
            className="group relative overflow-hidden rounded-lg outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <StoreBannerCanvas
              content={bannerContent}
              options={squareSettings}
              previewWidth={300}
              className="ring-1 ring-foreground/10 transition-transform duration-300 group-hover:scale-[1.02]"
            />
          </button>
          <div className="flex gap-2">
            <Button
              type="button"
              className="flex-1 gap-1.5"
              disabled={!bannerContent || bannerExport.busy !== null}
              onClick={() => bannerExport.run("download", bannerContent, squareSettings)}
            >
              {bannerExport.busy ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
              Download
            </Button>
            <Button type="button" variant="outline" className="flex-1 gap-1.5" onClick={() => setBannerOpen(true)}>
              <Palette className="size-4" />
              Customize
            </Button>
          </div>
        </div>
      </div>

      <StoreBannerDialog
        open={bannerOpen}
        onOpenChange={setBannerOpen}
        storeName={store.name}
        shareUrl={shareUrl}
        content={bannerContent}
        settings={settings}
        onSettingsChange={onSettingsChange}
      />
    </div>
  );
}
