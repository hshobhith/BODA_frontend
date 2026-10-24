import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/**
 * Returns `true` once the component has mounted on the client, `false`
 * during SSR and the initial client render. Useful for guarding
 * client-only UI (e.g. reading `next-themes`' resolved theme, or a
 * persisted Zustand store) to avoid hydration mismatches.
 *
 * Implemented with `useSyncExternalStore` instead of `useEffect` +
 * `setState` so mounting doesn't trigger an extra synchronous re-render
 * pass — the snapshot itself differs between server and client.
 */
export function useHasMounted(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  );
}
