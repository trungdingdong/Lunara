# Research: Galaxy Astral Landing Background

**Feature**: `001-galaxy-landing-background` | **Date**: 2026-10-03

All NEEDS CLARIFICATION items from Technical Context are resolved below.
No open unknowns remain.

## R-01: Rendering approach (Canvas 2D vs CSS-only vs WebGL/three.js vs keep liquid-gl)

- Decision: Layered **Canvas 2D starfield** (2 parallax layers: far twinkle + near
  slow drift, plus 1–2 crossing "shooting" glints at low frequency) composited over
  **CSS nebula gradients** (existing `body` radial-gradient language extended with a
  slow shimmer keyframe), all inside one `GalaxyBackdrop` component.
- Rationale: Meets "animated stars + stuff" with calm motion at minimal cost — single
  rAF loop, no GPU/WebGL requirement, no bundle addition, works on low-end and mobile,
  trivially pausable and statically renderable for reduced-motion/fallback. Matches
  existing codebase idiom (rAF-coalesced pointer loop, `prefers-reduced-motion`
  handling in `index.css`).
- Alternatives considered:
  - CSS box-shadow starfield only — rejected as sole approach: cheap but flat, no
    depth/twinkle variance without huge generated stylesheets; kept as the *fallback*
    layer instead.
  - WebGL / three.js / react-three-fiber — rejected: new heavy dependency (~500KB+),
    violates constitution dependency invariant, overkill for a behind-content backdrop,
    WebGL-failure surface on older devices.
  - Keep/extend liquid-gl basin — rejected: explicit spec ask to remove it from landing;
    refraction pane fights the "content highlighted over background" goal and costs more
    per frame than a starfield.

## R-02: How foreground stays highlighted over the background

- Decision: Strict layering contract — backdrop container `fixed inset-0 z-0`
  `aria-hidden pointer-events-none`; hero wrapper stays `relative z-10`; add a
  **content scrim** (radial darkening behind text/cards/CTA, tuned per theme) plus
  keep existing `Reveal`/tilt/CTA behavior untouched. Foreground gets no backdrop-driven
  restyle beyond contrast treatment.
- Rationale: Guarantees FR-003/FR-007 by construction (paint order + hit-test order)
  rather than by careful star placement; scrim absorbs brightest-star washout without
  dimming the whole galaxy.
- Alternatives considered:
  - Capping star brightness globally — rejected: kills the galaxy feel; scrim preserves
    sparkle at edges while protecting text.
  - `z-index` tweaks on individual hero children — rejected: fragile; single `z-10`
    wrapper already proven in `LandingView`.

## R-03: Reduced motion, fallback, and pause strategy

- Decision:
  - `prefers-reduced-motion: reduce` (via existing `environmentFlags()`) → render one
    static Canvas frame (or pure-CSS starfield if Canvas missing) and never start rAF.
  - Canvas context `null`/throws → swap to CSS-only starfield div (same nebula + static
    dot gradients), no error surfaced, content fully interactive.
  - `document.visibilitychange` + `IntersectionObserver` on the landing `<main>` →
    stop rAF when hidden/off-screen, resume on return.
- Rationale: Directly satisfies FR-004/FR-005/FR-006 and spec edge cases; reuses proven
  patterns already in the codebase (`environmentFlags`, `IntersectionObserver` in `Reveal`).
- Alternatives considered:
  - `matchMedia` listener only without static first-frame — rejected: flashes animated
    intent before settling; static-first is calmer and testable.
  - Unmounting backdrop off-screen — rejected: remount cost + Canvas re-init; pausing
    rAF is cheaper.

## R-04: Performance budget and density

- Decision: ≤ ~220 stars total (far ~140, near ~80), DPR capped at 2 (1.25 on
  `(pointer: coarse)`), star radius 0.4–1.6px, drift ≤ 6px/s far / ≤ 14px/s near,
  twinkle via sine phase (no per-frame allocation; precomputed star array, resize via
  `ResizeObserver` with debounce). Shooting glint at most every ~7s, disabled on
  reduced-motion and coarse pointers by default.
- Rationale: Hits SC-004 (no visible stutter, no foreground layout shift) with headroom;
  precomputation + single loop avoids GC churn; density constants exposed as props with
  defaults for tuning without logic changes.
- Alternatives considered:
  - Particle counts ≥500 or full-screen blur passes — rejected: jank risk on low-end,
    unnecessary for a dim backdrop.
  - `setInterval` redraw — rejected: rAF aligns to vsync and auto-throttles.

## R-05: Theming (dark mystical default + light variant)

- Decision: Nebula palette derived from existing M3 tokens (deep violet/indigo + teal
  glow accents); light theme (`[data-theme="light"]`) gets a dimmed daybreak-astral
  variant (lighter indigo wash, sparser/ dimmer stars, stronger scrim under text) via
  CSS variables + a `data-theme`-aware star alpha prop.
- Rationale: Keeps dark-first identity while honoring the spec edge case (no whiteout,
  legible contrast in both themes); reuses the token system instead of hardcoding.
- Alternatives considered:
  - Single palette for both themes — rejected: bright stars on cream wash out or look
    dirty; per-theme alpha/scrim is a small, principled branch.

## R-06: Test strategy (no new frameworks)

- Decision: `GalaxyBackdrop.test.tsx` under existing vitest setup:
  1. renders behind content (`z`/position classes, `aria-hidden`, `pointer-events-none`);
  2. does not intercept clicks (CTA clickable through overlay);
  3. reduced-motion → no rAF loop / static render;
  4. Canvas failure → CSS fallback present, no throw;
  5. unmount cleans rAF + observers (spy on `cancelAnimationFrame`).
  Existing suites (`npm run test`, `tsc -b`, `oxlint`) must pass unchanged.
- Rationale: Constitution-compliant (reuse test utils, characterization-by-contract for
  a new component); covers every acceptance scenario that is unit-testable, leaving
  motion-smoothness to the quickstart manual check.
- Alternatives considered:
  - Visual-snapshot / Playwright — rejected for this task: no harness exists; manual
    quickstart + unit contract is proportionate blast radius.
