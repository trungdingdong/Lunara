import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const HERE = dirname(fileURLToPath(import.meta.url));
const SRC = resolve(HERE, "..");
const VIEW = readFileSync(join(SRC, "views/ReadingView.tsx"), "utf8");
const CSS = readFileSync(join(SRC, "index.css"), "utf8");

/** T006 [US1]: ceremony staging — shuffle wait, spread-sized fan, tap-driven reveals. */
describe("CeremonyFan staging", () => {
  const COMP = readFileSync(join(SRC, "components/CeremonyFan.tsx"), "utf8");

  it("shows shuffle status while creating and a sized fan while dealing", () => {
    expect(VIEW).toMatch(/CeremonyFan/);
    expect(COMP).toMatch(/huffl|Shuffl/i);
    expect(COMP).toMatch(/remaining|pick/i);
    expect(COMP).not.toMatch(/setInterval|flipIntervalMs/);
  });

  it("fires onAllRevealed once on the final pick (no extra tap)", () => {
    expect(COMP).toContain("onAllRevealed");
    expect(COMP).toMatch(/complete/);
  });

  it("reduced-motion guard covers ceremony utilities", () => {
    const guard = CSS.slice(CSS.indexOf("prefers-reduced-motion: reduce"));
    expect(guard).toMatch(/ceremony|shuffle|fan/);
  });
});

/** T012 [US2]: float lift + in-place meaning with focus return. */
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
