# Tasks: Card Draw Ceremony

**Input**: Design documents from `/specs/005-card-draw-ceremony/`
(plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md)

**Tests**: Included per constitution gate III and plan.md —
pick-policy + ceremony contract tests reusing the established source-contract
+ pure-policy pattern (node-env vitest, no DOM harness); existing suites
must pass.

**Organization**: Grouped by user story; each story independently testable.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story (US1, US2)

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Baseline toolchain before touching ceremony code

- [X] T001 Verify frontend baseline in `frontend/` per scripts in `frontend/package.json` (`npm run test`, `npm run build` green before changes)
- [X] T002 [P] Record ceremony baseline: note current auto-deal `CardFan` usage in `frontend/src/views/ReadingView.tsx` + auto-reveal timing in `frontend/src/lib/dealSequence.ts` (notes for regression comparison)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Safety net that MUST complete before any story work

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T003 Add session characterization test in `frontend/src/lib/readingSession.test.ts` (locks stage machine `ask/creating/dealing/reading/failed`, `reveal-complete` gating, streaming waits for full reveal — none of which may change)
- [X] T004 [P] Verify flip reuse paths in `frontend/src/components/TarotCard.tsx` (`flipped` prop + `.card-inner` language) + `frontend/src/components/landing/usePointerParallax.ts` (`environmentFlags()`) — no code change, confirm ceremony building blocks

**Checkpoint**: Foundation ready — session machine locked, reuse paths confirmed

---

## Phase 3: User Story 1 - Shuffle, fan, hand-pick (Priority: P1) ⭐ MVP

**Goal**: Shuffle wait → spread-sized face-down fan → taps reveal positions → last reveal auto-starts streaming

**Independent Test**: Submit any spread → shuffle plays → fan with exact pick count → tap through all cards → interpretation streams with no extra tap

### Tests for User Story 1

> NOTE: Write these tests FIRST, ensure they FAIL before implementation

- [X] T005 [P] [US1] Pick-policy test in `frontend/src/components/ceremonyPolicy.test.ts` (pure `nextPick`: tap adds index, double-tap idempotent, remaining decrements, final pick signals complete exactly once, taps never alter the card array)
- [X] T006 [P] [US1] Ceremony staging test in `frontend/src/components/CeremonyFan.test.tsx` (shuffle deck + status in `creating`; face-down fan + live remaining count sized to `cards.length` in `dealing`; no auto-reveal timers; final reveal fires `onAllRevealed` once)

### Implementation for User Story 1

- [X] T007 [US1] Create pick state machine in `frontend/src/components/ceremonyPolicy.ts` (revealed indices, `remaining` "length − revealed.size", `complete` "remaining === 0", pure, zero `any`)
- [X] T008 [US1] Create ceremony component in `frontend/src/components/CeremonyFan.tsx` (shuffle deck, face-down fan + prompt, tap-to-flip via reused `TarotCard`, last reveal → `onAllRevealed`; same call-site shape as `CardFan`)
- [X] T009 [US1] Wire ceremony stages in `frontend/src/views/ReadingView.tsx` (render `CeremonyFan` in `creating`/`dealing`; streaming path untouched)
- [X] T010 [US1] Add ceremony keyframes + guards in `frontend/src/index.css` (shuffle riffle, fan deal-in, flip ≤0.8s transform-only; `prefers-reduced-motion` → instant + text status)
- [X] T011 [US1] Deprecate auto-deal in `frontend/src/components/CardFan.tsx` (`@deprecated` — superseded by `CeremonyFan`; do NOT delete, do NOT remove usages elsewhere if any)

**Checkpoint**: US1 fully functional — full pick flow streams, tests green

---

## Phase 4: User Story 2 - Float + per-card meanings (Priority: P2)

**Goal**: Hover/focus lift, in-place meanings with focus-returning dismiss, streamed reading below unchanged

**Independent Test**: Hover each card (lifts, neighbors still) → open a meaning → dismiss (button + Escape) → focus returns → scroll to the streamed interpretation

### Tests for User Story 2

> NOTE: Write these tests FIRST, ensure they FAIL before implementation

- [X] T012 [P] [US2] Float + meaning test in `frontend/src/components/CeremonyFan.test.tsx` (lift classes on hover/focus, transform-only, no layout shift; meaning panel content + single-open rule; dismiss returns focus to originating card)

### Implementation for User Story 2

- [X] T013 [US2] Add float styling in `frontend/src/index.css` (gentle lift on hover/focus-visible, transform-only; disabled under reduced motion)
- [X] T014 [US2] Add meaning panel in `frontend/src/components/CeremonyFan.tsx` (in-place name/orientation/keywords under originating card; dismiss button + Escape; focus return via stored ref; at most one open)

**Checkpoint**: US1 + US2 work together — tactile fan with studyable cards

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Gates, validation, scope hygiene

- [X] T015 [P] Run quickstart validation in `specs/005-card-draw-ceremony/quickstart.md` (all 6 scenarios: shuffle, fan + picks, float + meaning, scroll reading, spread sizes, reduced motion)
- [X] T016 [P] Full frontend gates in `frontend/` per scripts in `frontend/package.json` (`npm run test`, `npm run lint` with no new findings, `npm run build` all green; no `package.json` changes)
- [X] T017 Verify scope across `frontend/src/views/ReadingView.tsx`, `frontend/src/lib/readingSession.ts`, `frontend/src/components/CardFan.tsx` (stage machine + streaming unchanged; history/detail untouched; no backend changes)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Setup — BLOCKS all user stories
- **User Stories (Phase 3+)**: Depend on Foundational; priority order US1 → US2 (both touch `CeremonyFan.tsx` + `index.css`, so run sequentially)
- **Polish (Phase 5)**: Depends on all desired stories complete

### User Story Dependencies

- **US1 (P1)**: After Foundational — no story dependencies (MVP)
- **US2 (P2)**: After Foundational — builds on the ceremony fan, independently testable via float/meaning tests

### Within Each User Story

- Tests FIRST, FAIL before implementation
- Policy before component (T007 before T008)
- Story complete before next priority

### Parallel Opportunities

- T002, T004, T005+T006 (different files), T012 (own phase), T015+T016 can run in parallel
- Stories sequential required (shared `CeremonyFan.tsx` + `index.css`)

---

## Parallel Example: User Story 1

```bash
# Launch US1 tests together (different files):
Task: "Pick-policy test in frontend/src/components/ceremonyPolicy.test.ts"
Task: "Ceremony staging test in frontend/src/components/CeremonyFan.test.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 (Setup) + Phase 2 (Foundational)
2. Complete Phase 3 (US1: shuffle → fan → picks → streaming)
3. STOP and VALIDATE per US1 independent test + quickstart scenarios 1–2, 4–5
4. Deploy/demo if ready

### Incremental Delivery

1. Setup + Foundational → safety net ready
2. US1 → ceremony picks → validate
3. US2 → float + meanings → validate (quickstart scenario 3)
4. Polish → gates green

---

## Notes

- Shared `CeremonyFan.tsx` + `index.css` across stories → implement sequentially
- Fairness: taps order reveals only; `cards` array never mutated (asserted in T005)
- No new dependencies, no asset files; commit after each task
- Constitution: localized diff, zero `any` in new files, existing suites pass
