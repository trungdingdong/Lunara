import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const HERE = dirname(fileURLToPath(import.meta.url));
const SRC = resolve(HERE, "../..");
const CSS = readFileSync(join(SRC, "index.css"), "utf8");
const STORE = readFileSync(join(SRC, "stores/theme.ts"), "utf8");

/**
 * T003: characterization — dark-mode token values + store contract.
 * The token fix (T006) must not alter these resolved dark values.
 */
describe("Theme dark baseline", () => {
  it("keeps dark M3 values and the persisted store contract", () => {
    expect(CSS).toContain("--md-sys-color-background: #0e0c1d;");
    expect(CSS).toContain("--md-sys-color-on-surface: #e8e3f4;");
    expect(CSS).toContain("--md-sys-color-primary: #2aafbf;");
    expect(STORE).toContain('"lunara.theme.v1"');
    expect(STORE).toContain('theme: "dark"');
    expect(STORE).toContain("document.documentElement.dataset.theme");
  });
});

/** T009 [US2]: overlay choreography contract. */
describe("CelestialTransition overlay", () => {
  const COMP = readFileSync(join(SRC, "components/theme/CelestialTransition.tsx"), "utf8");

  it("is a non-interactive full-screen veil with woodcut bodies and rings", () => {
    const policy = readFileSync(join(SRC, "components/theme/transitionPolicy.ts"), "utf8");
    expect(policy).toContain("fixed inset-0");
    expect(policy).toContain("z-[100]");
    expect(policy).toContain("pointer-events-none");
    expect(COMP).toContain("VEIL_ROOT_CLASS");
    expect(COMP).toContain("aria-hidden");
    expect(COMP).toContain("<svg");
    expect(COMP).toMatch(/orbit|ring/i);
  });

  it("blends night/day, trails stars, applies theme at midpoint, cleans up", () => {
    expect(COMP).toMatch(/night|day/i);
    expect(COMP).toMatch(/trail|streak|shooting/i);
    const policy = readFileSync(join(SRC, "components/theme/transitionPolicy.ts"), "utf8");
    expect(policy).toContain("applyThemeAtMidpoint");
    expect(COMP).not.toMatch(/<button|<a |tabIndex=\{[1-9]/);
    const nav = readFileSync(join(SRC, "components/NavBar.tsx"), "utf8");
    expect(nav).toContain("runRef");
    expect(nav).toMatch(/setVeil\(null\)/);
  });
});
describe("Theme token audit", () => {
  it("points @theme colors at switching M3 vars", () => {
    const block = CSS.slice(CSS.indexOf("@theme {"), CSS.indexOf("@keyframes deal-in"));
    const offenders = [...block.matchAll(/--color-[a-z-]+:\s*([^;]+);/g)]
      .map((m) => m[1].trim())
      .filter((v) => !/^var\(--md-sys-color-[a-z-]+\)$/.test(v));
    expect(offenders).toEqual([]);
  });
});
