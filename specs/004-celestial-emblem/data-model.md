# Data Model: Celestial Emblem

**Feature**: `004-celestial-emblem` | **Date**: 2026-10-03

No backend entities, no migrations, no API changes. Frontend-only.
003 token fix and store contract inherited unchanged.

## Entity 1: Hero Emblem (persistent, at rest)

Owner: `LandingView`. Absolute top-left inside the hero; no motion ever.

| Field | Type | Default | Validation / Notes |
|---|---|---|---|
| `body` | `'sun' \| 'moon'` | from theme (`light`→sun, `dark`→moon) | Reuses 003 woodcut SVG, scaled down |
| `slot` | fixed hero top-left | — | Shared arrival coordinates with the transition |

## Entity 2: Rise Transition (ephemeral overlay, portal-mounted)

Extends the 003 sustain-settle shape; orbit fields replaced by rise fields.

| Field | Type | Default | Validation / Notes |
|---|---|---|---|
| `spinning` | `boolean` | `false` | Toggles sustain, never restart |
| `pendingTheme` | `'dark' \| 'light'` | store value | Retargeted on every toggle |
| `direction` | `'to-light' \| 'to-dark'` | from toggle | Incoming/outgoing roles mirrored |
| `incomingFrom` | `'bottom'` | `'bottom'` | Rises bottom edge → top-left slot |
| `outgoingTo` | `'top-exit'` | `'top-exit'` | Exits upward + fades |
| `idleMs` | `number` | `700` | No toggle this long → settle |
| `durationMs` | `number` | `1200` | Single rise ≤1500 per SC-003 |
| `reducedMotion` | `boolean` | from `environmentFlags()` | `true` → instant swap, no overlay |

State transitions:

```text
toggle (idle) → rising (portal-mounted) → toggle* (sustain: retarget, keep cycling)
rising + idle 700ms → settle (newcomer seated in slot, theme applied) → unmount, zero residue
reducedMotion | initial load → instant emblem + theme swap, no overlay
```

Relationships: portal-mounted to `document.body` (never inside `<nav>`);
arrival slot equals the emblem slot; reads theme store (authority); owns
woodcut bodies + dimmed ring backdrop + rise-path star trails.

## Non-goals

No token changes (003 stands), no store migration, no route/layout changes,
no new assets or dependencies, no dark-mode visual changes.
