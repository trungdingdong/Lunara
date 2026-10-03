# Implementation Plan: Card Draw Ceremony

**Branch**: `005-card-draw-ceremony` | **Date**: 2026-10-03 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/005-card-draw-ceremony/spec.md`

## Summary

Replace the reading view's automatic deal with a tactile ceremony reusing
the existing session stage machine untouched: the `creating` stage shows a
shuffling deck (waiting animation over the in-flight request), the
`dealing` stage shows a face-down fan sized to the spread with a pick
prompt, and each tap flips that position's pre-drawn card — the last
reveal fires the existing `beginStreaming` with no extra tap. Fanned cards
lift on hover/focus, revealed cards open an in-place meaning with
focus-returning dismiss, and the streamed reading below is unchanged.
Fairness is preserved by construction: taps order the reveal only; the
server draw stands. Reduced motion gets instant state changes with text
status. No backend, no new dependencies.

## Technical Context

**Language/Version**: TypeScript ~6.0 (strict), React 19.2, Vite 8.2

**Primary Dependencies**: React, existing `useReadingSession` stage machine
(`ask/creating/dealing/reading/failed` — reused unchanged), existing
`TarotCard` flip primitives (reused), existing `dealSequence` timing idiom
(reused), `environmentFlags()` for reduced motion (reused)

**Storage**: N/A (no new persistence; existing reading store untouched)

**Testing**: vitest 4 (`npm run test`), existing `src/**/*.test.ts(x)` pattern;
oxlint; `tsc -b` via `npm run build`

**Target Platform**: Modern evergreen browsers (desktop + mobile); CSS
transform/opacity animation only

**Project Type**: Web application (frontend-only change; backend untouched)

**Performance Goals**: Each flip/fan motion ≤0.8s; transform/opacity-only
(compositor thread); zero layout shift of surrounding content; shuffle
covers exactly the request flight (no artificial delay)

**Constraints**: Session stage machine MUST NOT change shape (new stages
forbidden — ceremony lives inside `creating`/`dealing`); streaming MUST
still gate on full reveal via the existing `beginStreaming` path; taps
MUST NOT alter the drawn set; keyboard/touch parity; reduced-motion
instant; history/detail views untouched

**Scale/Scope**: `views/ReadingView.tsx` (stage rendering), 1 new ceremony
component + test (`components/CeremonyFan.*`), scoped keyframes in
`index.css`, `CardFan.tsx` deprecated in place

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] I. Boy Scout / Blast Radius: session machine, API, streaming, and
  history/detail untouched; change localized to the reading-view ceremony;
  `CardFan` deprecated in place, not deleted this task.
- [x] II. Boundaries: no business-logic duplication; reuses `TarotCard`,
  stage machine, `beginStreaming`, and motion helpers as-is; zero `any`
  in new files.
- [x] III. Tests: existing suites must pass; new ceremony tests reuse the
  source-contract + pure-policy pattern (no DOM harness, no new framework).
- [x] IV. Dependencies: NO new libraries or assets; CSS + existing tokens
  only; `package.json` untouched.
- [x] V. Target Architecture: N/A (no data layer); no store/schema changes.

Post-design re-check: PASS — design below introduces no new violations.

## Project Structure

### Documentation (this feature)

```text
specs/005-card-draw-ceremony/
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
│   │   └── ReadingView.tsx            # creating → shuffle; dealing → ceremony fan
│   ├── components/
│   │   ├── CeremonyFan.tsx             # NEW: shuffle/fan/pick/float/meaning
│   │   ├── CeremonyFan.test.tsx        # NEW: ceremony contract + pick policy
│   │   └── CardFan.tsx                 # DEPRECATED in place (auto-deal retired)
│   └── index.css                      # ceremony keyframes + reduced-motion guards
└── tests → src/**/*.test.tsx (vitest)
```

**Structure Decision**: Web-application frontend-only change. Backend (`backend/`) untouched.
Session machine and streaming path reused verbatim; ceremony is a new
presentational component slotted into existing stages.

## Complexity Tracking

> No constitution violations requiring justification.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| — | — | — |
