import { describe, expect, it } from "vitest";

import {
  IDLE_MS,
  SINGLE_SWEEP_MS,
  nextTransition,
  type TransitionInput,
  type TransitionState,
} from "@/components/theme/transitionPolicy";

const BASE: TransitionState = {
  spinning: false,
  pendingTheme: "dark",
  direction: "to-dark",
  orbitAngle: 0,
  reducedMotion: false,
  initialLoad: false,
};

/** T010 [US2]: sustain-and-settle policy (pure state machine). */
describe("transitionPolicy", () => {
  it("starts spinning on toggle from idle", () => {
    const next = nextTransition(BASE, { kind: "toggle", theme: "light" });
    expect(next.spinning).toBe(true);
    expect(next.pendingTheme).toBe("light");
    expect(next.direction).toBe("to-light");
  });

  it("sustains the spin on further toggles — never restarts", () => {
    const spinning: TransitionState = { ...BASE, spinning: true, pendingTheme: "light", orbitAngle: 120 };
    const next = nextTransition(spinning, { kind: "toggle", theme: "dark" });
    expect(next.spinning).toBe(true);
    expect(next.pendingTheme).toBe("dark");
    expect(next.orbitAngle).toBe(120);
  });

  it("settles to the pending theme after the idle window", () => {
    const spinning: TransitionState = { ...BASE, spinning: true, pendingTheme: "light" };
    const input: TransitionInput = { kind: "idle", elapsedMs: IDLE_MS };
    const next = nextTransition(spinning, input);
    expect(next.spinning).toBe(false);
    expect(next.pendingTheme).toBe("light");
  });

  it("keeps spinning before the idle window elapses", () => {
    const spinning: TransitionState = { ...BASE, spinning: true, pendingTheme: "light" };
    expect(nextTransition(spinning, { kind: "idle", elapsedMs: IDLE_MS - 1 }).spinning).toBe(true);
  });

  it("never overlays on reduced motion or initial load", () => {
    expect(nextTransition({ ...BASE, reducedMotion: true }, { kind: "toggle", theme: "light" }).spinning).toBe(false);
    expect(nextTransition({ ...BASE, initialLoad: true }, { kind: "toggle", theme: "light" }).spinning).toBe(false);
  });

  it("honors the timing budgets", () => {
    expect(SINGLE_SWEEP_MS).toBeLessThanOrEqual(1500);
    expect(IDLE_MS).toBeLessThanOrEqual(1000);
  });
});
