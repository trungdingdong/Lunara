import { create } from "zustand";
import { persist } from "zustand/middleware";

import { setTokens, refreshAccessToken } from "@/lib/authClient";

export interface SessionUser {
  id: string;
  email: string;
}

interface SessionState {
  user: SessionUser | null;
  refreshToken: string | null;
  setSession: (user: SessionUser, refreshToken: string) => void;
  clearSession: () => void;
}

const STORAGE_KEY = "lunara.session.v1";

export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      user: null,
      refreshToken: null,
      setSession: (user, refreshToken) => set({ user, refreshToken }),
      clearSession: () => set({ user: null, refreshToken: null }),
    }),
    {
      name: STORAGE_KEY,
      version: 1,
      partialize: (state) => ({ refreshToken: state.refreshToken }),
    },
  ),
);

export function initSession(): void {
  const refreshToken = useSessionStore.getState().refreshToken;
  if (refreshToken) {
    setTokens({ accessToken: "", refreshToken });
    void refreshAccessToken();
  }
}
