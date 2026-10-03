# Implementation Plan: Celestial Emblem

**Branch**: `004-celestial-emblem` | **Date**: 2026-10-03 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/004-celestial-emblem/spec.md`

## Summary

Fix the 003 overlay staging bug (the veil mounts inside `<nav>`, whose
`backdrop-blur-md` makes it a containing block that traps the `fixed`
overlay in the navbar strip) by rendering the transition outside the nav
subtree, and replace the orbit staging with the requested emblem + rise
choreography: a persistent woodcut sun/moon emblem in the landing hero's
top-left (moon for dark, sun for light); on toggle the incoming body rises
from the bottom of the screen into that slot while the outgoing body exits,
theme applying on arrival. Spam toggles keep bodies cycling (sustain, no
restarts) and settle into the persisted theme. The 003 token fix, policy
shape, and store contract carry over unchanged.

## Technical Context

**Language/Version**: TypeScript ~6.0 (strict), React 19.2, Vite 8.2

**Primary Dependencies**: React (portal for overlay escape), Tailwind CSS
v4 tokens, existing zustand theme store (unchanged authority), existing
`transitionPolicy` sustain-settle shape (reused, extended for rise),
existing woodcut SVG bodies (reused, restaged)

**Storage**: Existing persisted theme key unchanged (no migration, no new keys)

**Testing**: vitest 4 (`npm run test`), existing `src/**/*.test.ts(x)` pattern;
oxlint; `tsc -b` via `npm run build`

**Target Platform**: Modern evergreen browsers (desktop + mobile); CSS/SVG
animation only

**Project Type**: Web application (frontend-only change; backend untouched)

**Performance Goals**: Single transition ≤1.5s; spam settles ≤1s after last
toggle; transform/opacity-only motion (compositor thread); no layout shift
of page content

**Constraints**: Overlay MUST escape the nav containing block and cover the
full viewport; MUST be `aria-hidden`, `pointer-events-none`, fully
unmounted at end; MUST NOT play on initial load or under reduced-motion;
emblem MUST sit top-left of the landing hero at rest; navbar keeps its blur
(untouched); dark/light token work from 003 untouched

**Scale/Scope**: Overlay component restage (`components/theme/`), new hero
emblem in `views/LandingView.tsx`, toggle wiring stays in `NavBar.tsx`
(minus the in-nav mount), keyframes in `index.css` (rise/exit paths replace
orbit)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] I. Boy Scout / Blast Radius: overlay + emblem + wiring only; navbar
  blur, tokens, store, and all other views untouched; no unrelated refactors.
- [x] II. Boundaries: reuses 003 woodcut bodies, policy shape, and store
  authority (no parallel theme state, no duplicated bodies); zero `any`
  in new/changed files.
- [x] III. Tests: existing suites must pass; contract + policy tests reuse
  the established source-contract pattern (no DOM harness, no new framework).
- [x] IV. Dependencies: NO new libraries, NO new assets (inline SVG only);
  `package.json` untouched.
- [x] V. Target Architecture: N/A (no data layer); persisted key unchanged.

Post-design re-check: PASS — design below introduces no new violations.

## Project Structure

### Documentation (this feature)

```text
specs/004-celestial-emblem/
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
│   │       ├── CelestialTransition.tsx      # RESTAGED: portal mount + rise choreography
│   │       ├── CelestialTransition.test.tsx # EXTENDED: full-viewport + rise contract
│   │       └── transitionPolicy.ts          # EXTENDED: rise phases (sustain shape kept)
│   ├── components/NavBar.tsx                # toggle triggers portal overlay (no in-nav mount)
│   ├── views/LandingView.tsx                # NEW: persistent top-left hero emblem
│   └── index.css                            # rise/exit keyframes replace orbit; guards kept
└── tests → src/**/*.test.tsx (vitest)
```

**Structure Decision**: Web-application frontend-only change. Backend (`backend/`) untouched.
003's token fix and store contract are inherited as-is; this feature restages
the overlay, adds the emblem, and swaps orbit keyframes for rise paths.

## Complexity Tracking

> No constitution violations requiring justification.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| — | — | — |
