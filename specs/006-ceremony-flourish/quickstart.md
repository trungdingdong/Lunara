# Quickstart: Ceremony Flourish

**Feature**: `006-ceremony-flourish` | **Date**: 2026-10-03

Validates the extended ceremony end-to-end. See [contract](./contracts/flourish-contract.md)
and [data model](./data-model.md) for expected behavior (not duplicated here).

## Prerequisites

- `cd frontend && npm install`
- Backend reachable (mock LLM provider is fine).

## Run

```bash
cd frontend
npm run dev        # http://localhost:5173 → /reading
```

## Validate

1. **Eight seconds**: press "Draw the cards" → stopwatch the shuffle
   (~8s, live status) → deck travels into the fan with a pull prompt.
2. **Esoteric backs**: every face-down card shows fine line-work
   ornament (no plain gradients).
3. **Zoom meaning**: open a revealed card → advances toward viewer,
   text box beside it → exit button returns it to the fan with focus.
4. **Narrow screen**: shrink to mobile width → text box stacks below
   the zoomed card, nothing overlaps or clips.
5. **Failure**: force the draw request to fail → shuffle exits early
   to the error path with retry (no 8s wait).
6. **Reduced motion**: reduce-motion ON → static deck + countdown for
   the window, placed fan, instant zoom, full flow completable.

## Gates

```bash
npm run test    # vitest incl. extended ceremony tests — must pass
npm run lint    # oxlint — no new findings
npm run build   # tsc -b + vite build — must pass
```

Expected: all green, ceremony-only diff, no `package.json` changes.
