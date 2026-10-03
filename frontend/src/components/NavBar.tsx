import { useRef, useState } from "react";
import { NavLink } from "react-router-dom";
import { Command as CommandIcon, Moon, Sun } from "lucide-react";

import { ROUTES } from "@/routes";
import { useThemeStore } from "@/stores/theme";
import { environmentFlags } from "@/components/landing/usePointerParallax";
import CelestialTransition from "@/components/theme/CelestialTransition";
import {
  IDLE_MS,
  SINGLE_SWEEP_MS,
  applyThemeAtMidpoint,
  type TransitionDirection,
} from "@/components/theme/transitionPolicy";

const NAV_LINKS = [
  { to: ROUTES.READING, label: "Reading" },
  { to: ROUTES.HISTORY, label: "History" },
];

const SHORTCUT_HINT = typeof navigator !== "undefined" && /Mac/.test(navigator.platform) ? "\u2318K" : "Ctrl+K";

export function NavBar({ onOpenPalette }: { onOpenPalette: () => void }) {
  const theme = useThemeStore((state) => state.theme);
  const setTheme = useThemeStore((state) => state.setTheme);
  const [veil, setVeil] = useState<TransitionDirection | null>(null);
  const runRef = useRef(0);
  const pendingRef = useRef(theme);

  const handleThemeToggle = (): void => {
    const next = pendingRef.current === "dark" ? "light" : "dark";
    pendingRef.current = next;
    if (environmentFlags().reducedMotion) {
      setTheme(next);
      return;
    }
    const run = runRef.current + 1;
    runRef.current = run;
    setVeil(next === "light" ? "to-light" : "to-dark");
    window.setTimeout(() => {
      applyThemeAtMidpoint(run, runRef.current, () => setTheme(next));
    }, SINGLE_SWEEP_MS / 2);
    window.setTimeout(() => {
      if (run === runRef.current) setVeil(null);
    }, SINGLE_SWEEP_MS / 2 + IDLE_MS);
  };

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
            onClick={handleThemeToggle}
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
            className="rounded-full p-2 text-on-surface-variant transition-standard hover:bg-surface-high hover:text-on-surface"
          >
            {theme === "dark" ? <Sun size={17} aria-hidden="true" /> : <Moon size={17} aria-hidden="true" />}
          </button>
        </div>
      </div>
      {veil !== null && <CelestialTransition direction={veil} />}
    </nav>
  );
}
