# Feature Specification: Card Draw Ceremony

**Feature Branch**: `005-card-draw-ceremony`

**Created**: 2026-10-03

**Status**: Draft

**Input**: User description: "i want to implement a better card pulling animation, whenever the user presses draw the cards there will be a waiting animation, a deck of cards are being shuffled and when it finishes the cards will spread out and prompt the user to draw them, based on the amount of cards the user wants to draw the card spread will draw out that amount of cards, then the cards will float up slightly hovering animation, when the user presses that card it will flip over and show the card's meaning, they can exit out of that specific card and scroll down to see the meaning of the spread, the tarot reading, based on the cards that they draw"

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Shuffle, fan, and hand-pick the cards (Priority: P1)

A visitor presses "Draw the cards" and watches a deck shuffle; the deck
then fans out face-down and invites them to pick exactly as many cards as
their chosen spread needs. Each tap reveals that position's card, and once
all picks are made the reading continues as today.

**Why this priority**: This is the core ask — replacing the automatic
deal with a tactile draw ceremony. Everything else decorates this flow.

**Independent Test**: Submit a question for any spread; observe the
shuffle, fan out the requested count, tap cards one by one until all are
revealed, and confirm the interpretation streams afterward.

**Acceptance Scenarios**:

1. **Given** the visitor pressed "Draw the cards", **When** the request
   is in flight, **Then** a deck-shuffle waiting animation plays (no
   frozen or blank screen).
2. **Given** the draw is ready, **When** the fan appears, **Then** it shows
   face-down cards with a clear prompt to pick, and the required pick
   count matches the chosen spread's card count.
3. **Given** the fan is shown, **When** the visitor taps a face-down card,
   **Then** that position's card flips face-up and the remaining-pick
   count decreases by one.
4. **Given** all required picks are revealed, **When** the last card lands
   face-up, **Then** the interpretation begins streaming without any
   further tap.

---

### User Story 2 - Floating cards with per-card meanings (Priority: P2)

A visitor hovers the fanned cards as they lift gently, taps a revealed
card to open its meaning, closes it, and scrolls down to read the full
spread interpretation below.

**Why this priority**: Hover float and per-card meanings make the fan
feel alive and let visitors study individual cards; the streamed reading
below stays the payoff.

**Independent Test**: Hover fanned cards (each lifts), open a revealed
card's meaning, close it, and scroll to the streamed interpretation.

**Acceptance Scenarios**:

1. **Given** face-down or revealed cards at rest, **When** the visitor
   hovers (or focuses) one, **Then** it lifts slightly with a calm float
   while neighbors stay put.
2. **Given** a revealed card, **When** the visitor activates it, **Then**
   its meaning opens in place (name, orientation, keywords) above the
   streamed reading.
3. **Given** an open card meaning, **When** the visitor dismisses it,
   **Then** it closes and focus returns to the card that opened it.

### Edge Cases

- What happens with reduced-motion preferences? Shuffle becomes a static
  deck with a text status, the fan appears without travel animation,
  flips are instant, and float is disabled.
- What happens if the draw request fails? The shuffle state exits to the
  existing error path with a retry affordance; no fan appears.
- What happens on touch devices with no hover? Tap is the single
  interaction for pick, flip, and meaning; float-on-hover has no
  touch equivalent and nothing essential depends on it.
- What happens if the visitor picks fewer cards and stalls? The prompt
  persists with the remaining count; streaming waits until all picks
  are revealed (existing session gating is preserved).
- What about keyboard-only visitors? Every fan card is focusable and
  operable (pick, open, dismiss) with visible focus indicators.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: Pressing "Draw the cards" MUST show a deck-shuffle waiting
  animation while the draw request is in flight.
- **FR-002**: When ready, the fan MUST present face-down cards with a pick
  prompt, requiring exactly the chosen spread's card count.
- **FR-003**: Tapping a face-down card MUST flip it to reveal that spread
  position's card and decrement the remaining-pick count.
- **FR-004**: Revealing the final required pick MUST start interpretation
  streaming with no extra tap.
- **FR-005**: Hovering or focusing a fanned card MUST lift it gently
  without moving neighbors or shifting page layout.
- **FR-006**: Activating a revealed card MUST open its meaning (name,
  orientation, keywords) in place above the streamed reading.
- **FR-007**: Dismissing an open meaning MUST close it and return focus
  to the originating card.
- **FR-008**: Reduced-motion preferences MUST disable shuffle travel,
  fan motion, float, and flip animation (instant state changes, deck
  status conveyed in text).

### Key Entities

- **Shuffle Deck**: Waiting-state deck shown during the draw request;
  attributes: shuffling motion, text status, error exit.
- **Ceremony Fan**: Face-down fan sized to the spread; attributes:
  required pick count, remaining count, per-card state
  (face-down / revealed / meaning-open).
- **Card Meaning**: Per-card detail (name, orientation, keywords);
  attributes: originating card, dismiss behavior, focus return.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: 100% of draw attempts show either the shuffle animation or
  the existing error path — never a frozen or blank screen.
- **SC-002**: Every spread size completes its pick flow (required taps
  equal the spread's card count) and streams the interpretation with no
  extra tap in 100% of trials.
- **SC-003**: Each flip and fan motion completes within 0.8 seconds with
  zero layout shift of surrounding content.
- **SC-004**: With reduced motion enabled, the full ceremony (shuffle
  status, fan, picks, meanings, streaming) remains completable with zero
  animation.

## Assumptions

- The drawn cards remain server-determined (seeded draw at submit); the
  visitor's taps choose reveal order only — each fan position maps to its
  spread position's card, so fairness and spread meanings are unchanged.
- Fan size follows the chosen spread (1, 3, 5, or 10 cards); the existing
  session stage gating (streaming waits for all reveals) is preserved.
- Card artwork, meanings content, and the streamed interpretation itself
  are unchanged; only the pre-stream ceremony and per-card meaning view
  are new.
- The existing automatic deal animation is replaced by this ceremony on
  the reading view; history and detail views are unchanged.
- Per constitution: change stays localized to the reading-view ceremony;
  no unrelated refactors; no new dependencies or mock frameworks;
  existing suites must pass.
