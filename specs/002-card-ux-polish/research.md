# Research: Card UX Polish

**Feature**: `002-card-ux-polish` | **Date**: 2026-10-03

All Technical Context items are resolved; no NEEDS CLARIFICATION remains for
the implementer except the flagged reduced-motion default below.

## R-01: Why the center card vanishes on hover

- Decision: Root cause is rotation applied to the lone front face
  (`group-hover:[transform:rotateY(180deg)]` on `.card-face`) while
  `.card-face` sets `backface-visibility: hidden`. At 90°+ the face shows
  its hidden side → the glyph blanks out mid-hover instead of revealing
  anything.
- Rationale: Verified by reading `LandingView.tsx` + `index.css`; matches
  the reported symptom exactly (element "disappears whenever the cursor
  hovers").
- Alternatives considered: none — diagnosis is structural, not stylistic.

## R-02: Whole-unit flip reusing the reading-flow language

- Decision: Move the hover rotation onto the `.card-inner` wrapper so front
  + reverse rotate together (the same mechanics as `TarotCard.tsx`'s
  `.flipped` class: inner rotates 180°, `.card-back` pre-rotated, both
  faces `backface-visibility: hidden`). At every frame exactly one face is
  visible → SC-002 holds by construction. Keep the existing 0.7s
  `cubic-bezier(0.3, 0.9, 0.3, 1)` timing (≤0.8s per SC-003) and
  transform-only animation (compositor thread, no layout shift).
- Rationale: Satisfies FR-003/FR-007 and the spec edge case against a second
  animation dialect; reuses a proven, already-shipped pattern (constitution:
  no duplication).
- Alternatives considered:
  - Fade glyph out / highlight only on the center card — rejected: user
    explicitly asked for a flip ("spun around"), and artwork reverse
    already exists (`MOON_CARD`).
  - JS-driven flip state — rejected: pure CSS `group-hover`/`group-focus`
    needs no state, no re-renders, composes with the existing rAF tilt
    (tilt writes `transform` on the outer scene wrapper, flip on the inner
    unit — no property collision).

## R-03: Flanker highlight/lift (clarified option A)

- Decision: Flanking decorative backs get `group-hover`/`group-focus`
  treatment only — brighter border, soft outer glow, slight rise
  (`translateY(-4px)`), same 0.7s easing family; no face change, no rotation.
- Rationale: Locked by user clarification 2026-10-03; zero art/copy scope;
  trio reads as one set through shared timing + glow palette.
- Alternatives considered:
  - Mirrored-back flip — rejected by user (no reverse faces to show;
    motion without payoff).
  - New mini-faces — rejected: new artwork scope, explicitly out of scope.

## R-04: Keyboard + touch parity

- Decision: Drive all end states off `group-hover` AND `group-focus-visible`
  (cards wrapped in focusable elements or given `tabIndex` + existing focus
  ring preserved per FR-005). Touch: first tap focuses → same end state as
  hover; nothing essential is hover-only (CTA unaffected).
- Rationale: Meets FR-005 + edge cases with one mechanism; consistent with
  the repo's existing `:focus-visible` treatment in `index.css`.
- Alternatives considered:
  - Hover-only CSS — rejected: fails keyboard/touch acceptance.
  - Separate JS tap state — rejected: `:focus` already fires on tap;
    no extra state needed.

## R-05: Reduced motion (open clarify item → implementer default)

- Decision (DEFAULT, user may override to instant-swap): no face change at
  all under `prefers-reduced-motion` — flip/highlight transitions disabled
  via the existing reduced-motion CSS guard, resting faces stay. Calmest
  option and consistent with the repo's current
  `animation/transition-duration: 0.01ms` handling.
- Rationale: Unblocks planning/implementation without guessing wrong on a
  motion-safety behavior; trivially flippable to instant-swap later.
- Alternatives considered:
  - Instant face swap, no transition — pending user call; recorded as the
    alternative in the spec clarify thread.

## R-06: Type roles (audit, not redesign)

- Decision: Document roles — display serif: headings, card names, quotes;
  body sans: prose, controls, prose-like UI; utility mono: micro-labels,
  badges, timestamps, metadata — then audit every `views/` + `components/`
  text element and swap only off-role classes. No new families, no layout
  changes, no weight/size redesign (weights/sizes are not families).
- Rationale: Codebase grep shows all families already resolve to the three
  tokens; the defect is role drift (e.g., mono where body belongs), so a
  class-level audit is proportionate blast radius.
- Alternatives considered:
  - New typeface import — rejected: spec Assumption + constitution
    dependency invariant both forbid it.
  - Full typographic redesign — rejected: out of scope; roles only.

## R-07: Test strategy (no DOM harness, no new frameworks)

- Decision: `LandingTrio.test.tsx` under existing node-env vitest, using the
  001-established pattern: (1) source-read assertions on `LandingView.tsx`
  (no solo-face hover rotation remains; inner-unit flip + flanker highlight
  classes present; `tabIndex`/focus wiring present); (2) CSS assertions on
  `index.css` (flip timing ≤0.8s, reduced-motion guard covers new
  utilities); (3) type-role audit test (every `font-*` class in views +
  components resolves to the allowlist).
- Rationale: Constitution-compliant (reuse test utils, no new framework);
  motion smoothness + visual proof stay in the quickstart manual check.
- Alternatives considered:
  - jsdom/testing-library install — rejected: new dependency + harness for
    three cards; source-contract tests already proved adequate in 001.
