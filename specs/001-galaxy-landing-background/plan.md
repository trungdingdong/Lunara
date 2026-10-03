# Implementation Plan: Galaxy Astral Landing Background

**Branch**: `001-galaxy-landing-background` | **Date**: 2026-10-03 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-galaxy-landing-background/spec.md`

## Summary

Replace the landing-page `LiquidBasin` (liquid-gl glassmorphism + radial-gradient
fallback) with a lightweight animated galaxy/astral backdrop: layered Canvas 2D
starfield (twinkle + slow drift) over CSS nebula gradients, strictly behind hero
content (`z-0`, `pointer-events-none`, `aria-hidden`), with reduced-motion static
render, Canvas-failure CSS fallback, and IntersectionObserver/visibility pause.
Foreground `LandingView` hero content, pointer-parallax tilt, reveal, and exit-fade
stay unchanged. No backend/API changes; no new dependencies.

## Technical Context

**Language/Version**: TypeScript ~6.0 (strict), React 19.2, Vite 8.2

**Primary Dependencies**: React, react-router-dom 7, Tailwind CSS v4 (+@tailwindcss/vite),
`liquid-gl` 2.0.1 (TO BE REMOVED from landing path only), existing
`components/landing/usePointerParallax` (reused, not duplicated)

**Storage**: N/A (presentational; no persistence, no API)

**Testing**: vitest 4 (`npm run test` / `vitest run`), existing `src/**/*.test.ts(x)`
pattern; oxlint; `tsc -b` via `npm run build`

**Target Platform**: Modern evergreen browsers (desktop + mobile); CSS + Canvas 2D only,
no WebGL requirement

**Project Type**: Web application (frontend-only change; backend untouched)

**Performance Goals**: 60fps-class calm motion on mid-range device; single rAF loop,
≤ ~220 stars across 2 parallax layers + capped DPR (≤2, fewer on coarse pointers);
zero layout shift of foreground during 15s observation; pause off-screen/hidden

**Constraints**: MUST sit behind content and never intercept input (`pointer-events-none`,
keyboard/tab order unchanged); MUST respect `prefers-reduced-motion` (static frame, no
rAF); MUST degrade to CSS-only starfield if Canvas unavailable; MUST keep legibility
over brightest states (scrim/dim treatment); light-theme-safe variant; landing-only scope

**Scale/Scope**: 1 view (`views/LandingView.tsx`), 1 new component
(`components/landing/GalaxyBackdrop.tsx` + test), removal of `LiquidBasin` usage on
landing (component deprecated, not deleted in this task)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] I. Boy Scout / Blast Radius: new file(s) 100% modern (strict TS, no `any`,
  typed props); `LandingView.tsx` left equal-or-better; no unrelated refactors;
  change localized to landing backdrop via a single behind-content component.
- [x] II. Boundaries: no business-logic duplication (presentational only, reuses
  `environmentFlags`/`usePointerTracking` as-is); `LiquidBasin` marked
  `@deprecated → GalaxyBackdrop` rather than deleted (back-compat for any other
  importer; landing route stops rendering it); no public API change; zero `any`
  in new files, progressive narrowing only in touched legacy.
- [x] III. Tests: existing `vitest` suites must pass; new `GalaxyBackdrop.test.tsx`
  covers layering (behind content, non-interactive), reduced-motion static, Canvas
  fallback, and cleanup — reusing existing vitest pattern, no new mock framework.
- [x] IV. Dependencies: NO new libraries (no three.js / react-three-fiber / new
  starfield pkg); Canvas 2D + CSS + existing Tailwind only. `liquid-gl` stays in
  `package.json` this task (removal is a separate cleanup to avoid lockfile blast radius).
- [x] V. Target Architecture: thin view + isolated presentational component, no
  store/DB bypass (N/A — no data layer involved).

Post-design re-check: PASS — design below introduces no new violations.

## Project Structure

### Documentation (this feature)

```text
specs/001-galaxy-landing-background/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
frontend/
├── src/
│   ├── views/
│   │   └── LandingView.tsx            # swap LiquidBasin → GalaxyBackdrop, keep hero intact
│   ├── components/
│   │   └── landing/
│   │       ├── GalaxyBackdrop.tsx     # NEW: canvas starfield + nebula, behind-content
│   │       ├── GalaxyBackdrop.test.tsx# NEW: layering / motion / fallback tests
│   │       ├── LiquidBasin.tsx        # DEPRECATED in place (do not delete this task)
│   │       └── usePointerParallax.ts  # reused unchanged
│   └── index.css                      # nebula keyframes + scrim utilities (scoped additions)
└── tests → src/**/*.test.tsx (vitest)
```

**Structure Decision**: Web-application frontend-only change. Backend (`backend/`) untouched.
Single new presentational component behind existing hero content; legacy basin component
deprecated in place per constitution deprecation protocol.

## Complexity Tracking

> No constitution violations requiring justification.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| — | — | — |
