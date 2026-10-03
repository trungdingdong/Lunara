# Quickstart: Card Draw Ceremony

**Feature**: `005-card-draw-ceremony` | **Date**: 2026-10-03

Validates the ceremony end-to-end. See [contract](./contracts/ceremony-fan-contract.md)
and [data model](./data-model.md) for expected behavior (not duplicated here).

## Prerequisites

- `cd frontend && npm install`
- Backend reachable (`../backend`, mock LLM provider is fine).

## Run

```bash
cd frontend
npm run dev        # http://localhost:5173 → /reading
```

## Validate

1. **Shuffle**: ask a question, pick a spread, press "Draw the cards" →
   shuffling deck + status while the request flies (never blank/frozen).
2. **Fan + picks**: fan of face-down cards with "pick N" prompt appears →
   tap cards one by one → each flips to its card, count decrements →
   final flip starts streaming with no extra tap.
3. **Float + meaning**: hover a card → gentle lift; open a revealed
   card's meaning → name/orientation/keywords in place; dismiss →
   focus returns to the card.
4. **Scroll to reading**: scroll down → streamed interpretation below
   the fan, identical in content to the pre-ceremony flow.
5. **Spread sizes**: repeat with 1, 3, 5, and 10-card spreads → fan
   sizes and pick counts match each time.
6. **Reduced motion**: reduce-motion ON → full ceremony completable
   (text statuses, instant flips) with zero animation.

## Gates

```bash
npm run test    # vitest incl. CeremonyFan.test.tsx — must pass
npm run lint    # oxlint — no new findings
npm run build   # tsc -b + vite build — must pass
```

Expected: all green, ceremony-only diff, no `package.json` changes.
