import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface ActiveStoreState {
  activeStoreId: string | null;
  setActiveStoreId: (id: string) => void;
}

/**
 * Which of a seller's (possibly several) stores the seller dashboard is
 * currently showing. Persisted so a reload keeps the seller on the store
 * they were last managing.
 *
 * This is only ever read through `useSelectedStoreId` (features/seller/hooks.ts),
 * which reconciles the persisted id against the seller's actual store list —
 * so a stale id (a different account's browser session, a deleted store)
 * never gets used directly against the API.
 */
export const useActiveStoreStore = create<ActiveStoreState>()(
  persist(
    (set) => ({
      activeStoreId: null,
      setActiveStoreId: (id) => set({ activeStoreId: id }),
    }),
    {
      name: "boda-active-store",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

/** Non-hook accessor for use outside React (e.g. mutation callbacks). */
export const activeStoreStore = {
  getState: useActiveStoreStore.getState,
  setState: useActiveStoreStore.setState,
};
