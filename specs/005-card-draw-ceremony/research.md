# Research: Card Draw Ceremony

**Feature**: `005-card-draw-ceremony` | **Date**: 2026-10-03

All Technical Context items resolved; no NEEDS CLARIFICATION remains.

## R-01: Stage mapping (no machine changes)

- Decision: Ceremony lives entirely inside existing stages — `creating`
  renders the shuffle deck (request in flight), `dealing` renders the
  face-down fan + picks, last reveal calls the existing `beginStreaming`
  (same call `CardFan`'s `onAllRevealed` makes today), `failed` keeps the
  existing error path. Zero new stages, zero reducer changes.
- Rationale: Verified by reading `readingSession.ts` (stage union +
  `reveal-complete` gating) and `ReadingView.tsx` (stage rendering);
  smallest possible blast radius with identical streaming guarantees.
- Alternatives considered:
  - New `shuffling`/`picking` stages — rejected: reducer + derived-state
    ripple for purely presentational phases; constitution blast radius.
  - Artificial shuffle delay — rejected: shuffle covers exactly the
    request flight; padding wastes time and lies about progress.

## R-02: Pick model and fairness

- Decision: Fan positions map 1:1 to spread positions; the drawn array
  from the server is fixed at submit. Tapping a face-down card reveals
  that position's card (order of reveal is the only thing taps control).
  Remaining-pick count = unrevealed positions; last reveal fires
  `beginStreaming`.
- Rationale: Preserves the seeded server draw and all spread-position
  meanings bit-for-bit; the ceremony is reveal theater, never a redraw —
  this is the honest mapping and the spec's Assumption verbatim.
- Alternatives considered:
  - Taps choose which drawn cards appear where — rejected: reassigns
    server-drawn positions, breaks spread semantics and fairness story.
  - Pre-reveal all then "pick" cosmetically — rejected: dishonest;
    position mapping is simpler and true.

## R-03: Component shape (CeremonyFan)

- Decision: New `CeremonyFan({ cards, onAllRevealed })` mirroring
  `CardFan`'s props (drop-in at the same call site): internal pick state
  (revealed indices), per-card meaning-open state with focus return,
  shuffle sub-render for the `creating` stage, fan + prompt for `dealing`,
  float-on-hover/focus via CSS, flip via reused `TarotCard`
  (`flipped` prop) + existing `.card-inner` language. `CardFan.tsx` kept
  with `@deprecated` (removal is later cleanup).
- Rationale: Same call-site shape = minimal `ReadingView` diff; reuses
  proven flip/sequence idioms (`dealSequence` timing family); no second
  animation dialect.
- Alternatives considered:
  - Extending `CardFan` with ceremony flags — rejected: forks one
    component into two behaviors; clean replacement + deprecate is
    clearer and constitution-blessed.
  - Meaning as route/modal — rejected: spec wants in-place above the
    stream; a modal breaks scroll-to-reading flow.

## R-04: Meaning open/dismiss + focus

- Decision: Tapping a revealed card expands its meaning panel directly
  beneath it (name, orientation, keywords — reusing `TypographicFace`
  content idiom); dismiss via button/Escape closes and returns focus to
  the originating card element (stored ref). Only one meaning open at a
  time.
- Rationale: Meets FR-006/FR-007 with standard focus management; Escape
  + explicit dismiss covers keyboard, touch, and mouse uniformly.
- Alternatives considered:
  - Always-visible meanings under every card — rejected: wall of text
    before the reading streams; progressive disclosure reads better.
  - No focus return — rejected: fails keyboard acceptance.

## R-05: Reduced motion + failure + touch

- Decision: `environmentFlags()` reduced-motion → static deck + text
  status ("Shuffling…", "Pick N cards"), fan appears placed, flips and
  float instant/off; request failure → existing `failed` stage UI
  untouched (no fan); touch uses tap for everything (focus-visible CSS
  already fires on tap).
- Rationale: Reuses proven 001–004 patterns; FR-008 + edge cases by
  construction; no new helpers.
- Alternatives considered: none — established policy.

## R-06: Test strategy (no DOM harness, no new frameworks)

- Decision: `CeremonyFan.test.tsx` under node-env vitest: (1) pick-policy
  unit tests over a pure `nextPick` helper (reveal decrements, last reveal
  signals complete, double-tap idempotent); (2) source-contract assertions
  (shuffle/sh fan/prompt/float/meaning/dismiss classes present, no auto
  timers revealing without taps, reduced-motion guard covers new
  utilities); (3) stage-mapping test (ReadingView renders ceremony only
  in creating/dealing, stream still gated). Existing suites must pass.
- Rationale: Same 001–004 pattern; timing smoothness + visual proof stay
  in the quickstart manual check.
- Alternatives considered:
  - Timer-driven auto-reveal tests — rejected: the feature removes
    auto-reveal; tests assert taps drive reveals instead.
