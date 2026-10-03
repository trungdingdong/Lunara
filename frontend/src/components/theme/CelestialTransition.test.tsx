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

/** T007 [US2]: persistent hero emblem per mode. */
describe("Hero emblem", () => {
  it("shows moon for dark and sun for light, still, top-left", () => {
    const view = readFileSync(join(SRC, "views/LandingView.tsx"), "utf8");
    expect(view).toMatch(/WoodcutMoon/);
    expect(view).toMatch(/WoodcutSun/);
    expect(view).toMatch(/theme === "dark" \? <WoodcutMoon \/> : <WoodcutSun \/>/);
    expect(view).toMatch(/absolute top-6 left-5/);
  });
});

/** T008 [US2]: rise choreography contract. */
describe("Rise choreography", () => {
  it("incoming rises bottom → slot, outgoing exits, trails follow, arrival applies", () => {
    const comp = readFileSync(join(SRC, "components/theme/CelestialTransition.tsx"), "utf8");
    expect(comp).toContain("veil-incoming");
    expect(comp).toContain("veil-outgoing");
    expect(comp).toContain("createPortal");
    expect(CSS).toContain("@keyframes veil-rise");
    expect(CSS).toContain("@keyframes veil-exit");
    const nav = readFileSync(join(SRC, "components/NavBar.tsx"), "utf8");
    expect(nav).toContain("applyThemeAtMidpoint");
  });
});
describe("Veil portal mount", () => {
  it("renders outside <nav> into document.body", () => {
    const comp = readFileSync(join(SRC, "components/theme/CelestialTransition.tsx"), "utf8");
    expect(comp).toMatch(/createPortal/);
    expect(comp).toMatch(/document\.body/);
    const nav = readFileSync(join(SRC, "components/NavBar.tsx"), "utf8");
    expect(nav).not.toMatch(/celestial-veil|veil-orbit|veil-sun|veil-moon/);
    expect(nav).toMatch(/CelestialTransition/);
  });
});

/** T003 (004): containment characterization — 003 behaviors that must NOT change. */
describe("Transition baseline lock-in", () => {
  it("keeps woodcut bodies, policy buds, store key, and token indirection", () => {
    const comp = readFileSync(join(SRC, "components/theme/CelestialTransition.tsx"), "utf8");
    expect(comp).toContain("WoodcutSun");
    expect(comp).toContain("WoodcutMoon");
    const policy = readFileSync(join(SRC, "components/theme/transitionPolicy.ts"), "utf8");
    expect(policy).toContain("IDLE_MS = 700");
    expect(policy).toContain("SINGLE_SWEEP_MS = 1200");
    expect(policy).toContain("applyThemeAtMidpoint");
    expect(STORE).toContain('"lunara.theme.v1"');
    expect(CSS).toContain("--color-on-surface: var(--md-sys-color-on-surface);");
  });
});
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
