# Quickstart: Light Theme Transition

**Feature**: `003-light-theme-transition` | **Date**: 2026-10-03

Validates the light-palette fix + celestial transition end-to-end. See
[contract](./contracts/theme-transition-contract.md) and
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

1. **Light legibility**: switch to light → walk landing, reading, history,
   detail → every headline, paragraph, label, and card readable and
   distinct from the background.
2. **Sweep dark→light**: toggle → woodcut sun/moon orbit across geocentric
   rings → light fully applied at finish, zero residue, content interactive.
3. **Sweep light→dark**: toggle back → mirrored roles, dark applied, zero
   residue; dark appearance identical to before this feature.
4. **Spam toggles**: mash the toggle repeatedly → orbit keeps spinning
   (no restarts), backdrop blurs night↔day rapidly with star trails →
   stop → settles into the persisted theme within ~1s, no stuck overlay.
5. **Reduced motion**: reduce-motion ON → toggle swaps instantly, no sweep.
6. **Reload**: reload in each theme → saved theme applies immediately with
   no sweep.

## Gates

```bash
npm run test    # vitest incl. CelestialTransition.test.tsx — must pass
npm run lint    # oxlint — no new findings
npm run build   # tsc -b + vite build — must pass
```

Expected: all green, theme-token + overlay-only diff, no `package.json`
changes.
