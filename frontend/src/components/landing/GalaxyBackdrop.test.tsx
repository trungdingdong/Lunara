import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

import {
  GALAXY_FALLBACK_CLASS,
  GALAXY_ROOT_CLASS,
  createStarField,
  resolveAnimationState,
  resolveDpr,
  shouldShowShootingStars,
} from "@/components/landing/galaxyField";

/** T005 [US1]: GalaxyBackdrop render + field contract. */
describe("GalaxyBackdrop contract", () => {
  it("root sits strictly behind content and never intercepts input", () => {
    expect(GALAXY_ROOT_CLASS).toContain("fixed inset-0");
    expect(GALAXY_ROOT_CLASS).toContain("z-0");
    expect(GALAXY_ROOT_CLASS).toContain("pointer-events-none");
  });

  it("fallback is a static CSS starfield layer", () => {
    expect(GALAXY_FALLBACK_CLASS).toContain("absolute inset-0");
  });

  it("creates deterministic layered starfields", () => {
    const a = createStarField({ width: 800, height: 600, far: 140, near: 80, seed: 7 });
    const b = createStarField({ width: 800, height: 600, far: 140, near: 80, seed: 7 });
    expect(a).toHaveLength(220);
    expect(a).toEqual(b);
    expect(a.filter((s) => s.layer === "far")).toHaveLength(140);
    expect(a.filter((s) => s.layer === "near")).toHaveLength(80);
    for (const star of a) {
      expect(star.x).toBeGreaterThanOrEqual(0);
      expect(star.x).toBeLessThanOrEqual(1);
      expect(star.r).toBeGreaterThanOrEqual(0.4);
      expect(star.r).toBeLessThanOrEqual(1.6);
    }
  });

  it("caps device pixel ratio (lower on coarse pointers)", () => {
    expect(resolveDpr(3, false)).toBe(2);
    expect(resolveDpr(3, true)).toBe(1.25);
    expect(resolveDpr(1, false)).toBe(1);
  });

  it("derives animation state: playing | paused | static | fallback", () => {
    expect(resolveAnimationState({ reducedMotion: false, canvasAvailable: true, visible: true })).toBe("playing");
    expect(resolveAnimationState({ reducedMotion: false, canvasAvailable: true, visible: false })).toBe("paused");
    expect(resolveAnimationState({ reducedMotion: true, canvasAvailable: true, visible: true })).toBe("static");
    expect(resolveAnimationState({ reducedMotion: false, canvasAvailable: false, visible: true })).toBe("fallback");
  });

  it("suppresses shooting stars on reduced motion or coarse pointers", () => {
    expect(shouldShowShootingStars({ reducedMotion: false, coarsePointer: false, prop: true })).toBe(true);
    expect(shouldShowShootingStars({ reducedMotion: true, coarsePointer: false, prop: true })).toBe(false);
    expect(shouldShowShootingStars({ reducedMotion: false, coarsePointer: true, prop: true })).toBe(false);
    expect(shouldShowShootingStars({ reducedMotion: false, coarsePointer: false, prop: false })).toBe(false);
  });
});

/** T011 [US2]: layering/interaction — backdrop exposes zero focusables. */
describe("GalaxyBackdrop non-interference", () => {
  it("component takes no callbacks, children, or slots", async () => {
    const source = readFileSync(
      resolve(dirname(fileURLToPath(import.meta.url)), "GalaxyBackdrop.tsx"),
      "utf8",
    );
    expect(source).toContain('aria-hidden="true"');
    expect(source).not.toMatch(/on[A-Z][a-zA-Z]*\?:/);
    expect(source).not.toContain("children");
    expect(source).not.toMatch(/<button|<a |role="button"/);
  });

  it("content scrim + light-theme variant exist in index.css", () => {
    const css = readFileSync(resolve(dirname(fileURLToPath(import.meta.url)), "../../index.css"), "utf8");
    expect(css).toContain(".landing-scrim");
    expect(css).toContain('[data-theme="light"]');
    expect(css).toContain(".galaxy-fallback");
    expect(css).toContain("@media (prefers-reduced-motion: reduce)");
  });
});

/** T015/T016 [US3]: motion policy ordering + fallback priority. */
describe("GalaxyBackdrop motion safety", () => {
  it("reduced motion wins over every other signal (static, never animating)", () => {
    expect(resolveAnimationState({ reducedMotion: true, canvasAvailable: false, visible: false })).toBe("static");
  });

  it("canvas failure beats visibility (fallback, no throw path)", () => {
    expect(resolveAnimationState({ reducedMotion: false, canvasAvailable: false, visible: false })).toBe("fallback");
  });

  it("hidden tab pauses instead of unmounting (cheap resume)", () => {
    expect(resolveAnimationState({ reducedMotion: false, canvasAvailable: true, visible: false })).toBe("paused");
  });
});
