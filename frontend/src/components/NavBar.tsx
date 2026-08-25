import { NavLink } from "react-router-dom";
import { Command as CommandIcon, Moon, Sun } from "lucide-react";

import { useThemeStore } from "@/stores/theme";

const NAV_LINKS = [
  { to: "/reading", label: "Reading" },
  { to: "/history", label: "History" },
];

const SHORTCUT_HINT = typeof navigator !== "undefined" && /Mac/.test(navigator.platform) ? "\u2318K" : "Ctrl+K";

export function NavBar({ onOpenPalette }: { onOpenPalette: () => void }) {
  const theme = useThemeStore((state) => state.theme);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);

  return (
    <nav className="sticky top-0 z-40 border-b border-outline-variant/60 bg-background/70 backdrop-blur-md">
      <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between px-5">
        <div className="flex items-center gap-6">
          <span className="font-display text-lg font-semibold tracking-wide text-primary">Lunara</span>
          <div className="flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={false}
                className={({ isActive }) =>
                  `rounded-full px-3 py-1.5 font-body text-sm transition-standard ${
                    isActive
                      ? "bg-primary/12 text-primary"
                      : "text-on-surface-variant hover:bg-surface-high hover:text-on-surface"
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={onOpenPalette}
            aria-label="Open command palette"
            className="hidden items-center gap-2 rounded-full border border-outline-variant px-3 py-1.5 font-utility text-[0.65rem] text-on-surface-variant transition-standard hover:border-outline hover:text-on-surface sm:flex"
          >
            <CommandIcon size={13} aria-hidden="true" />
            {SHORTCUT_HINT}
          </button>

          <button
            type="button"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
            className="rounded-full p-2 text-on-surface-variant transition-standard hover:bg-surface-high hover:text-on-surface"
          >
            {theme === "dark" ? <Sun size={17} aria-hidden="true" /> : <Moon size={17} aria-hidden="true" />}
          </button>
        </div>
      </div>
    </nav>
  );
}
