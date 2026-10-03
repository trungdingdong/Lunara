# Contract: Landing Trio + Type Roles UI

**Feature**: `002-card-ux-polish` | **Type**: Frontend markup/CSS contract
(no HTTP/API surface)

## Flip Contract (center card)

- Rotation MUST live on the `.card-inner` unit (front + reverse together),
  triggered by `group-hover` AND `group-focus-visible`.
- No `rotateY` (or equivalent solo transform) may remain on an isolated
  `.card-face`; at every animation frame exactly one face is visible.
- Timing: ≤0.8s, transform/opacity only; leaving hover/focus returns smoothly
  to the resting face.

## Flanker Contract

- Hover/focus MUST apply highlight + lift only (glow border, slight rise);
  flankers MUST NOT rotate or change faces.

## Focus Contract

- Every card end state reachable by keyboard focus; existing visible focus
  ring preserved; tap (touch) yields the hover end state via focus.

## Motion-Safety Contract

- Under `prefers-reduced-motion`: resting faces only, no flip/highlight
  motion, no face change (confirmed 2026-10-03). New utilities MUST be
  covered by the existing reduced-motion guard.

## Type-Role Contract

- Allowed families: `font-display`, `font-body`, `font-utility` (+
  `var(--font-body)` base). No other family token or raw `font-family`
  declaration in views/components.
- Roles: display → headings/card names/quotes; body → prose/controls;
  utility → micro-labels/badges/timestamps/metadata.

## Scope Contract

- CTA position, order, navigation unchanged. Reading-flow flip unchanged.
- Galaxy backdrop, tilt, reveal, exit-fade behavior unchanged.
