"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useWatch, type UseFormReturn } from "react-hook-form";
import { CheckCircle2, Keyboard, Loader2, LocateFixed, MapPin, TriangleAlert } from "lucide-react";

import {
  LocationPickerDialog,
  LocationPreviewMap,
  parseNominatimAddress,
  reverseGeocode,
  searchAddress,
  type LocationPickerResult,
} from "@/components/shared/location-picker";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { StoreFormValues } from "../schemas";

type AddressFields = Pick<StoreFormValues, "addressLine" | "city" | "state" | "country" | "pincode">;

type Notice = { tone: "success" | "warning"; text: string } | null;

const ADDRESS_FIELDS = ["addressLine", "city", "state", "country", "pincode"] as const;

// Precise fix, never a cached one: this is where customers will be sent.
const GPS_OPTIONS: PositionOptions = { enableHighAccuracy: true, timeout: 15_000, maximumAge: 0 };

/** Wait this long after the seller stops typing before looking the address up. */
const ADDRESS_LOOKUP_DELAY_MS = 1200;

/** A looked-up address this close to the current pin keeps the pin: a GPS or
 * hand-placed pin is more precise than a street-level lookup, so small edits
 * (adding a shop number, fixing a typo) shouldn't drag it away. */
const KEEP_PIN_WITHIN_KM = 0.25;

function addressKey(address: AddressFields) {
  return ADDRESS_FIELDS.map((field) => (address[field] ?? "").trim().toLowerCase()).join("|");
}

/** Enough to find a place: a pincode, or a street plus its city. */
function isLookupable(address: AddressFields) {
  return (
    address.pincode.trim().length >= 6 ||
    (address.addressLine.trim().length >= 3 && address.city.trim().length >= 2)
  );
}

function distanceKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.sqrt(h));
}

function geolocationErrorMessage(error: GeolocationPositionError) {
  if (error.code === error.PERMISSION_DENIED) {
    return "Location access is blocked. Allow it for this site in your browser settings, or pick the spot on the map instead.";
  }
  if (error.code === error.TIMEOUT) {
    return "Finding your location took too long. Try again near a window, or pick the spot on the map.";
  }
  return "Couldn't get your location. Try again, or pick the spot on the map.";
}

/**
 * Keeps a store's map pin and its written address in agreement — they're the
 * two halves of one location: the address is what customers read on the store
 * page, the pin is where "open in Maps" and the nearby-stores search take them.
 *
 * - Current location / map pick → the address fields are filled from the pin.
 * - The seller types or edits the address → it's looked up and the pin moves
 *   to match (unless it's already right there; see KEEP_PIN_WITHIN_KM).
 * - `flush()` runs any pending lookup immediately; call it before saving so a
 *   just-typed address can't be saved with the old pin.
 */
