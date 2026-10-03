# Research: Ceremony Flourish

**Feature**: `006-ceremony-flourish` | **Date**: 2026-10-03

All Technical Context items resolved; no NEEDS CLARIFICATION remains.

## R-01: Timed 8s shuffle decoupled from request flight

- Decision: The shuffle becomes a timed performance (7–9s, nominal 8s)
  owned by a policy timer, independent of the draw request: if cards
  arrive early they wait for the performance to finish; if the request
  fails, the performance is cut short into the existing `failed` stage.
  A live status (elapsed/countdown text) runs throughout; reduced motion
  shows a static deck + countdown for the same duration.
- Rationale: Implements FR-001/FR-006/FR-007 exactly — ceremony timing is
  a presentation decision, while errors must never be masked by theater.
  Decoupling avoids both failure modes (cutting the show short on slow
  networks, hiding errors behind a fixed timer).
- Alternatives considered:
  - Tying shuffle length to request flight — rejected: flight time is
    network luck (100ms–10s), not a ceremony; the user asked for ~8s.
  - Skippable shuffle — rejected: not requested; adds controls and state
    for no stated need (revisit if users complain).

## R-02: Visible deck-to-fan deal travel

- Decision: On performance end, the deck element animates into the fan
  positions (staggered travel, same 0.55s easing family as the existing
  fan-in) before the pull prompt activates; picks stay disabled until the
  travel completes so no tap lands on a moving card.
- Rationale: Makes FR-002's handoff literal and closes the perceived gap
  ("haven't been implemented yet") — the fan visibly comes from the deck.
  Input gating during travel prevents mis-taps.
- Alternatives considered:
  - Instant fan swap after shuffle — rejected: this is precisely the
    missing beat the user reported.
  - Pickable mid-travel — rejected: moving targets mis-tap and break the
    calm feel.

## R-03: Esoteric Line Work backs without assets

- Decision: Face-down cards gain a fine-line ornament layer — concentric
  arc rules, tick rings, and a small central sigil in inline SVG over the
  existing gradient, tinted from theme tokens. Pure CSS/SVG, no image
  files, shared by every face-down card (landing trio backs out of scope —
  ceremony fan only).
- Rationale: FR-003 with zero network cost and automatic theme-tinting;
  consistent with the woodcut/geocentric line language from 003–004.
- Alternatives considered:
  - PNG/SVG asset files — rejected: new binaries, extra requests,
    constitution dependency/asset weight.
  - Redrawing landing trio backs too — rejected: out of scope; ceremony
    fan only per FR-003's context.

## R-04: Zoom-to-meaning with side text box

- Decision: Activating a revealed card scales it toward the viewer
  (transform scale + shadow emphasis, neighbors dim via a sibling class,
  places kept — no layout shift) while the meaning text box opens beside
  it (CSS grid side slot on wide screens, stacked below under a narrow
  breakpoint). Exit button + Escape closes, returns the card, and returns
  focus to it. At most one zoom at a time.
- Rationale: FR-004/FR-005/FR-008 with standard focus management; grid
  placement keeps the box adjacent without overlapping the fan; the
  narrow breakpoint reuses the existing responsive idiom.
- Alternatives considered:
  - Modal dialog — rejected: heavier focus-trap machinery; breaks the
    scroll-to-reading continuity the fan sits in.
  - Full-card replacement (meaning swaps the card face) — rejected:
    loses the "card comes closer" effect the user asked for.

## R-05: Reduced motion, failure, touch (extended policy)

- Decision: Reduced motion → static deck + countdown for the 8s window,
  fan appears placed, zoom/float instant, travel distances zeroed via the
  existing guard. Failure → performance aborted to `failed` stage UI.
  Touch → tap throughout (pick, zoom, exit); no hover dependency.
- Rationale: Extends the 005 policy without new helpers; FR-006–FR-008 +
  edge cases by construction.
- Alternatives considered: none — established policy.

## R-06: Test strategy (no DOM harness, no new frameworks)

- Decision: Extend `ceremonyPolicy.test.ts` (timer policy: 7–9s window,
  early-arrival waits, failure aborts; zoom state: single-open, exit
  returns) and `CeremonyFan.test.tsx` (source contract: countdown status,
  deal-travel classes + pick gating, esoteric back layer, zoom + side box
  + exit button, narrow stacking rule, guards cover new utilities).
  Existing suites must pass.
- Rationale: Same 001–005 pattern; duration smoothness + visual proof
  stay in the quickstart manual check (stopwatch + eyes).
- Alternatives considered:
  - Real-timer 8s tests — rejected: slow suite; policy is pure and
    tested with injected elapsed values instead.
