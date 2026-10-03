# Implementation Plan: Card UX Polish

**Branch**: `002-card-ux-polish` | **Date**: 2026-10-03 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/002-card-ux-polish/spec.md`

## Summary

Fix the landing trio hover bug by moving rotation from the lone front face to
the whole card unit (reuse the reading-flow `.card-inner`/`.flipped` flip
language: front + reverse rotate together, never a solo face turning into its
hidden side), give the two decorative flankers a matching highlight/lift
(clarified 2026-10-03, option A), and lock the existing three-family type
system into documented roles with a class-level audit. Reduced-motion default:
no face change at all (open clarify item, implementer default — user may
override to instant swap). CTA position/order/navigation untouched; no backend,
no new dependencies.

## Technical Context

**Language/Version**: TypeScript ~6.0 (strict), React 19.2, Vite 8.2

**Primary Dependencies**: React, Tailwind CSS v4 theme tokens
(`--font-display/body/utility`), existing `index.css` flip primitives
(`.card-scene/.card-inner/.card-face/.card-back/.flipped`), existing
`usePointerParallax` tilt (reused, not duplicated)

**Storage**: N/A (presentational; no persistence, no API)

**Testing**: vitest 4 (`npm run test`), existing `src/**/*.test.ts(x)` pattern;
oxlint; `tsc -b` via `npm run build`

**Target Platform**: Modern evergreen browsers (desktop + mobile); CSS 3D
transforms only, no new rendering tech

**Project Type**: Web application (frontend-only change; backend untouched)

**Performance Goals**: Flip completes ≤0.8s; transform/opacity-only animation
(compositor thread); zero layout shift of hero during hover/focus cycles

**Constraints**: Card MUST never hit fully-transparent state; keyboard focus
MUST trigger the same end state as hover with focus ring preserved;
`prefers-reduced-motion` → resting faces, no motion; CTA unchanged;
landing-trio + type-role corrections only (no unrelated refactors)

**Scale/Scope**: 1 view (`views/LandingView.tsx`), flip CSS in `index.css`
(scoped additions), type-role audit across `views/` + `components/`
(class swaps only, no layout changes)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] I. Boy Scout / Blast Radius: modified files left equal-or-better;
  no untouched-legacy refactors; change localized to landing trio markup +
  scoped CSS + class-level type corrections.
- [x] II. Boundaries: no business-logic duplication (presentational only);
  reuses existing `.card-inner` flip language instead of inventing a second
  animation dialect; zero `any` in any new test/helper files.
- [x] III. Tests: existing `vitest` suites must pass; new contract tests
  reuse the established source-read + policy pattern (no DOM harness, no
  new mock framework) — same approach as 001's `GalaxyBackdrop.test.tsx`.
- [x] IV. Dependencies: NO new libraries; CSS + existing Tailwind tokens
  only; `package.json` untouched.
- [x] V. Target Architecture: N/A (no data layer involved); thin view +
  presentational classes only.

Post-design re-check: PASS — design below introduces no new violations.

## Project Structure

### Documentation (this feature)

```text
specs/002-card-ux-polish/
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
│   │   └── LandingView.tsx            # trio markup: unit flip (center), highlight/lift (flankers), focus parity
│   ├── components/
│   │   └── landing/
│   │       └── LandingTrio.test.tsx   # NEW: flip/highlight/type-role contract tests
│   └── index.css                      # scoped flip + highlight utilities, reduced-motion guards
└── tests → src/**/*.test.tsx (vitest)
```

**Structure Decision**: Web-application frontend-only change. Backend (`backend/`) untouched.
Single view edited, one new test file, scoped CSS additions; reading-flow
`TarotCard.tsx` flip behavior itself unchanged (reused as the reference pattern).

## Complexity Tracking

> No constitution violations requiring justification.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| — | — | — |
