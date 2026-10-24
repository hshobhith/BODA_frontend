import { useCallback, useSyncExternalStore } from "react";

/**
 * Subscribes to a CSS media query and returns whether it currently matches.
 * Safe for SSR: returns `false` on the server and until hydrated on the
 * client. Built on `useSyncExternalStore` (rather than an effect +
 * `setState`) since this is textbook "subscribe to an external system"
 * state, which avoids an extra render pass on mount.
 *
 * Example: const isDesktop = useMediaQuery("(min-width: 1024px)")
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      const mediaQueryList = window.matchMedia(query);
      mediaQueryList.addEventListener("change", onStoreChange);
      return () => mediaQueryList.removeEventListener("change", onStoreChange);
    },
    [query]
  );

  const getSnapshot = useCallback(() => window.matchMedia(query).matches, [query]);
  const getServerSnapshot = () => false;

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/** Convenience hook matching Tailwind's default `md` breakpoint (768px). */
export function useIsMobile(): boolean {
  return !useMediaQuery("(min-width: 768px)");
}
