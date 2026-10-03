# Contract: GalaxyBackdrop UI

**Feature**: `001-galaxy-landing-background` | **Type**: Frontend component contract
(no HTTP/API surface)

## Component

`GalaxyBackdrop(props?: GalaxyBackdropProps)` → renders backdrop only; no children,
no slots, no callbacks.

```tsx
interface GalaxyBackdropProps {
  starCountFar?: number;    // default 140
  starCountNear?: number;   // default 80
  nebulaIntensity?: number; // default 1.0, 0–1
  shootingStars?: boolean;  // default true (forced false on reduced-motion/coarse)
}
```

## DOM / Styling Contract

- Root: `<div aria-hidden="true" class="fixed inset-0 z-0 pointer-events-none">`
  containing nebula div + `<canvas>` (or CSS-fallback div when Canvas unavailable).
- Canvas: `absolute inset-0 h-full w-full`, device-pixel-ratio scaled, static first
  frame; animated via single rAF loop only when `playing`.
- Hero content wrapper MUST remain `relative z-10` and fully hit-testable above root.
- Focus outlines and tab order unchanged; backdrop exposes zero focusable elements.

## Behavioral Contract

| Given | When | Then |
|---|---|---|
| landing loads, motion OK | seconds pass | stars drift + twinkle, nebula shimmers slowly |
| `prefers-reduced-motion: reduce` | load | one static starry frame, no rAF loop |
| Canvas unavailable/throws | mount | CSS starfield fallback visible, no error, content usable |
| tab hidden / landing off-screen | state change | rAF stops; resumes on visible |
| brightest frame | reading text / CTA | headline legible, CTA focus ring visible, click navigates to `/reading` |
| light theme | load | dimmed astral variant, no whiteout, contrast preserved |
| any route except landing | navigate | backdrop absent; other views pixel-identical |

## Removal Contract (legacy)

- `LandingView` MUST NOT render `LiquidBasin` or `BasinFallback` after this feature.
- `LiquidBasin.tsx` stays in tree with `@deprecated — superseded by GalaxyBackdrop`
  header (deletion is a later cleanup task, not this contract).
