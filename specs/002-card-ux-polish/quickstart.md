# Quickstart: Card UX Polish

**Feature**: `002-card-ux-polish` | **Date**: 2026-10-03

Validates the trio flip + type roles end-to-end. See [contract](./contracts/landing-trio-contract.md)
and [data model](./data-model.md) for expected behavior (not duplicated here).

## Prerequisites

- `cd frontend && npm install`
- No env keys needed (presentational change).

## Run

```bash
cd frontend
npm run dev        # http://localhost:5173 → open landing route `/`
```

## Validate

1. **Center flip**: hover the moon card → whole card flips to artwork + name,
   never blanks mid-motion; mouse-leave returns smoothly.
2. **Flankers**: hover each side card → glow + slight lift, no rotation or
   face change; timing feels matched to the center flip.
3. **Keyboard**: Tab through the trio → each end state appears with the focus
   ring visible; Enter on nothing required (cards are not links).
4. **Touch**: on a touch device (or mobile emulation), tap each card → same
   end state as hover appears; tap elsewhere dismisses it.
4. **Type audit**: walk landing → reading → history → detail → check one
   voice (serif headings/names, sans prose, mono micro-labels only).
5. **Reduced motion**: reduce-motion ON → reload → resting faces, zero motion
   on hover/focus, all content readable.
6. **Regression**: CTA position/behavior identical; galaxy backdrop, tilt,
   reveal, exit-fade unchanged; reading-flow flips unchanged.

## Gates

```bash
npm run test    # vitest incl. LandingTrio.test.tsx — must pass
npm run lint    # oxlint — no new findings
npm run build   # tsc -b + vite build — must pass
```

Expected: all green, landing-trio + class-level type diff only, no
`package.json` changes.