export function useStoreLocation(form: UseFormReturn<StoreFormValues>) {
  const [isLocating, setIsLocating] = useState(false);
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [notice, setNotice] = useState<Notice>(null);
  // A new store starts with just the location buttons; the address fields
  // appear once a location is set or the seller chooses to type it.
  const [showAddressFields, setShowAddressFields] = useState(() => {
    const values = form.getValues();
    return typeof values.lat === "number" || !!values.addressLine?.trim();
  });

  const watched = useWatch({ control: form.control, name: ADDRESS_FIELDS });
  const lat = useWatch({ control: form.control, name: "lat" });
  const lng = useWatch({ control: form.control, name: "lng" });
  const address: AddressFields = {
    addressLine: watched[0] ?? "",
    city: watched[1] ?? "",
    state: watched[2] ?? "",
    country: watched[3] ?? "",
    pincode: watched[4] ?? "",
  };
  const currentKey = addressKey(address);

  // The address the pin was last matched to. Starts as the saved address, so
  // opening the settings of an existing store doesn't trigger a lookup.
  const syncedKey = useRef(addressKey(form.getValues()));
  const lookupTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const setPin = useCallback(
    (position: { lat: number; lng: number }) => {
      const opts = { shouldValidate: true, shouldDirty: true } as const;
      form.setValue("lat", position.lat, opts);
      form.setValue("lng", position.lng, opts);
    },
    [form]
  );

  /** Fills the address fields from a pin lookup; blanks in the lookup keep what was there. */
  const fillAddress = useCallback(
    (resolved: Omit<LocationPickerResult, "lat" | "lng">) => {
      const opts = { shouldValidate: true, shouldDirty: true } as const;
      const current = form.getValues();
      form.setValue("addressLine", resolved.line1 || current.addressLine, opts);
      form.setValue("city", resolved.city || current.city, opts);
      form.setValue("state", resolved.state || current.state, opts);
      form.setValue("country", resolved.country || current.country, opts);
      form.setValue("pincode", resolved.pincode || current.pincode, opts);
      syncedKey.current = addressKey(form.getValues());
    },
    [form]
  );

  /** Looks the typed address up and moves the pin to it. */
  const matchPinToAddress = useCallback(async () => {
    const values = form.getValues();
    const key = addressKey(values);
    if (key === syncedKey.current || !isLookupable(values)) return;

    const area = [values.city, values.state, values.pincode, values.country].filter(Boolean).join(", ");
    setIsLookingUp(true);
    try {
      // Full address first; if that's too specific for the map data, the area alone.
      let results = await searchAddress([values.addressLine, area].filter(Boolean).join(", "));
      if (results.length === 0 && area) results = await searchAddress(area);
      // The seller kept typing while we looked — a newer lookup will follow.
      if (addressKey(form.getValues()) !== key) return;
      syncedKey.current = key;

      if (results.length === 0) {
        setNotice({
          tone: "warning",
          text: "We couldn't find this address on the map. Use “Adjust pin on map” to place your store yourself.",
        });
        return;
      }
      const found = { lat: parseFloat(results[0].lat), lng: parseFloat(results[0].lon) };
      const pin = form.getValues();
      const hasPin = typeof pin.lat === "number" && typeof pin.lng === "number";
      if (hasPin && distanceKm({ lat: pin.lat, lng: pin.lng }, found) <= KEEP_PIN_WITHIN_KM) {
        setNotice({ tone: "success", text: "Address and map pin match." });
        return;
      }
      setPin(found);
      setNotice({
        tone: "success",
        text: "Map pin moved to match your address. Check it's on your store, and adjust it if needed.",
      });
    } catch {
      setNotice({
        tone: "warning",
        text: "Couldn't check this address right now. Use “Adjust pin on map” to make sure the pin is on your store.",
      });
    } finally {
      setIsLookingUp(false);
    }
  }, [form, setPin]);

  // Typing in the address fields → look it up once the seller pauses.
  useEffect(() => {
    if (currentKey === syncedKey.current) return;
    if (lookupTimer.current) clearTimeout(lookupTimer.current);
    lookupTimer.current = setTimeout(() => void matchPinToAddress(), ADDRESS_LOOKUP_DELAY_MS);
    return () => {
      if (lookupTimer.current) clearTimeout(lookupTimer.current);
    };
  }, [currentKey, matchPinToAddress]);

  const flush = useCallback(async () => {
    if (lookupTimer.current) clearTimeout(lookupTimer.current);
    await matchPinToAddress();
  }, [matchPinToAddress]);

  const locateMe = useCallback(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setNotice({
        tone: "warning",
        text: "This browser can't share your location. Pick the spot on the map or type the address.",
      });
      return;
    }
    setIsLocating(true);
    setNotice(null);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const pin = { lat: position.coords.latitude, lng: position.coords.longitude };
        setPin(pin);
        try {
          const result = await reverseGeocode(pin);
          fillAddress(parseNominatimAddress(result?.address));
          setNotice({
            tone: "success",
            text: result
              ? "Location found and address filled in. Add your shop number or a landmark if it's missing."
              : "Location found, but we couldn't read an address for it. Please type the address below.",
          });
        } catch {
          syncedKey.current = addressKey(form.getValues());
          setNotice({
            tone: "warning",
            text: "Location found, but the address lookup failed. Please type the address below.",
          });
        } finally {
          setShowAddressFields(true);
          setIsLocating(false);
        }
      },
      (error) => {
        setIsLocating(false);
        setNotice({ tone: "warning", text: geolocationErrorMessage(error) });
      },
      GPS_OPTIONS
    );
  }, [fillAddress, form, setPin]);

  const applyMapPick = useCallback(
    (result: LocationPickerResult) => {
      setPin({ lat: result.lat, lng: result.lng });
      fillAddress(result);
      setShowAddressFields(true);
      setNotice({
        tone: "success",
        text: "Pin placed and address filled in. Check the details below.",
      });
    },
    [fillAddress, setPin]
  );

  return {
    pin: typeof lat === "number" && typeof lng === "number" ? { lat, lng } : null,
    isLocating,
    isLookingUp,
    notice,
    showAddressFields,
    revealAddressFields: () => setShowAddressFields(true),
    locateMe,
    applyMapPick,
    flush,
  };
}

export type StoreLocation = ReturnType<typeof useStoreLocation>;

interface StoreLocationSectionProps {
  form: UseFormReturn<StoreFormValues>;
  location: StoreLocation;
  /** Prefix for input ids, so two forms on one page don't collide. */
  idPrefix?: string;
}

/**
 * The "where is your store" step: current location first (one tap, nothing to
 * type), then the map or a typed address as fallbacks. Whichever is used, the
 * pin and the address are kept matching — see `useStoreLocation`.
 */
