# Tasks: Ceremony Flourish

**Input**: Design documents from `/specs/006-ceremony-flourish/`
(plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md)

**Tests**: Included per constitution gate III and plan.md —
timer/zoom policy + flourish contract tests reusing the established
source-contract + pure-policy pattern (node-env vitest, no DOM harness);
existing suites must pass.

**Organization**: Grouped by user story; each story independently testable.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story (US1, US2)

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Baseline toolchain before touching ceremony code

- [X] T001 Verify frontend baseline in `frontend/` per scripts in `frontend/package.json` (`npm run test`, `npm run build` green before changes)
- [X] T002 [P] Record flourish baseline: note current shuffle timing + fan appearance + meaning panel in `frontend/src/components/CeremonyFan.tsx` (notes for regression comparison)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Safety net that MUST complete before any story work

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T003 Add ceremony characterization test in `frontend/src/components/CeremonyFan.test.tsx` (locks 005 behaviors that must NOT change: pick policy, fairness, stage gating, streaming trigger — none of which may change)
- [X] T004 [P] Verify 005 reuse inventory in `frontend/src/components/ceremonyPolicy.ts` + `frontend/src/components/CeremonyFan.tsx` (pick state machine, fan markup, focus helpers) — no code change, confirm extension points

**Checkpoint**: Foundation ready — 005 behavior locked, extension points confirmed

---

## Phase 3: User Story 1 - Eight-second shuffle into a fanned deal (Priority: P1) ⭐ MVP

**Goal**: Timed 7–9s shuffle with live status → visible deck-to-fan travel → gated picks → streaming

**Independent Test**: Submit any spread → stopwatch ~8s shuffle → deck travels into fan with pull prompt → tap through picks → streams with no extra tap; forced failure exits early to error path

### Tests for User Story 1

> NOTE: Write these tests FIRST, ensure they FAIL before implementation

- [X] T005 [P] [US1] Shuffle timer policy test in `frontend/src/components/ceremonyPolicy.test.ts` (performance window "7000–9000ms"; early arrivals wait; failure aborts; reduced-motion keeps timing with static visuals)
- [X] T006 [P] [US1] Deal-travel staging test in `frontend/src/components/CeremonyFan.test.tsx` (countdown status present; deck-travel classes + pick gating until travel ends; final reveal still fires `onAllRevealed` once)

### Implementation for User Story 1

- [X] T007 [US1] Extend timer policy in `frontend/src/components/ceremonyPolicy.ts` (fields: `durationMs` default 8000 "7000–9000 window", `elapsedMs`, `cardsArrived`, `failed` "aborts to error path"; pure, zero `any`)
- [X] T008 [US1] Extend shuffle + deal travel in `frontend/src/components/CeremonyFan.tsx` (timed performance with live countdown; deck-to-fan travel; picks disabled until travel completes)
- [X] T009 [US1] Add flourish keyframes + guards in `frontend/src/index.css` (shuffle performance, deal travel, sub-second motions transform-only; `prefers-reduced-motion` → static + countdown)

**Checkpoint**: US1 fully functional — timed ceremony into gated picks, tests green

---

## Phase 4: User Story 2 - Esoteric backs + zoom meaning (Priority: P2)

**Goal**: Line-work backs on all face-down cards; zoom-to-viewer with side (stacked-narrow) text box + button exit

**Independent Test**: Inspect face-down cards (esoteric ornament) → open a meaning (card advances, text beside it) → exit via button (card + focus return) → shrink viewport (box stacks below, no overlap)

### Tests for User Story 2

> NOTE: Write these tests FIRST, ensure they FAIL before implementation

- [X] T010 [P] [US2] Back + zoom contract test in `frontend/src/components/CeremonyFan.test.tsx` (esoteric ornament layer on face-down cards, no plain-gradient backs; zoom advance + side text box + exit button; narrow stacking rule; guards cover new utilities)

### Implementation for User Story 2

- [X] T011 [US2] Add esoteric back ornament in `frontend/src/components/CeremonyFan.tsx` + `frontend/src/index.css` (inline SVG arc rules + tick rings + sigil, token-tinted; ceremony fan only)
- [X] T012 [US2] Add zoom meaning in `frontend/src/components/CeremonyFan.tsx` (card advances toward viewer, neighbors dim in place; side text box, stacked below on narrow screens; exit button + Escape; focus return; single-zoom rule)

**Checkpoint**: US1 + US2 work together — ornate fan with cinematic meanings

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Gates, validation, scope hygiene

- [X] T013 [P] Run quickstart validation in `specs/006-ceremony-flourish/quickstart.md` (all 6 scenarios: 8s shuffle, esoteric backs, zoom meaning, narrow screen, failure, reduced motion)
- [X] T014 [P] Full frontend gates in `frontend/` per scripts in `frontend/package.json` (`npm run test`, `npm run lint` with no new findings, `npm run build` all green; no `package.json` changes)
- [X] T015 Verify scope across `frontend/src/components/CeremonyFan.tsx`, `frontend/src/components/ceremonyPolicy.ts`, `frontend/src/index.css` (005 fairness + gating + streaming unchanged; trio/history/detail/tokens/store untouched; no backend changes)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Setup — BLOCKS all user stories
- **User Stories (Phase 3+)**: Depend on Foundational; priority order US1 → US2 (both touch `CeremonyFan.tsx` + `index.css`, so run sequentially)
- **Polish (Phase 5)**: Depends on all desired stories complete

### User Story Dependencies

- **US1 (P1)**: After Foundational — no story dependencies (MVP)
- **US2 (P2)**: After Foundational — builds on the timed ceremony, independently testable via back/zoom contract

### Within Each User Story

- Tests FIRST, FAIL before implementation
- Policy before component (T007 before T008)
- Story complete before next priority

### Parallel Opportunities

- T002, T004, T005+T006 (different files), T013+T014 can run in parallel
- Stories sequential required (shared `CeremonyFan.tsx` + `index.css`)

---

## Parallel Example: User Story 1

```bash
# Launch US1 tests together (different files):
Task: "Shuffle timer policy test in frontend/src/components/ceremonyPolicy.test.ts"
Task: "Deal-travel staging test in frontend/src/components/CeremonyFan.test.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 (Setup) + Phase 2 (Foundational)
2. Complete Phase 3 (US1: timed shuffle → deal travel → gated picks)
3. STOP and VALIDATE per US1 independent test + quickstart scenarios 1 + 5
4. Deploy/demo if ready

### Incremental Delivery

1. Setup + Foundational → safety net ready
2. US1 → timed ceremony → validate
3. US2 → esoteric backs + zoom → validate (quickstart scenarios 2–4)
4. Polish → gates green

---

## Notes

- Shared `CeremonyFan.tsx` + `index.css` across stories → implement sequentially
- 005 fairness/gating/streaming locked by T003 and must not change
- Failure always aborts the performance; reduced motion keeps timing, drops motion
- No new dependencies, no asset files (inline SVG only); commit after each task
- Constitution: localized diff, zero `any` in new files, existing suites pass
