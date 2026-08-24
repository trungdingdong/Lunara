import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ThemeName = "dark" | "light";

interface ThemeState {
  theme: ThemeName;
  setTheme: (theme: ThemeName) => void;
  toggleTheme: () => void;
}

const STORAGE_KEY = "lunara.theme.v1";

function applyToDocument(theme: ThemeName): void {
  document.documentElement.dataset.theme = theme;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: "dark",
      setTheme: (theme) => {
        applyToDocument(theme);
        set({ theme });
      },
      toggleTheme: () => get().setTheme(get().theme === "dark" ? "light" : "dark"),
    }),
    {
      name: STORAGE_KEY,
      version: 1,
      onRehydrateStorage: () => (state) => {
        if (state) applyToDocument(state.theme);
      },
    },
  ),
);

export function initTheme(): void {
  applyToDocument(useThemeStore.getState().theme);
}
