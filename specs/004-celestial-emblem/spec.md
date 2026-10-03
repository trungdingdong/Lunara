# Feature Specification: Celestial Emblem

**Feature Branch**: `004-celestial-emblem`

**Created**: 2026-10-03

**Status**: Draft

**Input**: User description: "the 003 plan is working incorrectly its only showing the moon and sun orbiting each other on the top nav bar, it should show the animation on the background hero element, i suggest adding a sun/moon to its relevant mode, then whenever the users press change between dark and light mode, the sun/moon will come up from the screen and move into place the moon/sun previously was, the position of the sun/moon could be in the top left of the screen"

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Transition plays full-screen, not trapped in the navbar (Priority: P1)

A visitor toggles the theme and watches the celestial transition sweep the
full viewport behind and above page content, instead of a small orbit
cramped inside the top navigation bar.

**Why this priority**: This fixes an outright rendering bug — the current
overlay is captured by the navigation bar's backdrop filter, so most users
never see the designed transition at all.

**Independent Test**: Toggle the theme; the sun/moon animation covers the
full screen (edges to edges) and is never clipped to the navbar strip.

**Acceptance Scenarios**:

1. **Given** any page, **When** the visitor toggles the theme, **Then** the
   transition renders across the full viewport with no clipping to the
   navigation bar.
2. **Given** the transition is playing, **When** it ends, **Then** no
   overlay residue remains and all content is interactive.

---

### User Story 2 - Persistent sun/moon emblem with rise choreography (Priority: P2)

A visitor sees a Medieval Woodcut style emblem in the top-left of the
landing hero — a moon in dark mode, a sun in light mode. On toggle, the
incoming body rises from the bottom of the screen and travels into the
emblem slot while the outgoing body leaves, and the new theme applies as
the newcomer arrives.

**Why this priority**: This is the requested redesign — a calm, legible
transition anchored to a persistent emblem instead of a full-screen orbit.

**Independent Test**: Toggle in either direction; the incoming body rises
from the bottom edge to the top-left slot, the outgoing body departs, and
the emblem shows the new mode's body at rest afterward.

**Acceptance Scenarios**:

1. **Given** dark mode at rest, **When** the page shows the landing hero,
   **Then** a woodcut moon emblem sits in the top-left of the hero (and a
   woodcut sun in light mode).
2. **Given** either mode, **When** the visitor toggles, **Then** the
   incoming body rises from the bottom of the screen into the top-left
   slot while the outgoing body exits, and the new theme applies as the
   newcomer arrives.
3. **Given** rapid repeated toggles, **When** toggles arrive without pause,
   **Then** bodies keep cycling without restarts and the final rest state
   matches the persisted theme with no stuck overlay.

### Edge Cases

- What happens with reduced-motion preferences? No bodies travel; the
  emblem swaps instantly and the theme swaps instantly.
- What happens on non-landing pages? The full-screen rise transition still
  plays (anchored to the viewport top-left slot); the persistent emblem
  itself lives on the landing hero only.
- What happens on the very first load? The saved theme's emblem renders
  at rest immediately with no travel animation.
- What if the artwork fails to render? The theme still switches correctly
  with no error and no stuck overlay.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: The transition overlay MUST render across the full viewport
  and MUST NOT be clipped or contained by the navigation bar (or any
  other ancestor styling).
- **FR-002**: The landing hero MUST show a persistent emblem in its
  top-left: a woodcut moon in dark mode, a woodcut sun in light mode,
  rendered at rest (no continuous motion).
- **FR-003**: On toggle, the incoming body MUST rise from the bottom of
  the screen and travel into the top-left slot while the outgoing body
  exits; the new theme MUST apply as the newcomer arrives.
- **FR-004**: The transition MUST work in both directions with sun/moon
  roles mirrored.
- **FR-005**: Rapid repeated toggles MUST keep bodies cycling without
  restarts and MUST settle into the persisted theme with no stuck overlay.
- **FR-006**: With reduced-motion preferences, NO travel animation MUST
  play; emblem and theme MUST swap instantly.
- **FR-007**: After the transition ends, NO overlay residue MUST remain;
  all content MUST be interactive.
- **FR-008**: The 003 light-palette fix, sustain-settle policy shape, and
  persisted store contract MUST be preserved (this feature revises only
  the overlay staging and choreography).

### Key Entities

- **Hero Emblem**: Persistent top-left celestial marker on the landing
  hero; attributes: current body (sun/moon per mode), rest state, woodcut
  style shared with the transition bodies.
- **Rise Transition**: Full-screen overlay shown only during a toggle;
  attributes: incoming body (rises bottom → top-left slot), outgoing body
  (exits), arrival-triggered theme application, clean end-state removal.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: In 100% of toggle trials on any page, the transition covers
  the full viewport with zero navbar clipping.
- **SC-002**: After every toggle (both directions, including spam
  sequences), the emblem shows the correct mode's body at rest with zero
  overlay residue.
- **SC-003**: Each single transition completes within 1.5 seconds; a spam
  sequence settles within 1 second after the last toggle.
- **SC-004**: With reduced motion enabled, toggling swaps emblem and theme
  instantly with no animation and all content remains usable.

## Assumptions

- The orbit-and-rings staging from 003 is replaced by the emblem + rise
  choreography; the woodcut sun/moon artwork language is reused, not
  redrawn from scratch.
- The navbar keeps its backdrop blur; the overlay escapes it by rendering
  outside the nav subtree (exact mechanism is an implementation detail).
- The emblem slot (top-left) is shared between the persistent hero emblem
  and the transition's arrival point so the handoff reads as one motion.
- The 003 token fix, policy module shape, and store contract carry over;
  only overlay staging/choreography and the new emblem are in scope.
- Per constitution: change stays localized to the overlay, emblem, and
  toggle wiring; no unrelated refactors; no new dependencies or mock
  frameworks; existing suites must pass.
