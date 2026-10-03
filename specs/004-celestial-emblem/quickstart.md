# Quickstart: Celestial Emblem

**Feature**: `004-celestial-emblem` | **Date**: 2026-10-03

Validates the full-viewport rise transition + hero emblem. See
[contract](./contracts/emblem-transition-contract.md) and
[data model](./data-model.md) for expected behavior (not duplicated here).

## Prerequisites

- `cd frontend && npm install`
- No env keys needed (presentational change).

## Run

```bash
cd frontend
npm run dev        # http://localhost:5173
```

## Validate

1. **Full viewport**: toggle on any page → bodies travel edge-to-edge;
   nothing is clipped to the navbar strip (devtools: veil is a direct
   `body` child, never inside `<nav>`).
2. **Resting emblem**: landing hero top-left shows moon (dark) / sun
   (light), still, with hero layout unchanged.
3. **Rise dark→light**: incoming sun rises from the bottom into the slot,
   moon exits upward, light applies on arrival, zero residue.
4. **Rise light→dark**: mirrored; dark applies on arrival.
5. **Spam**: mash the toggle → bodies keep cycling, no restarts → stop →
   settles into the persisted theme within ~1s.
6. **Reduced motion + reload**: instant swaps, no travel; reload applies
   the saved emblem immediately.

## Gates

```bash
npm run test    # vitest incl. extended CelestialTransition tests — must pass
npm run lint    # oxlint — no new findings
npm run build   # tsc -b + vite build — must pass
```

Expected: all green, overlay/emblem-only diff, no `package.json` changes.
