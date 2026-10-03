# Research: Celestial Emblem

**Feature**: `004-celestial-emblem` | **Date**: 2026-10-03

All Technical Context items resolved; no NEEDS CLARIFICATION remains.

## R-01: Root cause of the navbar-trapped overlay

- Decision: The 003 veil mounts inside `<nav>`, which carries
  `backdrop-blur-md`. Any `backdrop-filter` (like `filter`/`transform`)
  makes the element a containing block for `fixed` descendants, so
  `fixed inset-0` resolves against the navbar box instead of the viewport —
  exactly the reported symptom (orbit visible only in the top bar).
- Rationale: Verified by reading `NavBar.tsx` (nav classes) against the
  veil's `fixed inset-0 z-[100]`; no other ancestor clips it. This is
  established CSS behavior, not a Tailwind quirk.
- Alternatives considered: none — diagnosis is structural.

## R-02: Escape via portal, keep the trigger in NavBar

- Decision: Render the veil with `createPortal(..., document.body)` from
  the existing NavBar trigger. The toggle logic, run guards, and timing
  stay where they are; only the mount point leaves the nav subtree.
- Rationale: Minimal, localized fix — navbar keeps its blur untouched,
  no App-level restructuring, no new state owner; portal content still
  unmounts with the same settle logic.
- Alternatives considered:
  - Lifting overlay state to App — rejected: moves ownership for no
    behavioral gain; larger diff across the tree.
  - Removing the nav blur — rejected: visible regression to shipped nav
    styling for an overlay bug.
  - CSS `contain: layout` tweaks — rejected: fragile, fights the blur
    rather than escaping it.

## R-03: Rise choreography replacing the orbit

- Decision: On toggle, the incoming body starts below the viewport bottom
  edge and travels to the top-left slot while the outgoing body exits
  upward and fades; the theme applies as the newcomer arrives (same
  midpoint-apply shape as 003, re-anchored to arrival). Spam toggles keep
  bodies cycling along the same path (sustain, no restarts) and settle
  into the persisted theme per the existing idle-settle policy. The
  geocentric rings become a faint full-screen backdrop (kept, dimmed);
  star trails follow the rise path.
- Rationale: Directly implements the requested motion with the existing
  policy/state machine; arrival-triggered theme swap keeps both halves
  legible; transform/opacity-only keeps it compositor-cheap.
- Alternatives considered:
  - Keeping the orbit full-screen — rejected: user explicitly replaced it
    after seeing it staged wrong; orbit also reads chaotic under spam.
  - Crossfade in place at the slot — rejected: loses the requested
    bottom-to-top journey, which is the signature moment.

## R-04: Persistent hero emblem sharing the slot

- Decision: A small woodcut emblem (moon for dark, sun for light, reusing
  the 003 SVG bodies) sits absolute top-left inside the landing hero at
  rest with no motion. The transition's arrival point is the same slot
  coordinates, so the handoff reads as one motion; on settle the overlay
  unmounts and the emblem (now showing the new body) is simply revealed
  underneath. On non-landing pages the overlay anchors to the viewport
  top-left equivalent.
- Rationale: Satisfies FR-002/FR-003 with one shared visual anchor; reuse
  (not redraw) of the woodcut bodies per constitution; no layout shift
  (absolute positioning over existing hero padding).
- Alternatives considered:
  - Emblem in the navbar next to the toggle — rejected: user placed it in
    the hero; navbar space is constrained on mobile.
  - No persistent emblem, overlay only — rejected: removes the resting
    mode signal the user asked for.

## R-05: Reduced motion, load, failure (unchanged policy)

- Decision: Carry over 003 exactly — reduced motion swaps emblem + theme
  instantly with no travel; initial load renders the saved emblem at rest
  with no animation; render failure degrades to instant swap with no error
  and no stuck overlay.
- Rationale: Already-specified behavior, no reason to revisit; same
  `environmentFlags()` reuse.
- Alternatives considered: none.

## R-06: Test strategy (no DOM harness, no new frameworks)

- Decision: Extend `CelestialTransition.test.tsx` (portal mount assertion,
  rise-path classes, arrival-apply ordering, emblem presence per mode in
  `LandingView.tsx`) and `transitionPolicy.test.ts` (rise sustain/settle
  phases); keep the node-env source-contract + pure-policy pattern from
  001–003. Visual proof stays in the quickstart manual check.
- Rationale: Constitution-compliant; the containment regression gets a
  dedicated assertion (veil must not mount inside `<nav>`).
- Alternatives considered:
  - jsdom layout assertions — rejected: containing-block behavior isn't
    meaningfully assertable without a real layout engine; source-level
    portal assertion plus manual check is the honest coverage.
