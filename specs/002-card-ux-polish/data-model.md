# Data Model: Card UX Polish

**Feature**: `002-card-ux-polish` | **Date**: 2026-10-03

Presentational-only feature: no backend entities, no migrations, no API changes.

## Entity 1: Type Scale (documented roles)

Single source of truth for text styling; enforced by audit, not runtime code.

| Role | Family token | Applies to |
|---|---|---|
| Display | `font-display` (serif) | Headings, card names, pull quotes |
| Body | `font-body` (sans) | Prose, paragraphs, controls, prose-like UI |
| Utility | `font-utility` (mono) | Micro-labels, badges, timestamps, metadata |

Validation: every text element in `views/` + `components/` resolves to exactly
one role; weights/sizes may vary (not families); zero unlisted families.

## Entity 2: Landing Card Trio

Owner: `LandingView`. Three cards, two behaviors.

| Card | Resting face | Hover/focus end state | Motion |
|---|---|---|---|
| Center (moon) | Glyph front | Whole-unit flip → artwork + name reverse | 0.7s ease, transform-only |
| Flanker ×2 | Decorative back | Highlight + lift (glow border, −4px rise), no face change | Same easing family |

State transitions (center): `resting ↔ flipped` on hover/focus enter/leave;
reduced-motion default: locked `resting`. Flankers: `resting ↔ lifted`.
No layout shift in any transition; CTA untouched.

## Non-goals

Reading-flow `TarotCard.tsx` flip behavior unchanged (reference pattern only).
No new typefaces, no size/weight redesign, no store/route/schema changes.
