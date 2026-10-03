# Feature Specification: Ceremony Flourish

**Feature Branch**: `006-ceremony-flourish`

**Created**: 2026-10-03

**Status**: Draft

**Input**: User description: "the animation is too short should take about 8s, after that the deck should fan out and prompt the user to pull the cards this havent been implemented yet, and change the card backside design to use Esoteric Line Work style and whenever the user presses a specific card to read its meaning, it should move closer to the screen and a text box should pop up beside the card showing the meaning, the user can press a button to exit out of that card"

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Eight-second shuffle into a fanned deal (Priority: P1)

A visitor presses "Draw the cards" and watches a full shuffle performance
lasting about eight seconds; the deck then visibly fans out across the
reading area and prompts them to pull their cards, one tap per card until
the spread is complete.

**Why this priority**: This is the core complaint — the current shuffle
feels too brief and the deck-to-fan handoff doesn't read as a deal. The
ceremony's opening sets the tone for everything after.

**Independent Test**: Submit any spread; time the shuffle at roughly eight
seconds, watch the deck spread into a fan with a pull prompt, tap through
all picks, and confirm streaming starts with no extra tap.

**Acceptance Scenarios**:

1. **Given** the visitor pressed "Draw the cards", **When** the shuffle
   plays, **Then** it runs about eight seconds before the fan appears
   (never a frozen frame, always with a status).
2. **Given** the shuffle ends, **When** the fan forms, **Then** the cards
   visibly travel from the deck into a spread fan with a clear prompt to
   pull cards.
3. **Given** the fan is shown, **When** the visitor taps cards until the
   spread count is met, **Then** each pick flips and the final reveal
   starts streaming with no extra tap.

---

### User Story 2 - Esoteric backs and zoom-to-meaning (Priority: P2)

A visitor sees face-down cards carrying an Esoteric Line Work back design,
taps a revealed card, and watches it move closer to the screen while a
text box opens beside it showing the meaning; a button exits back to the
fan.

**Why this priority**: The back design and zoom-meaning are the visual
signature of the fan; the shuffle timing above matters more because it
gates the whole flow.

**Independent Test**: Inspect any face-down card (esoteric line-work
back), open a revealed card's meaning (card advances toward the viewer,
text box beside it), and exit via the button back to the fan.

**Acceptance Scenarios**:

1. **Given** any face-down card, **When** it is viewed, **Then** it shows
   the Esoteric Line Work back design (fine line ornament, no plain
   gradient).
2. **Given** a revealed card, **When** the visitor activates it, **Then**
   the card moves closer to the screen while a text box opens beside it
   showing the meaning.
3. **Given** an open meaning, **When** the visitor presses the exit
   button, **Then** the card returns to the fan and focus returns to it.

### Edge Cases

- What happens with reduced-motion preferences? Shuffle shows a static
  deck with a countdown status for the same duration, the fan appears
  placed, zoom is instant, and float is disabled.
- What happens if the draw request finishes before eight seconds? The
  shuffle still plays its full performance (it is a ceremony, not a
  loader); picks proceed from the already-arrived cards.
- What happens if the draw request fails? The shuffle exits early to the
  existing error path with a retry affordance.
- What happens on small screens? The side text box stacks below the
  zoomed card instead of beside it; nothing overlaps or clips.
- What about keyboard-only visitors? Fan, zoom, text box, and exit are
  all reachable and operable with visible focus indicators.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: The shuffle performance MUST run about eight seconds
  (7–9 second window) before the fan appears, with a live status
  throughout.
- **FR-002**: After the shuffle, the deck MUST visibly fan out into the
  spread fan with a pull prompt requiring exactly the spread's card count.
- **FR-003**: All face-down cards MUST carry the Esoteric Line Work back
  design (fine ornamental line work over the card surface).
- **FR-004**: Activating a revealed card MUST move it closer to the
  screen while a text box opens beside it showing the meaning (name,
  orientation, keywords).
- **FR-005**: The exit button MUST return the card to the fan, close the
  text box, and return focus to the originating card.
- **FR-006**: If the draw request fails, the shuffle MUST exit early to
  the existing error path (the 8s performance MUST NOT block errors).
- **FR-007**: Reduced-motion preferences MUST replace travel/zoom with
  instant state changes; the shuffle duration MUST still be conveyed
  (static deck + countdown status).
- **FR-008**: On narrow screens the meaning text box MUST stack below
  the zoomed card with no overlap or clipping.

### Key Entities

- **Shuffle Performance**: Eight-second opening ceremony; attributes:
  duration (7–9s), deck motion, live status, early error exit.
- **Esoteric Back**: Face-down card face; attributes: fine line-work
  ornament, shared across all face-down cards.
- **Zoom Meaning**: Focused card state; attributes: advanced-toward-viewer
  card, side (or stacked) text box, exit button, focus return.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: 100% of draws play the ~8s shuffle (or exit early only on
  error) before the fan appears.
- **SC-002**: 100% of trials show the deck-to-fan travel with a pull
  prompt, and every spread size completes its picks into streaming.
- **SC-003**: Every face-down card shows the esoteric back; every meaning
  opens as zoom-plus-side-text and exits cleanly via the button.
- **SC-004**: Motions complete without layout shift of surrounding
  content, and the full ceremony stays completable with reduced motion.

## Assumptions

- Eight seconds means a 7–9s window, not frame-exact; the shuffle is a
  timed performance decoupled from request flight (cards wait if already
  arrived; errors cut it short per FR-006).
- The esoteric back is CSS/SVG line ornament drawn from the existing
  token palette; no image assets, no new dependencies.
- The zoom advances the card toward the viewer (scale + shadow emphasis)
  within the fan layout; neighbors dim but keep their places.
- The side text box responds to narrow screens by stacking below (same
  content, same exit behavior).
- The 005 fairness model (taps order reveals only), session gating, and
  streaming behavior are unchanged.
- Per constitution: change stays localized to the ceremony; no unrelated
  refactors; no new dependencies or mock frameworks; existing suites
  must pass.
