# Quickstart: Galaxy Astral Landing Background

**Feature**: `001-galaxy-landing-background` | **Date**: 2026-10-03

Validates the animated galaxy backdrop end-to-end. See [contract](./contracts/landing-galaxy-contract.md)
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

1. **Astral arrival**: load `/` → animated starfield + nebula glow visible behind
   LUNARA title, cards, CTA (not the old liquid-glass basin). Watch 15s → gentle drift/
   twinkle, foreground never shifts.
2. **Content over background**: read headline + subcopy over brightest stars → legible;
   Tab to "Begin your reading" → focus ring visible → Enter/click → navigates to
   `/reading` with exit-fade.
3. **Reduced motion**: OS/browser reduce-motion ON → reload → static starry scene, zero
   animation, all content usable.
4. **Fallback**: disable Canvas (or force failure) → reload → CSS starfield present, no
   blank page, no console error, CTA works.
5. **Pause**: switch tab away → animation halts; return → resumes. (DevTools: rAF idle
   while hidden.)
6. **Scope**: visit `/reading`, history, detail views → appearance unchanged (no galaxy).

## Gates

```bash
npm run test    # vitest incl. GalaxyBackdrop.test.tsx — must pass
npm run lint    # oxlint — must pass
npm run build   # tsc -b + vite build — must pass
```

Expected: all green, landing-only diff, no `package.json` dependency changes.
