import { describe, expect, it } from "vitest";

import {
  SHUFFLE_MS,
  nextPerformance,
  type ShufflePerformance,
} from "@/components/ceremonyPolicy";

const BASE: ShufflePerformance = {
  durationMs: SHUFFLE_MS,
  elapsedMs: 0,
  cardsArrived: false,
  failed: false,
  done: false,
  aborted: false,
};

/** T005 [US1]: timed shuffle policy — 7–9s window, wait-or-abort. */
describe("shufflePerformance", () => {
  it("runs the 7–9s window", () => {
    expect(SHUFFLE_MS).toBeGreaterThanOrEqual(7000);
    expect(SHUFFLE_MS).toBeLessThanOrEqual(9000);
  });

  it("finishes only when time elapsed AND cards arrived", () => {
    expect(nextPerformance(BASE, 8000).done).toBe(false);
    expect(nextPerformance({ ...BASE, cardsArrived: true }, 7999).done).toBe(false);
    expect(nextPerformance({ ...BASE, cardsArrived: true }, 8000).done).toBe(true);
  });

  it("failure aborts the performance", () => {
    expect(nextPerformance({ ...BASE, failed: true }, 100).done).toBe(false);
    expect(nextPerformance({ ...BASE, failed: true }, 100).aborted).toBe(true);
  });
});
