/**
 * GalaxyBackdrop field model — deterministic, DOM-free helpers for the
 * landing-page astral backdrop. Kept separate from the component so the
 * starfield math and animation-state policy stay unit-testable under the
 * existing node-environment vitest setup (no new test framework).
 */

export type StarLayer = "far" | "near";

export interface Star {
  /** Normalized viewport coords 0..1 */
  x: number;
  y: number;
  /** Radius in CSS px, 0.4..1.6 */
  r: number;
  /** Twinkle phase in radians */
  phase: number;
  /** Twinkle angular speed, rad/s */
  twinkleSpeed: number;
  layer: StarLayer;
}

export type AnimationState = "playing" | "paused" | "static" | "fallback";

export interface DriftSpeed {
  far: number;
  near: number;
}

/** Backdrop root: fixed, behind hero (`z-0`), never hit-testable. */
export const GALAXY_ROOT_CLASS = "pointer-events-none fixed inset-0 z-0";

/** Nebula glow layer driven by theme tokens + shimmer keyframes in index.css. */
export const GALAXY_NEBULA_CLASS = "galaxy-nebula absolute inset-0";

/** Static CSS-only starfield shown when Canvas 2D is unavailable. */
export const GALAXY_FALLBACK_CLASS = "galaxy-fallback absolute inset-0";

/** Deterministic PRNG so snapshot/characterization tests are stable. */
export function mulberry32(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export interface StarFieldOptions {
  width: number;
  height: number;
  far: number;
  near: number;
  seed?: number;
}

/** Build a layered starfield; coordinates are aspect-independent (0..1). */
export function createStarField(options: StarFieldOptions): Star[] {
  const { width, height, far, near, seed = 7 } = options;
  const rand = mulberry32(seed);
  const aspect = height > 0 ? width / height : 1;
  const stars: Star[] = [];
  const push = (count: number, layer: StarLayer): void => {
    for (let i = 0; i < count; i += 1) {
      const baseR = layer === "far" ? 0.4 : 0.8;
      const spread = layer === "far" ? 0.8 : 0.8;
      stars.push({
        x: rand(),
        y: rand(),
        r: Math.min(1.6, baseR + rand() * spread * (aspect >= 1 ? 1 : aspect)),
        phase: rand() * Math.PI * 2,
        twinkleSpeed: 0.6 + rand() * 1.8,
        layer,
      });
    }
  };
  push(Math.max(0, Math.floor(far)), "far");
  push(Math.max(0, Math.floor(near)), "near");
  return stars;
}

/** Cap render resolution; coarse pointers get a cheaper frame. */
export function resolveDpr(devicePixelRatio: number, coarsePointer: boolean): number {
  const cap = coarsePointer ? 1.25 : 2;
  return Math.min(Math.max(1, devicePixelRatio || 1), cap);
}

export interface AnimationStateInput {
  reducedMotion: boolean;
  canvasAvailable: boolean;
  visible: boolean;
}

/** Single policy for backdrop motion: static > fallback > paused > playing. */
export function resolveAnimationState(input: AnimationStateInput): AnimationState {
  if (input.reducedMotion) return "static";
  if (!input.canvasAvailable) return "fallback";
  if (!input.visible) return "paused";
  return "playing";
}

export interface ShootingStarsInput {
  reducedMotion: boolean;
  coarsePointer: boolean;
  prop: boolean;
}

/** Shooting glints are decorative: off unless explicitly wanted and calm-safe. */
export function shouldShowShootingStars(input: ShootingStarsInput): boolean {
  if (!input.prop) return false;
  if (input.reducedMotion) return false;
  if (input.coarsePointer) return false;
  return true;
}
