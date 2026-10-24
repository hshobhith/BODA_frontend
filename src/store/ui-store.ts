import { create } from "zustand";

interface UIState {
  isMobileNavOpen: boolean;
  isCartDrawerOpen: boolean;
  setMobileNavOpen: (open: boolean) => void;
  toggleMobileNav: () => void;
  setCartDrawerOpen: (open: boolean) => void;
  toggleCartDrawer: () => void;
}

/**
 * Simple, non-persisted UI state store. Things like "is the mobile nav
 * sheet open" shouldn't survive a page reload, so this deliberately does
 * NOT use the persist middleware (unlike the auth store).
 */
export const useUIStore = create<UIState>()((set) => ({
  isMobileNavOpen: false,
  isCartDrawerOpen: false,

  setMobileNavOpen: (open) => set({ isMobileNavOpen: open }),
  toggleMobileNav: () => set((state) => ({ isMobileNavOpen: !state.isMobileNavOpen })),

  setCartDrawerOpen: (open) => set({ isCartDrawerOpen: open }),
  toggleCartDrawer: () => set((state) => ({ isCartDrawerOpen: !state.isCartDrawerOpen })),
}));
