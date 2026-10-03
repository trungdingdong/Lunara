# Tasks: Galaxy Astral Landing Background

**Input**: Design documents from `/specs/001-galaxy-landing-background/`
(plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md)

**Tests**: Included per constitution gate III (regression guardrails) and plan.md —
new `GalaxyBackdrop.test.tsx` reusing existing vitest setup; existing suites must pass.

**Organization**: Grouped by user story; each story independently testable.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story (US1, US2, US3)

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Baseline toolchain before touching landing code

- [X] T001 Verify frontend toolchain in `frontend/` (`npm install`, `npm run test`, `npm run build` baseline green)
- [X] T002 [P] Record landing baseline: document current `LiquidBasin` render path in `frontend/src/views/LandingView.tsx` + `frontend/src/components/landing/LiquidBasin.tsx` (screenshot/notes for regression comparison)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Safety net that MUST complete before any story work

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T003 Add landing characterization test in `frontend/src/views/LandingView.test.tsx` (asserts hero content renders: LUNARA title, card previews, "Begin your reading" CTA navigates to `/reading`)
- [X] T004 [P] Verify existing `frontend/src/components/landing/usePointerParallax.ts` behavior contract (shared pointer listener, `environmentFlags()` reduced-motion/touch) — no code change, confirm reuse path for backdrop

**Checkpoint**: Foundation ready — characterization test green, reuse paths confirmed

---

## Phase 3: User Story 1 - Immersive astral landing arrival (Priority: P1) ⭐ MVP

**Goal**: Animated galaxy/astral backdrop (stars + nebula drift) behind all hero content; old liquid-glass basin gone from landing

**Independent Test**: Open `/` → moving starry/galaxy scene behind title/cards/CTA (not basin); several seconds → gentle continuous drift/shimmer, foreground unshifted

### Tests for User Story 1

> NOTE: Write these tests FIRST, ensure they FAIL before implementation

- [X] T005 [P] [US1] Backdrop render test in `frontend/src/components/landing/GalaxyBackdrop.test.tsx` (renders nebula + canvas, `aria-hidden`, behind-content classes)
- [X] T006 [P] [US1] Landing integration test in `frontend/src/views/LandingView.test.tsx` (galaxy present, `LiquidBasin` absent on landing route)

### Implementation for User Story 1

- [X] T007 [P] [US1] Create `GalaxyBackdrop` canvas starfield in `frontend/src/components/landing/GalaxyBackdrop.tsx` (props: `starCountFar` default 140 "0–400", `starCountNear` default 80 "0–300", `driftSpeed` default `{ far: 6, near: 14 } px/s`, `nebulaIntensity` default 1.0 "0–1", `shootingStars` default true; precomputed arrays, single rAF loop, DPR cap 2 / 1.25 coarse)
- [X] T008 [P] [US1] Add nebula shimmer keyframes + backdrop utilities in `frontend/src/index.css` (theme-token gradients, dark default)
- [X] T009 [US1] Swap landing backdrop in `frontend/src/views/LandingView.tsx` (remove `LiquidBasin` Suspense + `BasinFallback` usage, render `GalaxyBackdrop` behind `relative z-10` hero; keep Reveal/tilt/exit-fade intact)
- [X] T010 [US1] Mark legacy basin deprecated in `frontend/src/components/landing/LiquidBasin.tsx` (`@deprecated — superseded by GalaxyBackdrop`; do NOT delete, do NOT remove from `package.json` this task)

**Checkpoint**: US1 fully functional — landing shows animated galaxy, old basin gone, tests green

---

## Phase 4: User Story 2 - Readable content over the galaxy (Priority: P1)

**Goal**: All text/controls legible and operable over brightest backdrop states

**Independent Test**: Read every landing block + activate CTA first try with backdrop animating; focus indicators visible

### Tests for User Story 2

- [X] T011 [P] [US2] Layering/interaction test in `frontend/src/components/landing/GalaxyBackdrop.test.tsx` (root `fixed inset-0 z-0 pointer-events-none`, zero focusables, CTA clickable through overlay)
- [X] T012 [P] [US2] Contrast test in `frontend/src/views/LandingView.test.tsx` (scrim present behind hero, light-theme variant renders without whiteout)

### Implementation for User Story 2

- [X] T013 [US2] Add content scrim + light-theme astral variant in `frontend/src/index.css` (`[data-theme="light"]` dimmed stars, stronger scrim; brightest-frame legibility)
- [X] T014 [US2] Enforce foreground layering in `frontend/src/views/LandingView.tsx` (hero stays `relative z-10`, backdrop `z-0`; preserve tab order and CTA focus ring; no backdrop-driven hero restyle)

