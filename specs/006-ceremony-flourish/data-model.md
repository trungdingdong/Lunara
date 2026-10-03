# Data Model: Ceremony Flourish

**Feature**: `006-ceremony-flourish` | **Date**: 2026-10-03

No backend entities, no migrations, no API changes. Extends the 005
ceremony state; fairness model and session gating unchanged.

## Entity 1: Shuffle Performance (timed, decoupled)

| Field | Type | Default | Validation / Notes |
|---|---|---|---|
| `durationMs` | `number` | `8000` | Must satisfy 7000–9000 window |
| `elapsedMs` | `number` | `0` | Drives countdown status text |
| `cardsArrived` | `boolean` | `false` | Fan waits for performance end regardless |
| `failed` | `boolean` | `false` | `true` aborts performance → error path |

Transitions: `performing → (elapsed ≥ duration && arrived) → fan-deal-travel`;
`performing + failed → abort`. Reduced motion: same timing, static visuals.

## Entity 2: Esoteric Back (face-down face)

Shared ornament layer on every ceremony face-down card: concentric arc
rules + tick rings + central sigil (inline SVG, token-tinted). Replaces
the plain gradient back; landing trio backs out of scope.

## Entity 3: Zoom Meaning (focused card state)

| Field | Type | Default | Validation / Notes |
|---|---|---|---|
| `zoomed` | `number \| null` | `null` | At most one; card scales toward viewer, neighbors dim in place |
| `boxSide` | `'side' \| 'stacked'` | responsive | Stacked below on narrow screens, no overlap/clipping |
| `exit` | button + Escape | — | Closes box, un-zooms, returns focus to originating card |

## Non-goals

No session/stage changes, no fairness changes, no meaning-content changes,
no streaming changes, no new assets or dependencies, no landing-trio backs.
