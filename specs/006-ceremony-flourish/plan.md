# Implementation Plan: Ceremony Flourish

**Branch**: `006-ceremony-flourish` | **Date**: 2026-10-03 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/006-ceremony-flourish/spec.md`

## Summary

Extend the 005 ceremony three ways without touching its fairness model or
session gating: the shuffle becomes a timed ~8s performance (7–9s window,
decoupled from request flight — cards wait if arrived, errors cut it
short), the deck visibly travels into a spread fan with a pull prompt,
face-down cards gain an Esoteric Line Work back (CSS/SVG ornament, no
assets), and opening a meaning zooms the card toward the viewer with a
side text box (stacked below on narrow screens) closed by an exit button
with focus return. Reduced motion keeps instant changes plus a countdown
status. No backend, no new dependencies.

## Technical Context

**Language/Version**: TypeScript ~6.0 (strict), React 19.2, Vite 8.2

**Primary Dependencies**: React, existing `CeremonyFan` + `ceremonyPolicy`
(005 — extended, not replaced), existing `useReadingSession` stages
(unchanged), existing `TarotCard` flip language (unchanged),
`environmentFlags()` for reduced motion (reused)

**Storage**: N/A (no new persistence; existing stores untouched)

**Testing**: vitest 4 (`npm run test`), existing `src/**/*.test.ts(x)` pattern;
oxlint; `tsc -b` via `npm run build`

**Target Platform**: Modern evergreen browsers (desktop + mobile); CSS
transform/opacity animation only

**Project Type**: Web application (frontend-only change; backend untouched)

**Performance Goals**: Shuffle 7–9s with live status; zoom/fan motions
sub-second, transform/opacity-only (compositor thread); zero layout shift
of surrounding content; no artificial request delay (timer is performance,
flight independent)

**Constraints**: 005 fairness + stage gating MUST NOT change (taps order
reveals only; streaming still gates on full reveal); errors MUST cut the
performance short; zoom MUST NOT trap focus or scroll (button exit +
Escape + focus return); narrow screens stack text below; keyboard/touch
parity; reduced-motion instant; history/detail untouched

**Scale/Scope**: `components/CeremonyFan.tsx` + `ceremonyPolicy.ts`
(extended), scoped keyframes + back ornament in `index.css`; nothing else

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] I. Boy Scout / Blast Radius: ceremony files only; session, API,
  streaming, views beyond the fan, and history/detail untouched; no
  unrelated refactors.
- [x] II. Boundaries: extends 005 modules instead of duplicating them;
  reuses flip/focus helpers as-is; zero `any` in touched files.
- [x] III. Tests: existing suites must pass; new assertions reuse the
  source-contract + pure-policy pattern (no DOM harness, no new framework).
- [x] IV. Dependencies: NO new libraries or assets (SVG/CSS ornament
  only); `package.json` untouched.
- [x] V. Target Architecture: N/A (no data layer); no store/schema changes.

Post-design re-check: PASS — design below introduces no new violations.

## Project Structure

### Documentation (this feature)

```text
specs/006-ceremony-flourish/
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
│   │   ├── CeremonyFan.tsx             # EXTENDED: timed shuffle, deal travel, zoom meaning
│   │   ├── CeremonyFan.test.tsx        # EXTENDED: flourish contract
│   │   ├── ceremonyPolicy.ts           # EXTENDED: performance timer + zoom state
│   │   └── ceremonyPolicy.test.ts      # EXTENDED: timer/zoom policy
│   └── index.css                      # esoteric back ornament + zoom/deal keyframes + guards
└── tests → src/**/*.test.tsx (vitest)
```

**Structure Decision**: Web-application frontend-only change. Backend (`backend/`) untouched.
005's ceremony is extended in place (same files, same call site); nothing
else in the tree changes.

## Complexity Tracking

> No constitution violations requiring justification.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| — | — | — |