**Checkpoint**: US1 + US2 work together — atmosphere with guaranteed legibility

---

## Phase 5: User Story 3 - Calm for sensitive and low-power visitors (Priority: P2)

**Goal**: Reduced-motion static scene, Canvas-failure fallback, pause off-screen/hidden

**Independent Test**: Reduced-motion ON (or blocked animation) → static starry scene, zero animation, all content usable

### Tests for User Story 3

- [X] T015 [P] [US3] Reduced-motion/static test in `frontend/src/components/landing/GalaxyBackdrop.test.tsx` (no rAF loop, single static frame when `prefers-reduced-motion: reduce`)
- [X] T016 [P] [US3] Fallback + cleanup test in `frontend/src/components/landing/GalaxyBackdrop.test.tsx` (Canvas failure → CSS starfield, no throw; unmount cancels rAF/disconnects observers)

### Implementation for User Story 3

- [X] T017 [US3] Implement static/fallback render in `frontend/src/components/landing/GalaxyBackdrop.tsx` (static first frame on reduced-motion via `environmentFlags()`; CSS-only starfield fallback on Canvas failure)
- [X] T018 [US3] Implement pause/resume in `frontend/src/components/landing/GalaxyBackdrop.tsx` (`document.visibilitychange` + `IntersectionObserver` on landing `<main>`; `animationState` derived `'playing' | 'paused' | 'static' | 'fallback'`)

**Checkpoint**: All stories independently functional — motion-safe and resilient

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Gates, docs, and scope hygiene

- [X] T019 [P] Run quickstart validation in `specs/001-galaxy-landing-background/quickstart.md` (all 6 scenarios: arrival, content, reduced-motion, fallback, pause, scope)
- [X] T020 [P] Full frontend gates in `frontend/` (`npm run test`, `npm run lint`, `npm run build` all green; no `package.json` dependency changes)
- [X] T021 Verify landing-only scope (reading/history/detail views pixel-identical; no backend changes; no unrelated refactors)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Setup — BLOCKS all user stories
- **User Stories (Phase 3+)**: Depend on Foundational; then proceed in priority order US1 → US2 → US3 (US2/US3 integrate with US1's component but test independently)
- **Polish (Phase 6)**: Depends on all desired stories complete

### User Story Dependencies

- **US1 (P1)**: After Foundational — no story dependencies (MVP)
- **US2 (P1)**: After Foundational — builds on US1 backdrop, independently testable via layering/contrast tests
- **US3 (P2)**: After Foundational — builds on US1 component, independently testable via motion/fallback tests

### Within Each User Story

- Tests FIRST, FAIL before implementation
- Component before view wiring (T007/T008 before T009)
- Core before integration; story complete before next priority

### Parallel Opportunities

- T002, T004, test tasks (T005/T006, T011/T012, T015/T016), T007/T008 can run in parallel (different files)
- T019/T020 parallel in Polish phase
- Stories sequential preferred (shared `GalaxyBackdrop.tsx`); tests within a story parallelizable

---

## Parallel Example: User Story 1

```bash
# Launch US1 tests together:
Task: "Backdrop render test in frontend/src/components/landing/GalaxyBackdrop.test.tsx"
Task: "Landing integration test in frontend/src/views/LandingView.test.tsx"

# Launch US1 creation together:
Task: "Create GalaxyBackdrop canvas starfield in frontend/src/components/landing/GalaxyBackdrop.tsx"
Task: "Add nebula shimmer keyframes + backdrop utilities in frontend/src/index.css"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 (Setup) + Phase 2 (Foundational)
2. Complete Phase 3 (US1: animated galaxy, basin removed from landing)
3. STOP and VALIDATE per US1 independent test + quickstart scenarios 1 & 6
4. Deploy/demo if ready

### Incremental Delivery

1. Setup + Foundational → safety net ready
2. US1 → animated galaxy MVP → validate
3. US2 → legibility/layering → validate (quickstart scenario 2)
4. US3 → motion safety/resilience → validate (quickstart scenarios 3–5)
5. Polish → gates green

---

## Notes

- Single shared file `GalaxyBackdrop.tsx` across stories → implement stories sequentially, tests in parallel
- No new dependencies (`liquid-gl` stays in `package.json`; removal is later cleanup)
- Commit after each task; stop at any checkpoint to validate story independently
- Constitution: localized landing-only diff, zero `any` in new files, existing suites pass
