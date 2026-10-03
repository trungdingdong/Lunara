# Contract: Theme Tokens + Transition Overlay

**Feature**: `003-light-theme-transition` | **Type**: Frontend CSS/component
contract (no HTTP/API surface)

## Token Contract

- Every `@theme` color MUST resolve to `var(--md-sys-color-*)`; zero static
  hex/rgb values in theme tokens.
- Light-mode text MUST be legible and cards/surfaces distinct from the
  background on every view; dark-mode rendering MUST be pixel-identical
  to baseline.

## Overlay Contract

- Root: `<div aria-hidden="true" class="celestial-veil fixed inset-0 z-[100] pointer-events-none">`
  with orbit-ring backdrop + woodcut sun/moon SVG; zero focusable elements.
- Choreography: paired orbit along an arc, midpoint swap, total ≤1.5s per
  single toggle; sustained toggles sustain the spin (no restarts) with a
  rapidly blurring night/day backdrop and shooting stars trailing the
  orbit; settles ≤1s after the last toggle with mirrored roles per final
  direction.
- Lifecycle: mounts on first toggle only (never initial load); retargets
  (never restarts) on further toggles; unmounts unconditionally on settle
  with zero residue; exactly one theme (the store's) applies.
- Reduced motion: no overlay, instant swap. Render failure: instant swap,
  no error surfaced.

## Wiring Contract

- Toggle stays the single trigger (NavBar); persisted store stays the theme
  authority; persisted choice survives reload and applies instantly on boot.
- CTA, routes, navigation, galaxy backdrop, trio flips, reading flow:
  behavior unchanged.
