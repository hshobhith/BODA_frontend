import { useSyncExternalStore } from "react";

import { readStoreModeSlug } from "@/lib/store-mode";

// The cookie only changes on full page loads (set/cleared by the proxy), so
// there's nothing to subscribe to between renders.
const subscribe = () => () => {};

/**
 * Slug of the store this browser is locked to by a private link, or `null`.
 * Always `null` during SSR/hydration — anything that must not flash before
 * then should use the `store-mode:` CSS variant instead.
 */
export function useStoreModeSlug(): string | null {
  return useSyncExternalStore(
    subscribe,
    () => readStoreModeSlug(document.cookie),
    () => null
  );
}
