"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { Loader2, LocateFixed, MapPin } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useGeolocation } from "@/hooks/use-geolocation";
import { apiClient } from "@/services/api-client";

import "leaflet/dist/leaflet.css";

// Leaflet touches `window` on import, so the map itself is client-only —
// this dialog's trigger button still renders fine during static generation.
const LocationPickerMap = dynamic(() => import("./location-picker-map"), {
  ssr: false,
  loading: () => (
    <div className="flex h-80 items-center justify-center rounded-lg border">
      <Loader2 className="size-5 animate-spin text-muted-foreground" />
    </div>
  ),
});

// Fallback center (Bangalore) used when neither a saved value nor the
// browser's geolocation is available — matches the default already used by
// the address/store forms before this picker existed.
const DEFAULT_CENTER = { lat: 12.9716, lng: 77.5946 };

export interface LocationPickerResult {
  lat: number;
  lng: number;
  line1: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
}

interface LocationPickerDialogProps {
  value: { lat: number; lng: number } | null;
  onConfirm: (result: LocationPickerResult) => void;
  triggerLabel?: string;
}

interface NominatimAddress {
  house_number?: string;
  road?: string;
  neighbourhood?: string;
  suburb?: string;
  city?: string;
  town?: string;
  village?: string;
  county?: string;
  state?: string;
  country?: string;
  postcode?: string;
}

interface NominatimResult {
  lat: string;
  lon: string;
  display_name: string;
  address?: NominatimAddress;
}

function parseNominatimAddress(
  address: NominatimAddress | undefined
): Omit<LocationPickerResult, "lat" | "lng"> {
  if (!address) {
    return { line1: "", city: "", state: "", country: "", pincode: "" };
  }
  const line1 =
    [address.house_number, address.road].filter(Boolean).join(" ") ||
    address.neighbourhood ||
    address.suburb ||
    "";
  return {
    line1,
    city: address.city || address.town || address.village || address.county || "",
    state: address.state || "",
    country: address.country || "",
    pincode: address.postcode || "",
  };
}

// Routed through our own backend (`/geocoding/*`) rather than calling
// Nominatim directly from the browser: Nominatim's public API sends no
// `Access-Control-Allow-Origin` header, so a browser `fetch()` to it is
// silently blocked by CORS (the request never comes back as an error the UI
// can show — suggestions just never appear). The backend proxy has no such
// restriction and can set the identifying User-Agent Nominatim's usage
// policy requires.
async function reverseGeocode(position: { lat: number; lng: number }): Promise<NominatimResult | null> {
  const { data } = await apiClient.get<NominatimResult | null>("/geocoding/reverse", {
    params: { lat: position.lat, lng: position.lng },
  });
  return data;
}

async function searchAddress(query: string): Promise<NominatimResult[]> {
  const { data } = await apiClient.get<NominatimResult[]>("/geocoding/search", {
    params: { q: query },
  });
  return data;
}

/**
 * Dialog with a draggable-pin map for picking an address location. Defaults
 * to the browser's current position, falls back to `value` (an existing
 * saved location) or a fixed default center. Confirming reverse-geocodes the
 * pin and hands the caller a full address breakdown to fill into its own
 * form fields.
 */
