# Contract: Ceremony Fan

**Feature**: `005-card-draw-ceremony` | **Type**: Frontend component contract
(no HTTP/API surface)

## Component

`CeremonyFan({ cards, onAllRevealed })` — same call-site shape as `CardFan`.

## Staging Contract

- `creating` stage renders the shuffle deck + text status (never blank).
- `dealing` stage renders the face-down fan + pick prompt with the live
  remaining count; fan size always equals `cards.length`.
- No auto-reveal timers: faces turn ONLY on taps (keyboard/touch/click).
- Final reveal fires `onAllRevealed` exactly once → existing streaming path.

## Interaction Contract

- Hover/focus lifts the card gently (transform-only, neighbors unmoved,
  no layout shift); tap flips it to its spread position's card.
- Activating a revealed card opens its meaning in place (name, orientation,
  keywords); dismiss (button or Escape) closes it and returns focus to
  the originating card; at most one open at a time.
- Reduced motion: instant state changes, text status, no float/flip travel.

## Scope Contract

- Session stages, reducer, streaming, API: unchanged. `CardFan.tsx`
  deprecated in place (not deleted this task). History/detail untouched.
