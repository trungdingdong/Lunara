# Data Model: Light Theme Transition

**Feature**: `003-light-theme-transition` | **Date**: 2026-10-03

No backend entities, no migrations, no API changes. Frontend-only.

## Entity 1: Theme Tokens (corrected mapping)

Every Tailwind `@theme` color resolves to its M3 counterpart, which already
switches per `data-theme`. Single source of truth: `index.css`.

| Token | Resolves to | Notes |
|---|---|---|
| `--color-*` (all theme colors) | `var(--md-sys-color-*)` | No static hex in theme tokens |
| `--font-*` | unchanged (002 roles stand) | No new families |

Validation: audit test asserts zero static color values in `@theme`;
dark-mode rendering pixel-identical (characterization).

## Entity 2: Theme Transition (ephemeral overlay state)

Component-local only; the persisted theme store stays the authority.
Never persisted, never played on initial load.

| Field | Type | Default | Validation / Notes |
|---|---|---|---|
| `spinning` | `boolean` | `false` | `true` while mounted; toggles sustain, never restart |
| `pendingTheme` | `'dark' \| 'light'` | store value | Retargeted on every toggle; store stays authority |
| `direction` | `'to-light' \| 'to-dark'` | from toggle | Sun/moon roles mirrored; reverses with pending theme |
| `orbitAngle` | `number` | `0` | Backdrop night/day blend + star trails follow it |
| `idleMs` | `number` | `700` | No toggle for this long → settle to pending theme |
| `durationMs` | `number` | `1200` | Single-toggle orbit ≤1500 per SC-003 |
| `reducedMotion` | `boolean` | from `environmentFlags()` | `true` → no overlay, instant swap |

State transitions:

```text
toggle (idle) → spinning (mount) → toggle* (sustain: retarget, pump momentum)
spinning + idle 700ms → settle (ease to rest angle, apply pending theme) → unmount, zero residue
reducedMotion | initial load → instant swap, no overlay
```

Relationships: reads theme store (authority), renders above all content
(`z-[100]`, `aria-hidden`, `pointer-events-none`); owns inline woodcut SVG
(sun + moon) + geocentric ring backdrop; unmounts unconditionally at end.

## Non-goals

No store migration (key unchanged), no route/layout changes, no artwork
asset files, no dark-mode visual changes, no reading-flow behavior changes.
