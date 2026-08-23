from __future__ import annotations

import json
import random
from collections.abc import Sequence
from functools import lru_cache
from pathlib import Path

from app.models.schemas import Arcana, Card, DrawnCard, Spread, Suit

DEFAULT_DECK_PATH = Path(__file__).resolve().parents[2] / "data" / "tarot_deck.json"

DEFAULT_REVERSAL_RATE = 0.35

EXPECTED_CARD_COUNT = 78
MAJOR_COUNT = 22
MINOR_COUNT = 56
CARDS_PER_SUIT = 14


class DeckValidationError(ValueError):
    pass


def load_deck(path: Path | None = None) -> tuple[Card, ...]:
    deck_path = path or DEFAULT_DECK_PATH
    payload = json.loads(deck_path.read_text(encoding="utf-8"))
    cards = tuple(Card.model_validate(entry) for entry in payload["cards"])
    validate_cards(cards)
    return cards


@lru_cache(maxsize=1)
def get_deck() -> tuple[Card, ...]:
    return load_deck()


def validate_cards(cards: tuple[Card, ...]) -> None:
    if len(cards) != EXPECTED_CARD_COUNT:
        raise DeckValidationError(f"expected {EXPECTED_CARD_COUNT} cards, found {len(cards)}")
    ids = {card.id for card in cards}
    names = {card.name for card in cards}
    if len(ids) != EXPECTED_CARD_COUNT:
        raise DeckValidationError("duplicate card ids")
    if len(names) != EXPECTED_CARD_COUNT:
        raise DeckValidationError("duplicate card names")
    majors = [card for card in cards if card.arcana is Arcana.MAJOR]
    minors = [card for card in cards if card.arcana is Arcana.MINOR]
    if len(majors) != MAJOR_COUNT:
        raise DeckValidationError(f"expected {MAJOR_COUNT} major arcana cards, found {len(majors)}")
    if len(minors) != MINOR_COUNT:
        raise DeckValidationError(f"expected {MINOR_COUNT} minor arcana cards, found {len(minors)}")
    major_ranks = sorted(card.rank for card in majors)
    if major_ranks != list(range(MAJOR_COUNT)):
        raise DeckValidationError("major arcana ranks must cover 0..21 exactly once")
    for suit in Suit:
        suit_ranks = sorted(card.rank for card in minors if card.suit is suit)
        if suit_ranks != list(range(1, CARDS_PER_SUIT + 1)):
            raise DeckValidationError(
                f"{suit.value} ranks must cover 1..{CARDS_PER_SUIT} exactly once"
            )


class DrawService:
    def __init__(self, rng: random.Random, reversal_rate: float = DEFAULT_REVERSAL_RATE) -> None:
        if not 0.0 <= reversal_rate <= 1.0:
            raise ValueError("reversal_rate must be between 0 and 1")
        self._rng = rng
        self._reversal_rate = reversal_rate

    def draw(self, spread: Spread, deck: Sequence[Card]) -> list[DrawnCard]:
        deck_pool = list(deck)
        count = spread.position_count
        if count > len(deck_pool):
            raise ValueError(f"spread {spread.id!r} needs {count} cards, deck has {len(deck_pool)}")
        drawn = self._rng.sample(deck_pool, k=count)
        return [
            DrawnCard(
                card=card,
                is_reversed=self._rng.random() < self._reversal_rate,
                position=position.name,
            )
            for card, position in zip(drawn, spread.positions, strict=True)
        ]
