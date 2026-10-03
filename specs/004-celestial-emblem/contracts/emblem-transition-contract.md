# Contract: Emblem + Rise Transition

**Feature**: `004-celestial-emblem` | **Type**: Frontend markup/CSS contract
(no HTTP/API surface)

## Mount Contract (regression guard for the navbar trap)

- The veil MUST render outside the `<nav>` subtree (portal to
  `document.body`); `NavBar.tsx` MUST NOT contain the veil markup inline.
- Root: `<div aria-hidden="true" class="celestial-veil fixed inset-0 z-[100] pointer-events-none">`;
  zero focusable elements; covers the full viewport unclipped.

## Emblem Contract

- Landing hero top-left holds the resting emblem: woodcut moon in dark,
  woodcut sun in light; absolutely positioned, never animated, no layout
  shift of hero content.

## Rise Contract

- Incoming body travels bottom edge → top-left slot; outgoing body exits
  upward + fades; star trails follow the rise path; dimmed geocentric
  rings persist as backdrop.
- Theme applies as the newcomer arrives; both directions mirrored.
- Spam toggles sustain cycling (no restarts); settle ≤1s after last
  toggle into the persisted theme; unmount with zero residue.
- Reduced motion / initial load: instant emblem + theme swap, no overlay.

## Scope Contract

- 003 token fix, store key, and sustain-settle policy shape unchanged.
- Navbar blur, CTA, routes, galaxy, trio, reading flow: behavior unchanged.
