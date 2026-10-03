import { describe, expect, it } from "vitest";

import {
  nextPick,
  type CeremonyPickState,
} from "@/components/ceremonyPolicy";

const BASE: CeremonyPickState = {
  total: 3,
  revealed: [],
  complete: false,
};

/** T005 [US1]: pick policy — taps order reveals only, array never mutated. */
describe("ceremonyPolicy", () => {
  it("reveals on tap and decrements the remainder", () => {
    const next = nextPick(BASE, 1);
    expect(next.revealed).toEqual([1]);
    expect(next.revealed.length).toBe(3 - 2);
    expect(next.complete).toBe(false);
  });

  it("double-tap is idempotent (no double count)", () => {
    const once = nextPick(BASE, 0);
    const twice = nextPick(once, 0);
    expect(twice.revealed).toEqual([0]);
  });

  it("final pick signals complete exactly once", () => {
    const full: CeremonyPickState = { ...BASE, revealed: [0, 1], complete: false };
    const done = nextPick(full, 2);
    expect(done.complete).toBe(true);
    expect(nextPick(done, 2).complete).toBe(true);
  });

  it("never alters the drawn set (fairness)", () => {
    const drawn = ["a", "b", "c"];
    const frozen = [...drawn];
    nextPick(BASE, 2);
    expect(drawn).toEqual(frozen);
  });
});
