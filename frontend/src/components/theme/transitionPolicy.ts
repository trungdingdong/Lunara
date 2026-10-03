/**
 * Celestial transition policy — pure sustain-and-settle state machine.
 * DOM-free so it stays unit-testable under the node-environment vitest setup.
 */

import type { ThemeName } from "@/stores/theme";

export const IDLE_MS = 700;
export const SINGLE_SWEEP_MS = 1200;

export type TransitionDirection = "to-light" | "to-dark";

export interface TransitionState {
  spinning: boolean;
  pendingTheme: ThemeName;
  direction: TransitionDirection;
  /** Degrees of orbit; sustained across toggles (never reset while spinning). */
  orbitAngle: number;
  reducedMotion: boolean;
  initialLoad: boolean;
}

export type TransitionInput =
  | { kind: "toggle"; theme: ThemeName }
  | { kind: "idle"; elapsedMs: number };

/** Backdrop root contract: full-screen, non-interactive veil. */
export const VEIL_ROOT_CLASS =
  "celestial-veil pointer-events-none fixed inset-0 z-[100] overflow-hidden";

/** Run-guarded midpoint applier; stale runs no-op (rapid-toggle safety). */
export function applyThemeAtMidpoint(run: number, currentRun: number, apply: () => void): void {
  if (run === currentRun) apply();
}

/**
 * Next state. Toggles while spinning sustain the orbit (retarget only);
 * the orbit settles once input stays idle past IDLE_MS. Reduced motion
 * and initial load never spin.
 */
export function nextTransition(state: TransitionState, input: TransitionInput): TransitionState {
  if (input.kind === "idle") {
    if (!state.spinning || input.elapsedMs < IDLE_MS) return state;
    return { ...state, spinning: false };
  }
  if (state.reducedMotion || state.initialLoad) {
    return { ...state, spinning: false, pendingTheme: input.theme };
  }
  return {
    ...state,
    spinning: true,
    pendingTheme: input.theme,
    direction: input.theme === "light" ? "to-light" : "to-dark",
  };
}
