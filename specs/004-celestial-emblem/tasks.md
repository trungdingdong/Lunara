# Tasks: Celestial Emblem

**Input**: Design documents from `/specs/004-celestial-emblem/`
(plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md)

**Tests**: Included per constitution gate III and plan.md —
extended overlay/emblem contract + policy tests reusing the established
source-contract + pure-policy pattern (node-env vitest, no DOM harness);
existing suites must pass.

**Organization**: Grouped by user story; each story independently testable.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story (US1, US2)

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Baseline toolchain before touching overlay code

- [X] T001 Verify frontend baseline in `frontend/` per scripts in `frontend/package.json` (`npm run test`, `npm run build` green before changes)
- [X] T002 [P] Record overlay baseline: note current in-nav veil mount in `frontend/src/components/NavBar.tsx` + orbit staging in `frontend/src/components/theme/CelestialTransition.tsx` + orbit keyframes in `frontend/src/index.css` (notes for regression comparison)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Safety net that MUST complete before any story work

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T003 Add containment characterization test in `frontend/src/components/theme/CelestialTransition.test.tsx` (locks 003 behaviors that must NOT change: woodcut bodies, sustain-settle policy, persisted store key, token indirection)
- [X] T004 [P] Verify reuse inventory in `frontend/src/components/theme/transitionPolicy.ts` + `frontend/src/components/theme/CelestialTransition.tsx` (woodcut SVG bodies, run guards, timing constants) — no code change, confirm restage inputs

**Checkpoint**: Foundation ready — 003 behavior locked, restage inputs confirmed

---

## Phase 3: User Story 1 - Full-viewport transition (Priority: P1) ⭐ MVP

**Goal**: Veil escapes the nav containing block and covers the full viewport on any page

**Independent Test**: Toggle on any page → bodies travel edge-to-edge, never clipped to the navbar; devtools shows the veil as a direct `body` child, never inside `<nav>`

### Tests for User Story 1

> NOTE: Write these tests FIRST, ensure they FAIL before implementation

- [X] T005 [P] [US1] Portal mount test in `frontend/src/components/theme/CelestialTransition.test.tsx` (veil renders via portal to `document.body`; `NavBar.tsx` contains no veil markup inline)

### Implementation for User Story 1

- [X] T006 [US1] Portal-mount the veil in `frontend/src/components/theme/CelestialTransition.tsx` + `frontend/src/components/NavBar.tsx` (trigger/timers stay in NavBar; markup leaves the nav subtree; navbar blur untouched)

**Checkpoint**: US1 fully functional — full-screen transition, tests green

---

## Phase 4: User Story 2 - Emblem + rise choreography (Priority: P2)

**Goal**: Persistent top-left hero emblem per mode; incoming rises bottom → slot, outgoing exits; spam-safe settle; reduced-motion instant

**Independent Test**: Landing shows moon (dark) / sun (light) at rest top-left; toggle → newcomer rises into the slot as the theme applies; spam sustains then settles into the persisted theme with zero residue

### Tests for User Story 2

> NOTE: Write these tests FIRST, ensure they FAIL before implementation

- [X] T007 [P] [US2] Emblem test in `frontend/src/components/theme/CelestialTransition.test.tsx` (hero top-left emblem in `frontend/src/views/LandingView.tsx`: moon for dark, sun for light, absolute, never animated)
- [X] T008 [P] [US2] Rise contract test in `frontend/src/components/theme/CelestialTransition.test.tsx` (incoming bottom → slot, outgoing exits + fades, star trails follow rise path, theme applies on arrival, both directions mirrored)
- [X] T009 [US2] Rise policy test in `frontend/src/components/theme/transitionPolicy.test.ts` (sustain-while-spinning "never restarts"; idle 700ms "settles to pending theme"; reduced-motion "instant swap"; initial load "resting emblem, no overlay")

### Implementation for User Story 2

- [X] T010 [US2] Add hero emblem in `frontend/src/views/LandingView.tsx` (reuse 003 woodcut bodies scaled down, absolute top-left, mode-driven, no motion, no layout shift)
- [X] T011 [US2] Restage overlay to rise choreography in `frontend/src/components/theme/CelestialTransition.tsx` (shared arrival slot = emblem slot; dimmed ring backdrop; rise-path star trails; unmounts with zero residue)
- [X] T012 [US2] Extend policy for rise phases in `frontend/src/components/theme/transitionPolicy.ts` (fields: `incomingFrom` "bottom", `outgoingTo` "top-exit"; sustain shape: `spinning`, `pendingTheme`, `idleMs` 700, `durationMs` 1200 "≤1500" kept verbatim)
- [X] T013 [US2] Replace orbit keyframes with rise paths in `frontend/src/index.css` (incoming bottom → slot, outgoing exit + fade, trail streaks, night/day blend; `prefers-reduced-motion` disables all of it)

**Checkpoint**: US1 + US2 work together — full-screen rise into a resting emblem

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Gates, validation, scope hygiene

- [X] T014 [P] Run quickstart validation in `specs/004-celestial-emblem/quickstart.md` (all 6 scenarios: viewport, emblem, both rises, spam, reduced motion + reload)
- [X] T015 [P] Full frontend gates per `frontend/package.json` scripts (`npm run test`, `npm run lint` with no new findings, `npm run build` all green; no `package.json` changes)
- [X] T016 Verify scope across `frontend/src/index.css`, `frontend/src/stores/theme.ts`, `frontend/src/components/NavBar.tsx`, `frontend/src/views/` (003 tokens/store/policy shape unchanged; navbar blur, CTA, routes, galaxy, trio, reading flow untouched; no backend changes)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Setup — BLOCKS all user stories
- **User Stories (Phase 3+)**: Depend on Foundational; priority order US1 → US2 (both touch the overlay component, so run sequentially)
- **Polish (Phase 5)**: Depends on all desired stories complete

### User Story Dependencies

- **US1 (P1)**: After Foundational — no story dependencies (MVP)
- **US2 (P2)**: After Foundational — builds on the portal-mounted veil, independently testable via emblem/rise/policy tests

### Within Each User Story

- Tests FIRST, FAIL before implementation
- Mount fix before restage (US1 before US2)
- Story complete before next priority

### Parallel Opportunities

- T002, T004, T007+T008 (same file — write together in one session), T014+T015 can run in parallel
- T009 (policy test file) parallel-safe with T007/T008 (different file)
- Stories sequential required (shared overlay component)

---

## Parallel Example: User Story 2

```bash
# Launch US2 tests together:
Task: "Emblem + rise contract tests in frontend/src/components/theme/CelestialTransition.test.tsx"
Task: "Rise policy test in frontend/src/components/theme/transitionPolicy.test.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 (Setup) + Phase 2 (Foundational)
2. Complete Phase 3 (US1: portal-mounted full-viewport transition)
3. STOP and VALIDATE per US1 independent test + devtools mount check
4. Deploy/demo if ready

### Incremental Delivery

1. Setup + Foundational → safety net ready
2. US1 → viewport fix → validate
3. US2 → emblem + rise → validate (quickstart scenarios 2–5)
4. Polish → gates green

---

## Notes

- Shared overlay component across stories → implement sequentially
- 003 behaviors (tokens, store key, sustain-settle) are locked by T003 and must not change
- No new dependencies, no asset files (inline SVG only); commit after each task
- Constitution: localized diff, zero `any` in new files, existing suites pass
