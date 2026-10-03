# Data Model: Card Draw Ceremony

**Feature**: `005-card-draw-ceremony` | **Date**: 2026-10-03

No backend entities, no migrations, no API changes. Session stage machine
unchanged (`ask/creating/dealing/reading/failed`).

## Entity 1: Ceremony Fan (component-local pick state)

Owner: `CeremonyFan`. Fan size = `cards.length` (spread-sized, 1/3/5/10).

| Field | Type | Default | Validation / Notes |
|---|---|---|---|
| `revealed` | `Set<number>` (indices) | empty | Tap adds index; double-tap idempotent |
| `remaining` | `number` | `cards.length` | Derived: length − revealed.size; prompt shows it |
| `complete` | `boolean` | `false` | Derived: remaining === 0 → fires `onAllRevealed` once |
| `meaningOpen` | `number \| null` | `null` | At most one open; dismiss returns focus to card |

State transitions:

```text
fan shown → tap(i) → revealed+i (flip) → … → complete → onAllRevealed (streaming)
revealed(i) + activate → meaningOpen=i → dismiss → meaningOpen=null (focus → card i)
```

Fairness invariant: taps NEVER alter `cards`; position i always reveals
`cards[i]`.

## Entity 2: Shuffle Deck (waiting state)

Shown during `creating` (request in flight) only.

| Field | Type | Notes |
|---|---|---|
| `status` | text (`"Shuffling…"`) | Always present; the reduced-motion carrier too |
| `motion` | deck riffle animation | Disabled under reduced motion (static deck) |

## Entity 3: Card Meaning (per-card detail)

Content: name, orientation (upright/reversed), keywords — same data
`TarotCard` already renders. In-place panel under the originating card;
Escape + dismiss button close it.

## Non-goals

No stage-machine changes, no store/schema changes, no artwork or meaning
content changes, no history/detail changes, no streaming changes.
