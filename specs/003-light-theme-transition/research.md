# Research: Light Theme Transition

**Feature**: `003-light-theme-transition` | **Date**: 2026-10-03

All Technical Context items resolved; no NEEDS CLARIFICATION remains.

## R-01: Root cause of light-mode washout

- Decision: The defect is architectural, not a list of bad hex values.
  Tailwind v4 `@theme` colors (`--color-background`, `--color-on-surface`,
  …) are compiled to static dark values, while the light overrides only
  redefine `--md-sys-*` variables. Every `bg-background`/`text-on-surface`
  utility therefore stays dark in light mode — lavender text on cream,
  dark surfaces on cream, white hardcoded captions floating unanchored.
- Rationale: Verified by reading `index.css` (`@theme` block vs
  `:root[data-theme="light"]` block) and the class usage across views;
  explains why "text and cards are all the same as the background" on
  every screen at once.
- Alternatives considered:
  - Per-component light overrides — rejected: whack-a-mole across 12+
    files, rots on every new component (this is how the bug was born).
  - New palette values only under `[data-theme="light"]` — rejected alone:
    insufficient while utilities resolve to static tokens.

## R-02: Token indirection fix

- Decision: Point each Tailwind `@theme` color at its M3 counterpart
  (`--color-on-surface: var(--md-sys-color-on-surface)`, etc.) so all
  utilities follow `data-theme` automatically; then correct any remaining
  light-role outliers (hardcoded `text-white` captions, glow alphas tuned
  for dark) and verify dark mode is pixel-identical.
- Rationale: One localized CSS change fixes every view present and future;
  zero runtime cost; M3 roles were already curated per theme.
- Alternatives considered:
  - Tailwind `dark:` variant rewrite — rejected: inverts the whole class
    inventory, massive blast radius, fights the existing `data-theme`
    mechanism.
  - Duplicate `@theme` per mode — rejected: Tailwind has no native
    theme-switch for `@theme`; var indirection is the documented pattern.

## R-03: Transition overlay mechanics (sustain-and-settle)

- Decision: Full-screen `fixed inset-0 z-[100]` `aria-hidden`
  `pointer-events-none` overlay owned by a `CelestialTransition` component
  mounted at app root. First toggle mounts it and starts the orbit; each
  further toggle while mounted retargets the pending theme and pumps orbit
  momentum instead of restarting (continuous spin while spam continues).
  The backdrop crossfades night↔day rapidly with the orbit angle
  (motion-blurred gradient blend) and shooting-star streaks trail the orbit
  path while spinning. After an idle window (~0.7s) with no new toggle,
  the orbit eases to the rest angle of the final (stored) theme, the theme
  applies at the crossing if not yet applied, and the overlay unmounts with
  zero residue. Never mounts on initial load or under reduced motion
  (instant swap).
- Rationale: Matches clarified FR-003/FR-007/FR-009/FR-010 + edge cases;
  store stays the single source of truth (no parallel theme state); all
  timers/animation frames fully cleaned up on settle or unmount.
- Alternatives considered:
  - Per-toggle restart with latest-wins supersede — rejected by user:
    restarts feel janky under spam; sustained spin is the requested feel.
  - View-Transition API (`document.startViewTransition`) — rejected:
    uneven browser support, snapshot-based (can't stage a bespoke
    sun/moon orbit), fallback complexity exceeds the custom overlay.
  - Persisting transition state in the store — rejected: ephemeral UI
    state doesn't belong in persisted state; keep it component-local with
    the store as theme authority.

## R-04: Woodcut sun/moon + geocentric backdrop without new assets

- Decision: Hand-drawn inline SVG (uneven ray strokes, hatched shading,
  woodcut-style faces) + concentric orbit rings + tick marks in pure CSS/SVG;
  sun and moon orbit each other along an arc with a midpoint swap (clarified
  2026-10-03, option A). No image files, no icon packs, no libraries.
- Rationale: Constitution dependency invariant + zero network cost; SVG
  scales crisply at any viewport; palette derives from theme tokens so the
  overlay reads in both directions.
- Alternatives considered:
  - PNG/SVG asset files — rejected: new binary assets, extra requests,
    harder to theme-tint.
  - Emoji/unicode bodies (☀/☽) — rejected: not woodcut style, renders
    inconsistently across platforms.
  - Canvas particle backdrop — rejected: overkill for a ≤1.5s overlay;
    CSS rings suffice.

## R-05: Reduced motion + failure degradation

- Decision: `environmentFlags()` reduced-motion (existing helper, reused) →
  skip overlay entirely, instant store swap. SVG/CSS render failure →
  `onError`/try-path falls back to instant swap; theme correctness never
  depends on the overlay.
- Rationale: Reuses proven patterns (`environmentFlags`, CSS-first
  fallbacks from 001); FR-006 + asset-failure edge satisfied by
  construction.
- Alternatives considered: none — same policy as shipped in 001/002.

## R-06: Test strategy (no DOM harness, no new frameworks)

- Decision: `CelestialTransition.test.tsx` under existing node-env vitest:
  (1) choreography contract via source read (overlay classes, midpoint flip
  ordering, run-ID supersede logic, reduced-motion/initial-load guards);
  (2) token audit test (every `@theme` color resolves to `var(--md-sys-*)`,
  no static hex in theme tokens); (3) policy unit tests for the
  transition state machine (pure helper: next-state given
  toggle/supersede/complete/reduced-motion). Existing suites must pass;
  dark-mode snapshot characterization guards pixel-identity.
- Rationale: Same 001/002-established pattern; motion smoothness + visual
  proof stay in the quickstart manual check.
- Alternatives considered:
  - jsdom/timer-mock component tests — rejected: new harness weight for
    what source-contract + pure-policy tests cover.
