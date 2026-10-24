"use client";

import { useState, type KeyboardEvent } from "react";
import Link from "next/link";
import { AlertTriangle, CheckCircle2, Info, Loader2, ScanBarcode, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";
import type { BarcodeLookupResult } from "../api";
import { useBarcodeLookup } from "../hooks";
import { BarcodeScannerDialog } from "./barcode-scanner-dialog";

interface BarcodeLookupPanelProps {
  storeId: string;
  /** Open the camera straight away (the "Scan barcode" shortcut on the products page). */
  autoScan?: boolean;
  /** Receives every lookup result, including "not found" (to fill in just the barcode). */
  onResult: (result: BarcodeLookupResult) => void;
}

/**
 * "Scan or type a barcode" box for the add-product form. Looks the code up on
 * BODA, then Open Food Facts, and hands the result to the form to pre-fill.
 * USB/Bluetooth scanners type the code and press Enter, so Enter looks it up
 * here instead of submitting the product form.
 */
export function BarcodeLookupPanel({ storeId, autoScan = false, onResult }: BarcodeLookupPanelProps) {
  const [code, setCode] = useState("");
  const [scannerOpen, setScannerOpen] = useState(autoScan);
  const [result, setResult] = useState<BarcodeLookupResult | null>(null);
  const lookup = useBarcodeLookup(storeId);

  function runLookup(raw: string) {
    const barcode = raw.trim();
    if (!barcode) return;
    setCode(barcode);
    lookup.mutate(barcode, {
      onSuccess: (data) => {
        setResult(data);
        onResult(data);
      },
    });
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.preventDefault();
      runLookup(code);
    }
  }

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-dashed border-primary/40 bg-primary/5 p-4">
      <div>
        <p className="text-sm font-medium text-foreground">Add faster with a barcode</p>
        <p className="text-xs text-muted-foreground">
          Scan with your camera or a barcode scanner, or type the number. We&apos;ll fill in the
          details we can find — you just add the price and stock.
        </p>
      </div>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="e.g. 8901058851298"
          inputMode="numeric"
          autoComplete="off"
          aria-label="Barcode"
          className="bg-background sm:flex-1"
        />
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            className="flex-1 gap-2 bg-background sm:flex-none"
            disabled={!code.trim() || lookup.isPending}
            onClick={() => runLookup(code)}
          >
            {lookup.isPending ? <Loader2 className="size-4 animate-spin" /> : <Search className="size-4" />}
            Look up
          </Button>
          <Button type="button" className="flex-1 gap-2 sm:flex-none" onClick={() => setScannerOpen(true)}>
            <ScanBarcode className="size-4" />
            Scan
          </Button>
        </div>
      </div>

      {result && !lookup.isPending && <LookupMessage result={result} />}

      <BarcodeScannerDialog open={scannerOpen} onOpenChange={setScannerOpen} onDetected={runLookup} />
    </div>
  );
}

function LookupMessage({ result }: { result: BarcodeLookupResult }) {
  const found = result.suggestion !== null;
  const Icon = found ? CheckCircle2 : Info;
  return (
    <div className="flex flex-col gap-2 text-sm" role="status">
      {result.existingProduct && (
        <p className="flex items-start gap-2 text-amber-700 dark:text-amber-400">
          <AlertTriangle className="mt-0.5 size-4 shrink-0" />
          <span>
            You already sell this item as &quot;{result.existingProduct.name}&quot;.{" "}
            <Link
              href={ROUTES.sellerProductEdit(result.existingProduct.id)}
              className="font-medium underline underline-offset-2"
            >
              Edit that product
            </Link>{" "}
            instead of adding it twice.
          </span>
        </p>
      )}
      <p className={cn("flex items-start gap-2", found ? "text-emerald-700 dark:text-emerald-400" : "text-muted-foreground")}>
        <Icon className="mt-0.5 size-4 shrink-0" />
        <span>
          {result.source === "boda" &&
            "Found on BODA — details filled in below. Check them, then add your price and stock."}
          {result.source === "openfoodfacts" &&
            "Found on Open Food Facts — details filled in below. Please check them, then add your price and stock."}
          {result.source === null &&
            `We couldn't fetch details for ${result.barcode}. The barcode is filled in — please enter the rest manually.`}
        </span>
      </p>
      {result.attribution && <p className="text-xs text-muted-foreground">{result.attribution}</p>}
    </div>
  );
}
