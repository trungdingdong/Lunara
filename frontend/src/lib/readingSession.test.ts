import { describe, expect, it } from "vitest";

import { reducer, IDLE, type ReadingSessionState } from "./readingSession";
import type { DrawnCard } from "@/lib/api";

function card(id: string): DrawnCard {
  return {
    card: {
      id,
      name: id,
      arcana: "major",
      suit: null,
      rank: 0,
      img: null,
      keywords: ["k"],
      upright: { meanings: ["light"] },
      reversed: { meanings: ["shadow"] },
    },
    is_reversed: false,
    position: "Past",
  };
}

function inDealing(): ReadingSessionState {
  return reducer(reducer(IDLE, { kind: "submit-started" }), {
    kind: "submit-succeeded",
    readingId: "r-1",
    cards: [card("the-fool")],
  });
}

describe("readingSession reducer", () => {
  it("moves ask -> creating -> dealing on submit flow", () => {
    const creating = reducer(IDLE, { kind: "submit-started" });
    expect(creating.stage).toBe("creating");

    const dealing = reducer(creating, {
      kind: "submit-succeeded",
      readingId: "r-1",
      cards: [card("the-fool")],
    });
    expect(dealing.stage).toBe("dealing");
    expect(dealing.readingId).toBe("r-1");
  });

  it("ignores submit-started when not idle (double-submit guard)", () => {
    const dealing = inDealing();
    const again = reducer(dealing, { kind: "submit-started" });

    expect(again).toBe(dealing);
  });

  it("rolls creating back to ask on failure", () => {
    const creating = reducer(IDLE, { kind: "submit-started" });
    const rolledBack = reducer(creating, { kind: "submit-failed" });

    expect(rolledBack.stage).toBe("ask");
  });

  it("accumulates tokens only while reading", () => {
    let state = inDealing();

    state = reducer(state, { kind: "token", text: "early" });
    expect(state.interpretation).toBe("");

    state = reducer(state, { kind: "reveal-complete" });
    state = reducer(state, { kind: "token", text: "hello " });
    state = reducer(state, { kind: "token", text: "world" });

    expect(state.interpretation).toBe("hello world");
  });

  it("stream failure keeps interpretation reachable and marks failed", () => {
    let state = inDealing();
    state = reducer(state, { kind: "reveal-complete" });
    state = reducer(state, { kind: "token", text: "partial wisdom" });
    state = reducer(state, { kind: "stream-failed" });

    expect(state.stage).toBe("failed");
    expect(state.streamFinished).toBe(true);
    expect(state.interpretation).toBe("partial wisdom");
  });

  it("reset returns to a clean idle session", () => {
    let state = inDealing();
    state = reducer(state, { kind: "reveal-complete" });
    state = reducer(state, { kind: "reset" });

    expect(state).toEqual(IDLE);
  });
});
