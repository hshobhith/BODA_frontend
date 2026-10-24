"use client";

import { useCallback, useEffect, useState } from "react";

import { useHasMounted } from "@/hooks/use-has-mounted";

export type GeolocationStatus = "idle" | "loading" | "success" | "error" | "unsupported";

export interface GeolocationState {
  lat: number | null;
  lng: number | null;
  status: GeolocationStatus;
  error?: string;
}

interface FetchState {
  lat: number | null;
  lng: number | null;
  status: "loading" | "success" | "error";
  error?: string;
}

const POSITION_OPTIONS: PositionOptions = {
  enableHighAccuracy: false,
  timeout: 10_000,
  maximumAge: 5 * 60_000,
};

function isGeolocationSupported(): boolean {
  return typeof navigator !== "undefined" && Boolean(navigator.geolocation);
}

/**
 * Thin wrapper around the browser Geolocation API. Requests the user's
 * position once on mount and exposes a `request()` function to retry (e.g.
 * from an "Enable location" prompt card after a denial).
 *
 * Deliberately does NOT throw or crash when geolocation is unavailable
 * (older browsers, insecure context, permission denied, etc.) — callers
 * should branch on `status` and render a fallback UI instead.
 *
 * SSR/hydration note: whether geolocation is supported can only be known on
 * the client, but naively checking `navigator` in a `useState` initializer
 * causes a hydration mismatch (the server always "sees" no navigator). This
 * uses the same `useHasMounted` (`useSyncExternalStore`) pattern as that
 * hook to defer the environment check until after the client has mounted,
 * without an extra `useEffect` + `setState` render pass.
 */
export function useGeolocation() {
  const hasMounted = useHasMounted();
  const supported = hasMounted && isGeolocationSupported();

  const [fetchState, setFetchState] = useState<FetchState>({
    lat: null,
    lng: null,
    status: "loading",
  });

  useEffect(() => {
    if (!supported) {
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFetchState({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          status: "success",
        });
      },
      (error) => {
        setFetchState({ lat: null, lng: null, status: "error", error: error.message });
      },
      POSITION_OPTIONS
    );
  }, [supported]);

  // For manual retries (e.g. an "Enable location" button) — an event
  // handler, not effect body, so setting "loading" synchronously here is fine.
  const request = useCallback(() => {
    if (!isGeolocationSupported()) {
      return;
    }
    setFetchState((prev) => ({ ...prev, status: "loading" }));
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFetchState({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          status: "success",
        });
      },
      (error) => {
        setFetchState({ lat: null, lng: null, status: "error", error: error.message });
      },
      POSITION_OPTIONS
    );
  }, []);

  const state: GeolocationState = !hasMounted
    ? { lat: null, lng: null, status: "idle" }
    : !supported
      ? { lat: null, lng: null, status: "unsupported" }
      : fetchState;

  return { ...state, request };
}