export function LocationPickerDialog({
  value,
  onConfirm,
  triggerLabel = "Pick location on map",
}: LocationPickerDialogProps) {
  const [open, setOpen] = useState(false);
  const [pin, setPin] = useState(value ?? DEFAULT_CENTER);
  const [resolved, setResolved] = useState<Omit<LocationPickerResult, "lat" | "lng"> | null>(null);
  const [isResolving, setIsResolving] = useState(false);
  const [resolveError, setResolveError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<NominatimResult[]>([]);
  const geolocation = useGeolocation();
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const initialCenter = useMemo(() => {
    if (value) return value;
    if (geolocation.status === "success" && geolocation.lat !== null && geolocation.lng !== null) {
      return { lat: geolocation.lat, lng: geolocation.lng };
    }
    return DEFAULT_CENTER;
  }, [value, geolocation.status, geolocation.lat, geolocation.lng]);

  const resolvePosition = useCallback(async (position: { lat: number; lng: number }) => {
    setIsResolving(true);
    setResolveError(null);
    try {
      const result = await reverseGeocode(position);
      setResolved(parseNominatimAddress(result?.address));
      if (!result) {
        setResolveError(
          "Couldn't look up an address for this point — you can still confirm and fill the details in manually."
        );
      }
    } catch {
      setResolved({ line1: "", city: "", state: "", country: "", pincode: "" });
      setResolveError(
        "Couldn't reach the address lookup service — you can still confirm and fill the details in manually."
      );
    } finally {
      setIsResolving(false);
    }
  }, []);

  function handleOpenChange(nextOpen: boolean) {
    if (nextOpen) {
      setPin(initialCenter);
      setResolved(null);
      setResolveError(null);
      setQuery("");
      setSuggestions([]);
      void resolvePosition(initialCenter);
    }
    setOpen(nextOpen);
  }

  function handlePinChange(next: { lat: number; lng: number }) {
    setPin(next);
    void resolvePosition(next);
  }

  function handleQueryChange(nextQuery: string) {
    setQuery(nextQuery);
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }
    if (nextQuery.trim().length < 3) {
      setSuggestions([]);
      return;
    }
    searchTimeout.current = setTimeout(() => {
      void searchAddress(nextQuery).then(setSuggestions);
    }, 400);
  }

  function handleSuggestionSelect(result: NominatimResult) {
    const next = { lat: parseFloat(result.lat), lng: parseFloat(result.lon) };
    setPin(next);
    setResolved(parseNominatimAddress(result.address));
    setResolveError(null);
    setSuggestions([]);
    setQuery(result.display_name);
  }

  function handleUseCurrentLocation() {
    if (geolocation.status !== "success" || geolocation.lat === null || geolocation.lng === null) {
      geolocation.request();
      return;
    }
    const next = { lat: geolocation.lat, lng: geolocation.lng };
    setPin(next);
    void resolvePosition(next);
  }

  function handleConfirm() {
    if (!resolved) return;
    onConfirm({ ...resolved, lat: pin.lat, lng: pin.lng });
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" size="sm" className="w-fit gap-1.5">
          <MapPin className="size-3.5" /> {triggerLabel}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Pick a location</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-3">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                placeholder="Search for an address"
                value={query}
                onChange={(event) => handleQueryChange(event.target.value)}
              />
              {suggestions.length > 0 && (
                <ul className="absolute z-10 mt-1 w-full rounded-lg border bg-popover text-sm shadow-md">
                  {suggestions.map((result) => (
                    <li key={`${result.lat}-${result.lon}`}>
                      <button
                        type="button"
                        className="block w-full px-3 py-2 text-left hover:bg-muted"
                        onClick={() => handleSuggestionSelect(result)}
                      >
                        {result.display_name}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <Button
              type="button"
              variant="outline"
              size="icon"
              title="Use current location"
              onClick={handleUseCurrentLocation}
              disabled={geolocation.status === "loading"}
            >
              {geolocation.status === "loading" ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <LocateFixed className="size-4" />
              )}
            </Button>
          </div>

          <LocationPickerMap position={pin} onChange={handlePinChange} />

          <p className="text-sm text-muted-foreground">
            {isResolving
              ? "Resolving address…"
              : resolved
                ? [resolved.line1, resolved.city, resolved.state, resolved.pincode]
                    .filter(Boolean)
                    .join(", ") || "Location set — fill in the address details manually below."
                : "Drag the pin, search, or tap the map to set a location."}
          </p>
          {resolveError && <p className="text-sm text-destructive">{resolveError}</p>}
        </div>

        <DialogFooter>
          <Button type="button" onClick={handleConfirm} disabled={!resolved || isResolving}>
            Confirm this location
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
