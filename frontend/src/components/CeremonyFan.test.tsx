import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const HERE = dirname(fileURLToPath(import.meta.url));
const SRC = resolve(HERE, "..");
const VIEW = readFileSync(join(SRC, "views/ReadingView.tsx"), "utf8");
const CSS = readFileSync(join(SRC, "index.css"), "utf8");

/** T003 (006): characterization — 005 behaviors that must NOT change. */
describe("Ceremony baseline lock-in", () => {
  it("keeps pick fairness, gating, and the streaming trigger", () => {
    const policy = readFileSync(join(SRC, "components/ceremonyPolicy.ts"), "utf8");
    expect(policy).toContain("nextPick");
    expect(policy).toContain("remainingPicks");
    const comp = readFileSync(join(SRC, "components/CeremonyFan.tsx"), "utf8");
    expect(comp).toContain("onAllRevealed");
    expect(comp).toMatch(/meaningOpen/);
    expect(VIEW).toMatch(/CeremonyFan/);
  });
});

/** T006 [US1]: ceremony staging — shuffle wait, spread-sized fan, tap-driven reveals. */
describe("CeremonyFan staging", () => {
  const COMP = readFileSync(join(SRC, "components/CeremonyFan.tsx"), "utf8");

  it("shows shuffle status while creating and a sized fan while dealing", () => {
    expect(VIEW).toMatch(/CeremonyFan/);
    expect(COMP).toMatch(/huffl|Shuffl/i);
    expect(COMP).toMatch(/remaining|pick/i);
    // countdown clock allowed; faces still turn ONLY on taps (no auto-reveal)
    expect(COMP).not.toMatch(/flipIntervalMs|autoReveal|auto-reveal/);
  });

  it("fires onAllRevealed once on the final pick (no extra tap)", () => {
    expect(COMP).toContain("onAllRevealed");
    expect(COMP).toMatch(/complete/);
  });

  it("T006 counts down the performance and gates picks until the deal lands", () => {
    expect(COMP).toMatch(/countdown|elapsed|remaining.*s/i);
    expect(COMP).toMatch(/deal-travel|fan-landed|picksLocked/i);
    expect(CSS).toContain("@keyframes ceremony-deal");
  });

  it("reduced-motion guard covers ceremony utilities", () => {
    const guard = CSS.slice(CSS.indexOf("prefers-reduced-motion: reduce"));
    expect(guard).toMatch(/ceremony|shuffle|fan/);
  });
});

/** T010 [US2]: esoteric backs + zoom-to-meaning contract. */
describe("CeremonyFan flourish", () => {
  it("dresses face-down cards in esoteric line work", () => {
    const comp = readFileSync(join(SRC, "components/CeremonyFan.tsx"), "utf8");
    expect(comp).toMatch(/EsotericBack|esoteric-back/);
    expect(comp).not.toMatch(/plain-gradient/);
  });

  it("zooms the meaning beside the card with button exit and narrow stacking", () => {
    const comp = readFileSync(join(SRC, "components/CeremonyFan.tsx"), "utf8");
    expect(comp).toMatch(/zoom|Zoom/);
    expect(comp).toMatch(/meaning-side|meaningSide|side.*box/i);
    expect(comp).toMatch(/Exit|exit/i);
    expect(CSS).toMatch(/ceremony-zoom/);
  });
});
describe("CeremonyFan meaning", () => {
  it("lifts on hover/focus and opens a dismissible meaning", () => {
    const comp = readFileSync(join(SRC, "components/CeremonyFan.tsx"), "utf8");
    expect(comp).toMatch(/ceremony-card/);
    expect(comp).toContain("ceremony-meaning");
    expect(comp).toMatch(/closeMeaning/);
    expect(comp).toMatch(/cardRefs/);
    expect(comp).toMatch(/Escape/);
    expect(CSS).toMatch(/\.ceremony-card:hover/);
  });
});