export function StoreLocationSection({ form, location, idPrefix = "" }: StoreLocationSectionProps) {
  const { errors } = form.formState;
  const locationError = errors.lat ?? errors.lng;
  const { pin, notice } = location;
  // Never hide a field that has an error the seller needs to fix.
  const showAddressFields =
    location.showAddressFields || ADDRESS_FIELDS.some((field) => !!errors[field]);

  const currentLocationButton = (
    <Button
      type="button"
      onClick={location.locateMe}
      disabled={location.isLocating}
      variant={pin ? "outline" : "default"}
      size={pin ? "sm" : "lg"}
      className={cn("gap-2", !pin && "w-full sm:w-auto")}
    >
      {location.isLocating ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <LocateFixed className="size-4" />
      )}
      {location.isLocating
        ? "Finding your location…"
        : pin
          ? "Use my current location again"
          : "Use my current location"}
    </Button>
  );

  return (
    <section
      className={cn(
        "flex flex-col gap-4 rounded-xl border p-4 sm:p-5",
        locationError && "border-destructive"
      )}
      aria-labelledby={`${idPrefix}location-heading`}
    >
      <div className="flex items-start gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          <MapPin className="size-4.5" />
        </span>
        <div className="flex flex-col gap-0.5">
          <h3 id={`${idPrefix}location-heading`} className="font-semibold text-foreground">
            Store location
          </h3>
          <p className="text-sm text-muted-foreground">
            {pin
              ? "This is where customers will find you. The address and the pin always match."
              : "Easiest way: stand inside your store and tap the button. We'll fill in the address for you."}
          </p>
        </div>
      </div>

      {pin ? (
        <div className="flex flex-col gap-3">
          <div className="overflow-hidden rounded-lg border">
            <LocationPreviewMap position={pin} />
          </div>
          <div className="flex flex-wrap gap-2">
            {currentLocationButton}
            <LocationPickerDialog
              value={pin}
              triggerLabel="Adjust pin on map"
              onConfirm={location.applyMapPick}
            />
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {currentLocationButton}
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <span>Not at your store right now?</span>
            <LocationPickerDialog
              value={null}
              triggerLabel="Pick it on the map"
              triggerVariant="ghost"
              onConfirm={location.applyMapPick}
            />
            {!showAddressFields && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="gap-1.5"
                onClick={location.revealAddressFields}
              >
                <Keyboard className="size-3.5" />
                Type the address
              </Button>
            )}
          </div>
        </div>
      )}

      {(notice || location.isLookingUp) && (
        <p
          className={cn(
            "flex items-start gap-2 rounded-md px-3 py-2 text-sm",
            location.isLookingUp || notice?.tone === "success"
              ? "bg-primary/5 text-foreground"
              : "bg-amber-500/10 text-amber-900 dark:text-amber-200"
          )}
          role="status"
        >
          {location.isLookingUp ? (
            <Loader2 className="mt-0.5 size-4 shrink-0 animate-spin" />
          ) : notice?.tone === "success" ? (
            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
          ) : (
            <TriangleAlert className="mt-0.5 size-4 shrink-0" />
          )}
          {location.isLookingUp ? "Finding this address on the map…" : notice?.text}
        </p>
      )}

      {showAddressFields && (
        <div className="flex flex-col gap-4 border-t pt-4">
          <Field data-invalid={!!errors.addressLine}>
            <FieldLabel htmlFor={`${idPrefix}addressLine`}>Address</FieldLabel>
            <Input
              id={`${idPrefix}addressLine`}
              placeholder="Shop no., building, street, landmark"
              {...form.register("addressLine")}
            />
            <FieldError errors={[errors.addressLine]} />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field data-invalid={!!errors.city}>
              <FieldLabel htmlFor={`${idPrefix}city`}>City</FieldLabel>
              <Input id={`${idPrefix}city`} {...form.register("city")} />
              <FieldError errors={[errors.city]} />
            </Field>
            <Field data-invalid={!!errors.pincode}>
              <FieldLabel htmlFor={`${idPrefix}pincode`}>Pincode</FieldLabel>
              <Input id={`${idPrefix}pincode`} inputMode="numeric" {...form.register("pincode")} />
              <FieldError errors={[errors.pincode]} />
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field data-invalid={!!errors.state}>
              <FieldLabel htmlFor={`${idPrefix}state`}>State</FieldLabel>
              <Input id={`${idPrefix}state`} {...form.register("state")} />
              <FieldError errors={[errors.state]} />
            </Field>
            <Field data-invalid={!!errors.country}>
              <FieldLabel htmlFor={`${idPrefix}country`}>Country</FieldLabel>
              <Input id={`${idPrefix}country`} {...form.register("country")} />
              <FieldError errors={[errors.country]} />
            </Field>
          </div>

          <p className="text-xs text-muted-foreground">
            Changed the address? We&apos;ll move the map pin to match it automatically.
          </p>
        </div>
      )}

      {locationError && (
        <p className="text-sm text-destructive" role="alert">
          {locationError.message}
        </p>
      )}
    </section>
  );
}
