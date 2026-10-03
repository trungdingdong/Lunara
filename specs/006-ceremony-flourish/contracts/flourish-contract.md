# Contract: Ceremony Flourish

**Feature**: `006-ceremony-flourish` | **Type**: Frontend component contract
(no HTTP/API surface)

## Timing Contract

- Shuffle performance runs 7–9s with live status, independent of request
  flight; early arrivals wait; failures abort to the error path.
- Picks disabled until deck-to-fan travel completes; fan motions
  sub-second, transform/opacity only, zero layout shift.

## Back Contract

- Every ceremony face-down card shows the esoteric line-work layer
  (arc rules + tick rings + sigil, token-tinted); no plain-gradient backs
  remain in the fan.

## Zoom Contract

- Activating a revealed card zooms it toward the viewer (neighbors dim in
  place) with a meaning text box beside it (stacked below on narrow
  screens, never overlapping/clipping).
- Exit button + Escape close, un-zoom, and return focus to the card;
  at most one zoom at a time.

## Motion-Safety Contract

- Reduced motion: static deck + countdown for the full window, placed fan,
  instant zoom, no float/travel; guards cover all new utilities.

## Scope Contract

- 005 fairness, stages, gating, and streaming unchanged. Landing trio,
  history/detail, tokens, store: behavior unchanged.
