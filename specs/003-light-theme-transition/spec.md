# Feature Specification: Light Theme Transition

**Feature Branch**: `003-light-theme-transition`

**Created**: 2026-10-03

**Status**: Draft

**Input**: User description: "fix the light mode UI, the text and cards components are all the same with the light mode background, i want so when ever the user presses between the light and dark mode, theres an animation of the sun and moon rotation across the screen transitioning between the 2 modes"

## Clarifications

### Session 2026-10-03

- Q: When the theme toggles, how should the sun and moon move across the screen? → A: Sun and moon orbit each other along an arc (paired rotation, midpoint swap).
- Q: What art style should the transition use? → A: Medieval Woodcut style sun and moon over a geocentric-model background.
- Q: What happens when the visitor spams the toggle repeatedly? → A: The orbit keeps spinning until they stop; the backdrop rapidly blurs between night and day with shooting stars trailing the orbit; on stop it settles into the final theme cleanly.

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Readable light mode (Priority: P1)

A visitor switches to light mode and can read every headline, paragraph,
and card (names, badges, metadata) distinctly against the light background;
nothing blends into the backdrop.

**Why this priority**: This fixes a broken mode — light theme is currently
unusable where text and cards match the background. Contrast is a
correctness issue, not polish.

**Independent Test**: Switch to light mode and review landing, reading,
history, and detail views; every text element and card is legible and
visually distinct from the background.

**Acceptance Scenarios**:

1. **Given** light mode is active, **When** the visitor reads any headline,
   body copy, or micro-label, **Then** the text is clearly legible against
   its background (no tone-on-tone washout).
2. **Given** light mode is active, **When** the visitor views any card
   (landing trio, reading cards, history entries), **Then** each card is
   visually distinct from the page background with a defined edge or
   surface treatment.

---

### User Story 2 - Sun/moon transition between modes (Priority: P2)

A visitor taps the theme toggle and watches a sun and moon sweep across
the screen in a short rotating transition while the interface crosses
from one mode to the other, landing cleanly in the new theme.

**Why this priority**: The transition turns a jarring instant swap into a
signature moment, but it decorates a mode switch that must first work
correctly (Story 1).

**Independent Test**: Toggle the theme in either direction; a sun/moon
sweep plays across the screen, the new theme applies exactly when the
sweep completes, and the toggle stays responsive throughout.

**Acceptance Scenarios**:

1. **Given** either theme is active, **When** the visitor activates the
   theme toggle, **Then** a Medieval Woodcut style sun and moon orbit each
   other along an arc across the screen over a geocentric-model background,
   and the opposite theme is fully applied as the sweep finishes.
2. **Given** the visitor keeps toggling repeatedly, **When** toggles arrive
   without pause, **Then** the orbit keeps spinning (rather than
   restarting), the backdrop blurs rapidly between night and day, and
   shooting stars trail along the orbit until the visitor stops.
2. **Given** the transition is playing, **When** it ends, **Then** no
   overlay, dimming, or animation residue remains and all content is
   interactive in the new theme.

### Edge Cases

- What happens with reduced-motion preferences? No sweep plays; the theme
  swaps instantly with no overlay shown.
- What happens if the visitor toggles rapidly mid-transition? The orbit
  sustains its spin while toggles keep arriving; shortly after the last
  toggle it settles into the final theme matching the persisted choice,
  with no stuck overlay.
- What happens on the very first load with a saved theme? The saved theme
  applies immediately with no transition (no sweep on page load).
- What if the sweep assets fail to render? The theme still switches
  correctly; the transition degrades to an instant swap with no error.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: In light mode, all text MUST be legible against its
  background across every view (landing, reading, history, detail),
  including headlines, body copy, micro-labels, and card content.
- **FR-002**: In light mode, every card and surface component MUST be
  visually distinct from the page background (defined edge, surface
  elevation, or equivalent treatment).
- **FR-003**: Activating the theme toggle MUST play a sweep in which a
  Medieval Woodcut style sun and moon orbit each other along an arc across
  the screen over a geocentric-model background; the new theme MUST be
  fully applied as the sweep completes.
- **FR-004**: The transition MUST work in both directions (dark→light and
  light→dark) with the sun and moon roles mirrored appropriately.
- **FR-005**: After the transition ends, NO overlay or animation residue
  MUST remain; all content MUST be interactive in the new theme.
- **FR-006**: With reduced-motion preferences, NO sweep MUST play; the
  theme MUST swap instantly.
- **FR-007**: While toggles keep arriving, the orbit MUST sustain its spin
  instead of restarting; shortly after the last toggle it MUST settle into
  exactly one applied theme matching the persisted choice, with no stuck
  overlay.
- **FR-008**: The persisted theme choice MUST survive reload; initial page
  load MUST apply the saved theme with no transition.
- **FR-009**: During the transition, the backdrop MUST blend rapidly between
  night and day treatments following the orbit (motion-blurred crossfade).
- **FR-010**: While the orbit spins, shooting stars MUST trail along the
  orbit path.

### Key Entities

- **Light Palette**: Corrected light-mode color roles for text, surfaces,
  borders, and glows; every role pairs legibly with the light background.
- **Theme Transition**: Full-screen sweep overlay shown only during a
  toggle; attributes: direction (dark→light / light→dark), duration,
  sun/moon positions along the sweep, end-state cleanup.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: In light mode, 100% of sampled text and card elements across
  all views are legible and distinct from the background in review.
- **SC-002**: Every toggle sequence lands in the correct theme with zero
  leftover overlay in 100% of trials (both directions), including
  sustained spam-toggle sequences.
- **SC-003**: A single transition completes within 1.5 seconds; a
  spam sequence settles within 1 second after the last toggle, and the
  toggle stays responsive throughout.
- **SC-004**: With reduced motion enabled, toggling swaps the theme
  instantly with no animation and all content remains usable.

## Assumptions

- The existing persisted theme store and toggle placement are unchanged;
  only the light palette values and the transition overlay are new.
- "Rotation across the screen" is locked by clarification (2026-10-03):
  the sun and moon orbit each other along an arc with a midpoint swap,
  rendered in Medieval Woodcut style over a geocentric-model background;
  duration stays within the 1.5s budget. Per clarification (2026-10-03):
  sustained toggling sustains the spin (no restarts), the night/day
  backdrop crossfades rapidly with the orbit, and shooting stars trail it
  until the visitor stops and it settles.
- Card artwork imagery is unchanged; only surrounding text, badges, edges,
  and surface treatments adapt to light mode.
- Dark mode appearance is unchanged except where shared tokens require
  adjustment to support the transition.
- Per constitution: change stays localized to theme tokens plus the
  transition overlay; no unrelated refactors; no new dependencies or mock
  frameworks; existing suites must pass.
