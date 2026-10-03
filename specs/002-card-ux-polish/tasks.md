# Tasks: Card UX Polish

**Input**: Design documents from `/specs/002-card-ux-polish/`
(plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md)

**Tests**: Included per constitution gate III and plan.md —
new `LandingTrio.test.tsx` reusing the 001-established source-contract pattern
(node-env vitest, no DOM harness); existing suites must pass.

**Organization**: Grouped by user story; each story independently testable.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story (US1, US2)

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Baseline toolchain before touching trio markup

- [X] T001 Verify frontend baseline in `frontend/` (`npm run test`, `npm run build` green before changes)
- [X] T002 [P] Record trio baseline: note current solo-face hover rotation in `frontend/src/views/LandingView.tsx` (lines ~166-192) for regression comparison

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Safety net that MUST complete before any story work

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T003 Add trio characterization test in `frontend/src/components/landing/LandingTrio.test.tsx` (locks CTA text/target, hero order, trio card count — behavior that must NOT change)
- [X] T004 [P] Verify flip reference pattern in `frontend/src/components/TarotCard.tsx` + `frontend/src/index.css` (`.card-inner`/`.flipped`/`.card-face`/`.card-back` mechanics) — no code change, confirm reuse path

**Checkpoint**: Foundation ready — characterization green, reuse path confirmed

---

## Phase 3: User Story 1 - Cards stay visible and flip on hover (Priority: P1) ⭐ MVP

**Goal**: Center card flips as a unit (never vanishes); flankers highlight/lift; keyboard/touch parity; reduced-motion safe

**Independent Test**: Hover/focus each landing card → center reveals artwork reverse with no transparent frame, flankers glow + rise, all end states reachable by Tab, resting faces under reduced motion

### Tests for User Story 1

> NOTE: Write these tests FIRST, ensure they FAIL before implementation

- [X] T005 [P] [US1] Flip contract test in `frontend/src/components/landing/LandingTrio.test.tsx` (no solo-face `rotateY` on `.card-face`; rotation on `.card-inner` unit via `group-hover` + `group-focus-visible`)
- [X] T006 [P] [US1] Flanker + motion-safety test in `frontend/src/components/landing/LandingTrio.test.tsx` (highlight/lift classes, no rotation/face change; reduced-motion guard covers new utilities in `frontend/src/index.css`)

### Implementation for User Story 1

- [X] T007 [US1] Rework center card markup in `frontend/src/views/LandingView.tsx` (move hover rotation from front face to `.card-inner` unit; front + reverse rotate together; add `group-focus-visible` trigger; keep tilt/reveal/CTA intact)
- [X] T008 [US1] Add flanker highlight/lift in `frontend/src/views/LandingView.tsx` (glow border + slight rise on `group-hover`/`group-focus-visible`, same easing family, no face change)
- [X] T009 [US1] Add scoped trio utilities + reduced-motion guards in `frontend/src/index.css` (flip timing ≤0.8s transform-only; resting faces under `prefers-reduced-motion` — default: no face change)

**Checkpoint**: US1 fully functional — trio flips/highlights, never vanishes, tests green

---

## Phase 4: User Story 2 - Controlled type system (Priority: P2)

**Goal**: Every text element resolves to display/body/utility in its documented role; zero ad-hoc families

**Independent Test**: Audit every view → each heading/name uses display serif, prose/controls use body sans, micro-labels/metadata use utility mono

### Tests for User Story 2

- [X] T010 [P] [US2] Type-role audit test in `frontend/src/components/landing/LandingTrio.test.tsx` (every `font-*` class across `frontend/src/views/` + `frontend/src/components/` resolves to the allowlist; documents role map: display → headings/names/quotes, body → prose/controls, utility → micro-labels/metadata)

### Implementation for User Story 2

- [X] T011 [US2] Fix off-role text classes in landing + shared components (`frontend/src/views/LandingView.tsx`, `frontend/src/components/TarotCard.tsx`, `frontend/src/components/ReadingCard.tsx` — class swaps only, no layout changes)
- [X] T012 [US2] Fix off-role text classes in remaining views (`frontend/src/views/ReadingView.tsx`, `frontend/src/views/HistoryView.tsx`, `frontend/src/views/ReadingDetailView.tsx`, `frontend/src/components/NavBar.tsx`, `frontend/src/components/StreamPane.tsx`, `frontend/src/components/SpreadPicker.tsx`, `frontend/src/components/CommandPalette.tsx`, `frontend/src/components/MoonSteps.tsx` — class swaps only)

**Checkpoint**: US1 + US2 work together — fixed interactions in one typographic voice

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Gates, validation, scope hygiene

- [X] T013 [P] Run quickstart validation in `specs/002-card-ux-polish/quickstart.md` (all 7 scenarios: flip, flankers, keyboard, touch, type audit, reduced motion, regression)
- [X] T014 [P] Full frontend gates in `frontend/` (`npm run test`, `npm run lint` with no new findings, `npm run build` all green; no `package.json` changes)
- [X] T015 Verify scope (reading-flow flips unchanged; galaxy backdrop/tilt/reveal/exit-fade unchanged; CTA identical; no backend changes)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Setup — BLOCKS all user stories
- **User Stories (Phase 3+)**: Depend on Foundational; priority order US1 → US2 (US2 touches `LandingView.tsx` too, so run after US1 to avoid same-file conflicts)
- **Polish (Phase 5)**: Depends on all desired stories complete

### User Story Dependencies

- **US1 (P1)**: After Foundational — no story dependencies (MVP)
- **US2 (P2)**: After Foundational — independent audit, but sequenced after US1 since both edit `LandingView.tsx`

### Within Each User Story

- Tests FIRST, FAIL before implementation
- Markup before styles (T007/T008 before T009 verification)
- Story complete before next priority

### Parallel Opportunities

- T002, T004, test tasks (T005+T006), T013+T014 can run in parallel (different files)
- T011+T012 sequential preferred (T011 files differ from T012 files — actually parallel-safe; marked sequential only for review focus, may run together if desired)
- Stories sequential required (shared `LandingView.tsx`)

---

## Parallel Example: User Story 1

```bash
# Launch US1 tests together:
Task: "Flip contract test in frontend/src/components/landing/LandingTrio.test.tsx"
Task: "Flanker + motion-safety test in frontend/src/components/landing/LandingTrio.test.tsx"
```
Note: T005+T006 share one file — write both test blocks in a single edit session, then run once (both must FAIL pre-implementation).

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 (Setup) + Phase 2 (Foundational)
2. Complete Phase 3 (US1: unit flip + flanker highlight + motion safety)
3. STOP and VALIDATE per US1 independent test + quickstart scenarios 1–3, 5–6
4. Deploy/demo if ready

### Incremental Delivery

1. Setup + Foundational → safety net ready
2. US1 → hover bug fixed → validate
3. US2 → type audit → validate (quickstart scenario 4)
4. Polish → gates green

---

## Notes

- Shared `LandingView.tsx` across stories → implement sequentially
- Reduced-motion default: no face change (R-05); instant-swap alternative is a one-line change if the user overrides
- No new dependencies; commit after each task; stop at any checkpoint to validate
- Constitution: localized diff, zero `any` in new files, existing suites pass
