# Feature Specification: Card UX Polish

**Feature Branch**: `002-card-ux-polish`

**Created**: 2026-10-03

**Status**: Draft

**Input**: User description: "i want to improve the ui and ux the current ui uses a lot of random fonts, should use a list of accepted fonts to be more controlled, currently card-face absolute inset-0 flex items-center justify-center rounded-lg border border-primary/45 bg-gradient-to-br from-surface-low to-background shadow-[inset_0_0_30px_rgba(60,170,180,0.18)] group-hover:[transform:rotateY(180deg)] this element disappears whenever the cursor hovers over it which is not the correct behavior, it should fade out slightly while still remain visible or it should be highlighted, i suggest adding a flip animation to that element, which is a tarot card, it should spin around or something like that, the other cards on the screen can also do that"

## Clarifications

### Session 2026-10-03

- Q: What should the two flanking landing cards do on hover or focus, given they have no reverse artwork to reveal? → A: Matching highlight and lift only (glow border, slight rise, no face change).
- Q: Under reduced-motion preferences, should hovering or focusing swap faces instantly? → A: No face change at all (resting faces, zero motion).

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Cards stay visible and flip on hover (Priority: P1)

A visitor hovers the center tarot card on the landing page; instead of the
moon-glyph face vanishing, the whole card performs a flip that reveals its
reverse side, and the two flanking back-design cards get a matching
flip/highlight response so the trio behaves as one set.

**Why this priority**: This fixes an outright broken interaction — content
disappearing on hover reads as a bug and undermines trust in the reading
experience that follows.

**Independent Test**: Hover each of the three landing cards in turn; every
card remains visible through the whole interaction and each shows a clear
flip/highlight motion ending in a stable resting state.

**Acceptance Scenarios**:

1. **Given** a visitor hovering the center card, **When** the cursor rests on
   it, **Then** the card flips as a unit to reveal its reverse side (artwork
   plus card name) with no fully-transparent frame at any point.
2. **Given** a visitor hovering either flanking card, **When** the cursor
   rests on it, **Then** that card responds with a matching highlight and
   lift (glow border, slight rise, no face change).
3. **Given** the cursor leaves a card, **When** the hover ends, **Then** the
   card returns smoothly to its resting face without flicker or jump.

---

### User Story 2 - Controlled type system across the UI (Priority: P2)

A returning visitor moves between landing, reading, history, and detail
views and perceives one coherent typographic voice: display serif for
headings and card names, humanist sans for body copy, mono only for
micro-labels and metadata.

**Why this priority**: Consistency compounds perceived quality on every
screen, but nothing is functionally broken today, so it follows the hover
fix.

**Independent Test**: Review every view and confirm each text element uses
one of the accepted families in its documented role, with no ad-hoc
families anywhere.

**Acceptance Scenarios**:

1. **Given** any screen in the app, **When** its text elements are
   inspected, **Then** every element resolves to exactly one of the three
   accepted families (display serif, body sans, utility mono) in its
   documented role.
2. **Given** the documented type roles, **When** a heading, body paragraph,
   or micro-label is rendered, **Then** headings use display serif, body
   copy uses body sans, and timestamps/badges/labels use utility mono.

### Edge Cases

- What happens for keyboard-only visitors? Focusing a card (Tab) triggers
  the same flip/highlight as hover, with the existing visible focus ring
  preserved.
- What happens with reduced-motion preferences? Cards stay on their resting
  faces with no spin and no face change (per clarification 2026-10-03);
  all content remains readable with zero continuous animation.
- What happens on touch devices with no hover? Tapping a card shows the
  same end state as hover; nothing essential is hover-only (the primary
  call-to-action is unaffected).
- What about the existing reading-flow flip (`.flipped` pattern)? The
  landing behavior reuses the same flip language rather than inventing a
  second animation dialect.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: The type system MUST define exactly three accepted families —
  display serif for headings/card names, body sans for prose and controls,
  utility mono for micro-labels/metadata — documented in one place.
- **FR-002**: All existing text elements MUST resolve to an accepted family
  in its documented role; ad-hoc or unlisted families MUST be removed.
- **FR-003**: Hovering or focusing the landing center card MUST flip the
  card as a unit to its reverse side; at no point during the interaction
  MUST the card become fully transparent or disappear.
- **FR-004**: The two flanking landing cards MUST respond to hover/focus
  with a matching highlight and lift (glow border, slight rise); they MUST
  NOT change faces.
- **FR-005**: Hover/focus end states MUST be reachable by keyboard focus
  and MUST preserve the existing visible focus indicator.
- **FR-006**: With reduced-motion preferences, cards MUST stay on their
  resting faces with no spin, no animation, and no face change.
- **FR-007**: The flip motion MUST complete promptly (calm, sub-second)
  and MUST NOT shift the layout of surrounding hero content.
- **FR-008**: The primary call-to-action ("Begin your reading") MUST keep
  its current position, order, and navigation behavior unchanged.

### Key Entities

- **Type Scale**: The three accepted families plus their roles (display /
  body / utility) and where each role applies; single source of truth for
  text styling.
- **Landing Card Trio**: Center moon card (two faces: glyph front,
  artwork reverse) plus two flanking back-design cards; attributes: resting
  face, hover/focus end state, flip duration, motion-safety behavior.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: 100% of text elements across all views resolve to an accepted
  family in its documented role (zero ad-hoc families found in review).
- **SC-002**: Hovering or focusing any landing card never produces a fully
  transparent frame — the card stays visible for the entire interaction.
- **SC-003**: Each flip completes within 0.8 seconds and causes zero layout
  shift of surrounding hero content.
- **SC-004**: With reduced motion enabled, 100% of card content remains
  readable with zero continuous animation, and keyboard focus reaches and
  reveals every card end state.

## Assumptions

- The three accepted families are the ones already in the theme
  (display serif, body sans, utility mono); the work is standardizing
  roles and removing outliers, not introducing new typefaces.
- The vanishing-face bug is the front glyph face rotating to its hidden
  back side in isolation; the fix flips the whole card unit (front +
  reverse together), reusing the existing reading-flow flip language.
- Flanking cards are decorative backs with no reverse artwork; per
  clarification (2026-10-03) they get a highlight/lift only, and adding
  reverse faces for them is out of scope.
- Scope covers landing trio plus the type-role audit; the reading-flow
  `.flipped` behavior itself is unchanged.
- Per constitution: change stays localized to landing cards plus type-role
  corrections; no unrelated legacy refactors; no new dependencies or mock
  frameworks; existing suites must pass.
