import { create } from "zustand";
import type { PublicUser, Role } from "@nati/shared";

/**
 * Global auth state. Tokens live in HTTP-only cookies (never touched by JS);
 * this store only holds the resolved user + status for the UI and guards.
 *
 * Phase 1: a stub — starts unauthenticated, exposes the shape guards/components
 * consume. Phase 2 wires login/refresh/`/auth/me` rehydration into it.
 */
export type AuthStatus = "idle" | "loading" | "authenticated" | "unauthenticated";

interface AuthState {
  user: PublicUser | null;
  status: AuthStatus;
  setUser: (user: PublicUser | null) => void;
  setStatus: (status: AuthStatus) => void;
  clear: () => void;
  hasRole: (roles: Role[]) => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  status: "idle",
  setUser: (user) =>
    set({ user, status: user ? "authenticated" : "unauthenticated" }),
  setStatus: (status) => set({ status }),
  clear: () => set({ user: null, status: "unauthenticated" }),
  hasRole: (roles) => {
    const user = get().user;
    if (!user) return false;
    return roles.some((role) => user.roles.includes(role));
  },
}));

/** Non-hook accessor for use outside React (e.g. the axios interceptor). */
export const authStore = useAuthStore;
