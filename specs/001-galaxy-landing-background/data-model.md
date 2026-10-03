# Data Model: Galaxy Astral Landing Background

**Feature**: `001-galaxy-landing-background` | **Date**: 2026-10-03

Presentational-only feature: no backend entities, no migrations, no API schema changes.
Entities below are frontend component state.

## Entity 1: GalaxyBackdrop

Full-viewport landing-page background. Single owner: `LandingView`.

| Field | Type | Default | Validation / Notes |
|---|---|---|---|
| `starCountFar` | `number` | `140` | 0–400; far parallax layer, slow drift, sine twinkle |
| `starCountNear` | `number` | `80` | 0–300; near layer, slightly larger/faster drift |
| `driftSpeed` | `{ far: number; near: number }` | `{ far: 6, near: 14 }` px/s | ≥ 0; calm range enforced by prop defaults |
| `nebulaIntensity` | `number` | `1.0` | 0–1; scales CSS glow opacity; light theme clamps lower |
| `shootingStars` | `boolean` | `true` | auto-`false` when reduced-motion or coarse pointer |
| `animationState` | `'playing' \| 'paused' \| 'static' \| 'fallback'` | derived | `static` = reduced-motion; `fallback` = Canvas unavailable; `paused` = hidden/off-screen |

State transitions:

```text
mount → playing | static (reduced-motion) | fallback (no Canvas)
playing ↔ paused (visibility / IntersectionObserver)
unmount → cleanup (cancel rAF, disconnect observers)
```

Relationships: renders behind exactly one `Landing Hero Content`; reads (never writes)
`environmentFlags()` and `[data-theme]`; owns one `<canvas>` + one nebula div + one
CSS-fallback div (mutually exclusive canvas vs fallback).

## Entity 2: Landing Hero Content (unchanged)

Title, card previews, CTA overlaying the backdrop. Position, order, navigation, and
pointer-parallax tilt behavior preserved bit-for-bit; only its backdrop sibling changes.
Gains a contrast scrim (styling treatment, not a data change).

## Non-goals

No store, query-key, route, or schema changes. `readingSession`, `queryKeys`, API types,
and SSE transport are untouched.
