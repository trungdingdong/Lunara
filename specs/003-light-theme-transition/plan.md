# Implementation Plan: Light Theme Transition

**Branch**: `003-light-theme-transition` | **Date**: 2026-10-03 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/003-light-theme-transition/spec.md`

## Summary

Fix light-mode washout at its root (Tailwind `@theme` colors are static
dark values while only `--md-sys-*` vars switch per `data-theme` — point
the theme tokens at the switching M3 vars so every view follows the mode),
then add a full-screen celestial transition overlay: Medieval Woodcut style
sun + moon (inline SVG, no new assets) orbiting each other along an arc over
a geocentric-ring backdrop, theme flipping at each orbit midpoint.
Sustained toggling sustains the spin (no restarts): the backdrop blurs
rapidly between night and day with the orbit while shooting stars trail it;
shortly after the last toggle it settles into the final theme and the
overlay fully unmounts. Reduced motion → instant swap; first load never
plays. No backend, no new dependencies.

## Technical Context

**Language/Version**: TypeScript ~6.0 (strict), React 19.2, Vite 8.2

**Primary Dependencies**: React, Tailwind CSS v4 theme tokens, existing
zustand theme store (`stores/theme.ts`, persisted `lunara.theme.v1`),
existing NavBar toggle (reused trigger point), lucide-react icons (already
used for Sun/Moon glyphs)

**Storage**: Existing persisted theme key unchanged (no migration, no new keys)

**Testing**: vitest 4 (`npm run test`), existing `src/**/*.test.ts(x)` pattern;
oxlint; `tsc -b` via `npm run build`

**Target Platform**: Modern evergreen browsers (desktop + mobile); CSS/SVG
animation only

**Project Type**: Web application (frontend-only change; backend untouched)

**Performance Goals**: Transition completes ≤1.5s; transform/opacity-only
motion (compositor thread); token fix adds zero runtime cost (pure CSS var
indirection); no layout shift outside the overlay

**Constraints**: Overlay MUST be `aria-hidden`, `pointer-events-none`,
fully unmounted at end; MUST NOT play on initial load or under
reduced-motion; rapid toggles MUST resolve to exactly one theme matching
the persisted store; dark-mode appearance unchanged (except shared-token
mechanics); CTA/routes/navigation untouched

**Scale/Scope**: `index.css` theme block (token indirection + light-role
corrections), 1 new overlay component + test, minimal toggle/store wiring
in `NavBar.tsx`/`stores/theme.ts` (boy-scout touch-ups only)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] I. Boy Scout / Blast Radius: modified files left equal-or-better;
  store/NavBar touches limited to transition wiring; no unrelated refactors;
  overlay is one isolated component.
- [x] II. Boundaries: no business-logic duplication; reuses persisted theme
  store as the single source of truth (no parallel theme state); zero `any`
  in new files.
- [x] III. Tests: existing `vitest` suites must pass; new overlay tests reuse
  the source-contract + policy pattern (no DOM harness, no new framework);
  token fix covered by a class/var audit test.
- [x] IV. Dependencies: NO new libraries, NO new image assets (inline SVG
  woodcut + CSS rings only); `package.json` untouched.
- [x] V. Target Architecture: N/A (no data layer); persisted store key
  unchanged, no migration.

Post-design re-check: PASS — design below introduces no new violations.

## Project Structure

### Documentation (this feature)

```text
specs/003-light-theme-transition/
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
│   ├── components/
│   │   └── theme/
│   │       ├── CelestialTransition.tsx      # NEW: woodcut sun/moon orbit overlay
│   │       └── CelestialTransition.test.tsx # NEW: choreography + safety contract
│   ├── components/NavBar.tsx                # toggle wires transition start (minimal)
│   ├── stores/theme.ts                      # transition token plumbing (boy-scout)
│   └── index.css                            # token indirection + light-role fixes + overlay keyframes
└── tests → src/**/*.test.tsx (vitest)
```

**Structure Decision**: Web-application frontend-only change. Backend (`backend/`) untouched.
Token fix is CSS-only; overlay is one new component reusing the existing store;
dark mode and all routes pixel-identical outside the transition window.

## Complexity Tracking

> No constitution violations requiring justification.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| — | — | — |
