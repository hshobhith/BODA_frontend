"use client";

import { useEffect, useEffectEvent, useRef, useState } from "react";
import { CameraOff, Loader2 } from "lucide-react";
import type { IScannerControls } from "@zxing/browser";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface BarcodeScannerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Called once with the decoded barcode; the dialog closes itself. */
  onDetected: (code: string) => void;
}

/** Camera barcode scanner (EAN/UPC product codes, plus Code 128 shelf labels). */
export function BarcodeScannerDialog({ open, onOpenChange, onDetected }: BarcodeScannerDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Scan barcode</DialogTitle>
          <DialogDescription>Hold the barcode steady inside the frame.</DialogDescription>
        </DialogHeader>
        {/* Mounted only while open, so the camera stops as soon as the dialog closes. */}
        {open && (
          <ScannerView
            onDetected={(code) => {
              onOpenChange(false);
              onDetected(code);
            }}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

function cameraErrorMessage(error: unknown): string {
  const name = (error as { name?: string } | undefined)?.name;
  if (name === "NotAllowedError" || name === "SecurityError") {
    return "Camera access was blocked. Allow the camera for this site in your browser settings, or type the barcode instead.";
  }
  if (name === "NotFoundError" || name === "OverconstrainedError") {
    return "No camera was found on this device. Type the barcode, or use a USB barcode scanner.";
  }
  if (name === "NotReadableError") {
    return "The camera is being used by another app. Close it and try again.";
  }
  return "Couldn't start the camera. Type the barcode instead.";
}

function ScannerView({ onDetected }: { onDetected: (code: string) => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [starting, setStarting] = useState(true);
  const handleDetected = useEffectEvent(onDetected);

  useEffect(() => {
    let controls: IScannerControls | undefined;
    let cancelled = false;

    async function start() {
      if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) {
        setError("The camera only works on a secure (https) connection. Type the barcode instead.");
        setStarting(false);
        return;
      }
      // Loaded on demand: the decoder is only needed by sellers adding products.
      const [{ BrowserMultiFormatReader }, { BarcodeFormat, DecodeHintType }] = await Promise.all([
        import("@zxing/browser"),
        import("@zxing/library"),
      ]);
      const hints = new Map([
        [
          DecodeHintType.POSSIBLE_FORMATS,
          [BarcodeFormat.EAN_13, BarcodeFormat.EAN_8, BarcodeFormat.UPC_A, BarcodeFormat.UPC_E, BarcodeFormat.CODE_128],
        ],
      ]);
      const reader = new BrowserMultiFormatReader(hints, { delayBetweenScanAttempts: 150 });
      try {
        controls = await reader.decodeFromConstraints(
          { video: { facingMode: { ideal: "environment" } } },
          videoRef.current!,
          (result, _error, scanControls) => {
            if (!result) return;
            scanControls.stop();
            navigator.vibrate?.(80);
            handleDetected(result.getText());
          }
        );
        if (cancelled) controls.stop();
      } catch (err) {
        if (!cancelled) setError(cameraErrorMessage(err));
      } finally {
        if (!cancelled) setStarting(false);
      }
    }

    void start();
    return () => {
      cancelled = true;
      controls?.stop();
    };
  }, []);

  if (error) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed px-4 py-8 text-center">
        <CameraOff className="size-8 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">{error}</p>
      </div>
    );
  }

  return (
    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg bg-black">
      <video ref={videoRef} className="size-full object-cover" muted playsInline />
      {/* Aiming guide */}
      <div className="pointer-events-none absolute inset-x-[12%] top-1/2 h-1/3 -translate-y-1/2 rounded-md border-2 border-white/80 shadow-[0_0_0_9999px_rgba(0,0,0,0.35)]" />
      {starting && (
        <div className="absolute inset-0 flex items-center justify-center gap-2 text-sm text-white">
          <Loader2 className="size-4 animate-spin" />
          Starting camera…
        </div>
      )}
    </div>
  );
}
