"use client";

import { useState } from "react";
import { Download, Loader2, Share2, Shuffle } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import {
  BANNER_FORMATS,
  BANNER_THEMES,
  downloadFile,
  exportStoreBanner,
  type BannerContent,
  type BannerFormat,
  type BannerOptions,
  type BannerThemeId,
} from "../store-banner";
import { StoreBannerCanvas } from "./store-banner-canvas";

export type BannerSettings = Omit<BannerOptions, "scale">;

/** Max preview height, so tall formats still fit the dialog on a laptop screen. */
const PREVIEW_MAX_VH = 62;

function canShareFiles() {
  if (typeof navigator === "undefined" || typeof navigator.canShare !== "function") return false;
  return navigator.canShare({ files: [new File([""], "banner.png", { type: "image/png" })] });
}

/**
 * Exports the banner and either downloads it or hands it to the OS share
 * sheet (WhatsApp, Instagram, …) where the browser supports sharing files.
 */
export function useBannerExport(storeName: string, shareUrl: string) {
  const [busy, setBusy] = useState<"download" | "share" | null>(null);

  async function run(action: "download" | "share", content: BannerContent | null, settings: BannerSettings) {
    if (!content || busy) return;
    setBusy(action);
    try {
      const file = await exportStoreBanner(content, settings);
      if (action === "share" && canShareFiles()) {
        try {
          await navigator.share({
            files: [file],
            title: `${storeName} is now on BODA`,
            text: `${storeName} is now on BODA! Shop with us online: ${shareUrl}`,
          });
        } catch {
          // User closed the share sheet.
        }
      } else {
        downloadFile(file);
        toast.success("Banner downloaded.");
      }
    } catch {
      toast.error("Couldn't create the banner. Please try again.");
    } finally {
      setBusy(null);
    }
  }

  return { busy, run, canShare: canShareFiles() };
}

interface StoreBannerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  storeName: string;
  shareUrl: string;
  content: BannerContent | null;
  settings: BannerSettings;
  onSettingsChange: (settings: BannerSettings) => void;
}

export function StoreBannerDialog({
  open,
  onOpenChange,
  storeName,
  shareUrl,
  content,
  settings,
  onSettingsChange,
}: StoreBannerDialogProps) {
  const { busy, run, canShare } = useBannerExport(storeName, shareUrl);
  const format = BANNER_FORMATS[settings.format];
  const ratio = format.width / format.height;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>Promo banner</DialogTitle>
          <DialogDescription>
            Print it for your shop or post it on social media. Customers scan the code or type the
            link to reach {storeName} on BODA.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_260px]">
          <div className="flex items-center justify-center rounded-xl bg-muted/60 p-4">
            <StoreBannerCanvas
              content={content}
              options={settings}
              previewWidth={480}
              className="shadow-lg ring-1 ring-foreground/10"
              style={{ width: `min(100%, ${PREVIEW_MAX_VH * ratio}vh, 480px)` }}
            />
          </div>

          <div className="flex flex-col gap-5">
            <fieldset className="flex flex-col gap-2">
              <legend className="mb-2 text-sm font-medium text-foreground">Size</legend>
              <div role="radiogroup" aria-label="Banner size" className="flex flex-col gap-2">
                {(Object.keys(BANNER_FORMATS) as BannerFormat[]).map((id) => {
                  const option = BANNER_FORMATS[id];
                  const selected = settings.format === id;
                  return (
                    <button
                      key={id}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      onClick={() => onSettingsChange({ ...settings, format: id })}
                      className={cn(
                        "flex flex-col items-start rounded-lg border px-3 py-2 text-left transition-colors hover:bg-muted",
                        selected && "border-primary bg-accent hover:bg-accent"
                      )}
                    >
                      <span className="text-sm font-medium text-foreground">{option.label}</span>
                      <span className="text-xs text-muted-foreground">{option.hint}</span>
                    </button>
                  );
                })}
              </div>
            </fieldset>

            <fieldset className="flex flex-col gap-2">
              <legend className="mb-2 text-sm font-medium text-foreground">Style</legend>
              <div role="radiogroup" aria-label="Banner style" className="grid grid-cols-4 gap-2">
                {(Object.keys(BANNER_THEMES) as BannerThemeId[]).map((id) => {
                  const theme = BANNER_THEMES[id];
                  const selected = settings.theme === id;
                  return (
                    <button
                      key={id}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      aria-label={theme.label}
                      title={theme.label}
                      onClick={() => onSettingsChange({ ...settings, theme: id })}
                      className="group flex flex-col items-center gap-1"
                    >
                      <span
                        className={cn(
                          "size-10 rounded-full ring-1 ring-foreground/15 ring-offset-2 ring-offset-background transition-shadow",
                          selected && "ring-2 ring-primary"
                        )}
                        style={{ background: theme.swatch }}
                      />
                      <span className={cn("text-xs text-muted-foreground", selected && "font-medium text-foreground")}>
                        {theme.label}
                      </span>
                    </button>
                  );
                })}
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-2 gap-1.5"
                onClick={() => onSettingsChange({ ...settings, variant: settings.variant + 1 })}
              >
                <Shuffle className="size-4" />
                New background
              </Button>
            </fieldset>

            <div className="mt-auto flex flex-col gap-2">
              <Button type="button" className="gap-1.5" disabled={!content || busy !== null} onClick={() => run("download", content, settings)}>
                {busy === "download" ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
                Download PNG
              </Button>
              {canShare && (
                <Button
                  type="button"
                  variant="outline"
                  className="gap-1.5"
                  disabled={!content || busy !== null}
                  onClick={() => run("share", content, settings)}
                >
                  {busy === "share" ? <Loader2 className="size-4 animate-spin" /> : <Share2 className="size-4" />}
                  Share image
                </Button>
              )}
              <p className="text-xs text-muted-foreground">
                {settings.format === "poster"
                  ? "Print on A4 and put it up at your counter, door or window."
                  : "Post it on your feed or status — the QR code and link are both in the image."}
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
