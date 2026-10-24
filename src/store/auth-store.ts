import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { AUTH_STORAGE_KEY } from "@/constants/config";
import type { AuthSession, User } from "@/types/auth";

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  /** Store a full auth session (e.g. after login/register/refresh). */
  setSession: (session: AuthSession) => void;
  /** Update just the tokens, keeping the current user (used after a silent refresh). */
  setTokens: (tokens: { accessToken: string; refreshToken: string }) => void;
  /** Update the current user profile (e.g. after PATCH /users/me). */
  setUser: (user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,

      setSession: (session) =>
        set({
          user: session.user,
          accessToken: session.tokens.accessToken,
          refreshToken: session.tokens.refreshToken,
          isAuthenticated: true,
        }),

      setTokens: (tokens) =>
        set((state) => ({
          ...state,
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
        })),

      setUser: (user) => set({ user }),

      logout: () =>
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        }),
    }),
    {
      name: AUTH_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      // Only persist what we need to rehydrate a session; avoid persisting
      // transient UI state if this store ever grows one.
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

/**
 * Non-hook accessor for use outside React (e.g. axios interceptors) where
 * calling the hook isn't valid. Zustand stores expose `getState`/`setState`
 * on the hook itself.
 */
export const authStore = {
  getState: useAuthStore.getState,
  setState: useAuthStore.setState,
};
