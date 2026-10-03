# Tasks: Light Theme Transition

**Input**: Design documents from `/specs/003-light-theme-transition/`
(plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md)

**Tests**: Included per constitution gate III and plan.md —
token audit + overlay contract tests reusing the established source-contract
+ pure-policy pattern (node-env vitest, no DOM harness); existing suites
must pass.

**Organization**: Grouped by user story; each story independently testable.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story (US1, US2)

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Baseline toolchain before touching theme code

- [X] T001 Verify frontend baseline in `frontend/` (`npm run test`, `npm run build` green before changes)
- [X] T002 [P] Record theme baseline: capture current `@theme` tokens + `[data-theme="light"]` block in `frontend/src/index.css` and toggle wiring in `frontend/src/components/NavBar.tsx` + `frontend/src/stores/theme.ts` (notes for regression comparison)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Safety net that MUST complete before any story work

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T003 Add dark-mode characterization test in `frontend/src/components/theme/CelestialTransition.test.tsx` (locks current dark token values + persisted store key `lunara.theme.v1` — dark rendering must stay pixel-identical)
- [X] T004 [P] Verify theme reuse paths in `frontend/src/stores/theme.ts` (persisted store as authority) + `frontend/src/components/landing/usePointerParallax.ts` (`environmentFlags()` for reduced-motion) — no code change, confirm wiring points

**Checkpoint**: Foundation ready — dark baseline locked, reuse paths confirmed

---

## Phase 3: User Story 1 - Readable light mode (Priority: P1) ⭐ MVP

**Goal**: Light-mode text legible and cards distinct on every view; dark unchanged

**Independent Test**: Switch to light → review landing, reading, history, detail → every headline, paragraph, label, and card readable and distinct from the background

### Tests for User Story 1

> NOTE: Write these tests FIRST, ensure they FAIL before implementation

- [X] T005 [P] [US1] Token audit test in `frontend/src/components/theme/CelestialTransition.test.tsx` (every `@theme` color in `frontend/src/index.css` resolves to `var(--md-sys-color-*)`; zero static hex/rgb in theme tokens)

### Implementation for User Story 1

- [X] T006 [US1] Point `@theme` colors at M3 vars in `frontend/src/index.css` (indirection per R-02; keep dark values identical)
- [X] T007 [US1] Fix remaining light-role outliers in `frontend/src/index.css` (hardcoded light-illegible captions/glows; verify `[data-theme="light"]` roles pair legibly)
- [X] T008 [US1] Fix hardcoded light-illegible classes in views/components (`frontend/src/components/TarotCard.tsx`, `frontend/src/components/ReadingCard.tsx`, `frontend/src/views/ReadingDetailView.tsx`, others as the audit finds — class swaps only, no layout changes)

**Checkpoint**: US1 fully functional — light legible everywhere, dark identical, tests green

---

## Phase 4: User Story 2 - Sun/moon transition (Priority: P2)

**Goal**: Woodcut orbit overlay with sustain-spin, night/day blur backdrop, star trails, clean settle; reduced-motion instant; never on load

**Independent Test**: Toggle → paired orbit over geocentric rings, theme applies through the sweep; spam toggles sustain the spin with blurring backdrop + trails; stopping settles into the persisted theme with zero residue

### Tests for User Story 2

> NOTE: Write these tests FIRST, ensure they FAIL before implementation

- [X] T009 [P] [US2] Overlay contract test in `frontend/src/components/theme/CelestialTransition.test.tsx` (root `fixed inset-0 z-[100] pointer-events-none aria-hidden`, zero focusables, woodcut SVG + ring backdrop present, ≤1.5s choreography, midpoint theme application)
- [X] T010 [US2] Sustain/settle policy test in `frontend/src/components/theme/transitionPolicy.test.ts` (pure state machine: toggle-while-spinning sustains + retargets "never restarts"; idle 700ms "settles to pending theme"; reduced-motion "no overlay"; initial load "no overlay")

### Implementation for User Story 2

- [X] T011 [US2] Create transition state machine in `frontend/src/components/theme/transitionPolicy.ts` (fields: `spinning` default false, `pendingTheme`, `direction` "to-light | to-dark", `orbitAngle`, `idleMs` default 700, `durationMs` default 1200 "≤1500", `reducedMotion`; pure, zero `any`)
- [X] T012 [US2] Create overlay component in `frontend/src/components/theme/CelestialTransition.tsx` (inline woodcut sun/moon SVG + geocentric rings + night/day blur backdrop + orbit star trails; aria-hidden, non-interactive; unmounts with zero residue)
- [X] T013 [US2] Wire toggle to overlay in `frontend/src/components/NavBar.tsx` + `frontend/src/stores/theme.ts` (toggle mounts/sustains overlay; store stays theme authority; persisted key unchanged; boy-scout touch-ups only)
- [X] T014 [US2] Add overlay keyframes + guards in `frontend/src/index.css` (orbit arc, midpoint swap, star-trail streaks, night/day blend; `prefers-reduced-motion` disables all of it)

**Checkpoint**: US1 + US2 work together — legible light mode entered through the celestial sweep

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Gates, validation, scope hygiene

- [X] T015 [P] Run quickstart validation in `specs/003-light-theme-transition/quickstart.md` (all 6 scenarios: legibility, both sweeps, spam settles, reduced motion, reload)
- [X] T016 [P] Full frontend gates in `frontend/` (`npm run test`, `npm run lint` with no new findings, `npm run build` all green; no `package.json` changes)
- [X] T017 Verify scope (dark-mode pixel-identical outside transition; CTA/routes/reading flow/galaxy/trio untouched; no backend changes)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Setup — BLOCKS all user stories
- **User Stories (Phase 3+)**: Depend on Foundational; priority order US1 → US2 (both touch `index.css`, so run sequentially to avoid same-file conflicts)
- **Polish (Phase 5)**: Depends on all desired stories complete

### User Story Dependencies

- **US1 (P1)**: After Foundational — no story dependencies (MVP)
- **US2 (P2)**: After Foundational — builds on corrected tokens, independently testable via overlay contract + policy tests

### Within Each User Story

- Tests FIRST, FAIL before implementation
- Tokens before overlay (US1 before US2 — overlay tints assume corrected roles)
- Story complete before next priority

### Parallel Opportunities

- T002, T004, T009+T010 (different files), T015+T016 can run in parallel
- T005 (test file) vs T006–T008 sequential (test-first, then implement)
- Stories sequential required (shared `index.css`)

---

## Parallel Example: User Story 2

```bash
# Launch US2 tests together (different files):
Task: "Overlay contract test in frontend/src/components/theme/CelestialTransition.test.tsx"
Task: "Sustain/settle policy test in frontend/src/components/theme/transitionPolicy.test.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 (Setup) + Phase 2 (Foundational)
2. Complete Phase 3 (US1: light legible, dark identical)
3. STOP and VALIDATE per US1 independent test + quickstart scenario 1
4. Deploy/demo if ready

### Incremental Delivery

1. Setup + Foundational → safety net ready
2. US1 → light readable → validate
3. US2 → celestial sweep with sustain-spin → validate (quickstart scenarios 2–4)
4. Polish → gates green

---

## Notes

- Shared `index.css` across stories → implement sequentially
- Spam-spin: sustain + retarget, never restart; settle 700ms idle → final theme → unmount
- No new dependencies, no asset files (inline SVG only); commit after each task
- Constitution: localized diff, zero `any` in new files, existing suites pass
