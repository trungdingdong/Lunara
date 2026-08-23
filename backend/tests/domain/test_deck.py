import json
from pathlib import Path

import pytest
from app.domain.deck import DeckValidationError, load_deck
from app.models.schemas import Arcana, Card, Suit


def test_deck_loads_78_unique_cards(deck: tuple[Card, ...]) -> None:
    assert len(deck) == 78
    assert len({card.id for card in deck}) == 78
    assert len({card.name for card in deck}) == 78


def test_deck_arcana_split(deck: tuple[Card, ...]) -> None:
    majors = [card for card in deck if card.arcana is Arcana.MAJOR]
    minors = [card for card in deck if card.arcana is Arcana.MINOR]

    assert len(majors) == 22
    assert len(minors) == 56
    assert sorted(card.rank for card in majors) == list(range(22))
    assert all(card.suit is None for card in majors)


def test_deck_minor_structure(deck: tuple[Card, ...]) -> None:
    minors = [card for card in deck if card.arcana is Arcana.MINOR]

    for suit in Suit:
        suited = [card for card in minors if card.suit is suit]
        assert len(suited) == 14
        assert sorted(card.rank for card in suited) == list(range(1, 15))


def test_deck_orientations_populated(deck: tuple[Card, ...]) -> None:
    for card in deck:
        assert card.keywords
        assert card.upright.meanings
        assert card.reversed.meanings


def test_deck_enrichment_fields_present(deck: tuple[Card, ...]) -> None:
    fool = next(card for card in deck if card.id == "the-fool")

    assert fool.fortune_telling
    assert fool.questions_to_ask
    assert fool.archetype == "The Divine Madman"


def test_duplicate_id_rejected(deck: tuple[Card, ...], tmp_path: Path) -> None:
    mutated = [card.model_copy() for card in deck]
    mutated[1] = mutated[1].model_copy(update={"id": mutated[0].id})
    dumped = [card.model_dump(mode="json") for card in mutated]
    payload = {"version": "test", "source": {}, "cards": dumped}
    bad_file = tmp_path / "bad_deck.json"
    bad_file.write_text(json.dumps(payload), encoding="utf-8")

    with pytest.raises(DeckValidationError, match="duplicate card ids"):
        load_deck(bad_file)


def test_wrong_card_count_rejected(deck: tuple[Card, ...], tmp_path: Path) -> None:
    payload = {"version": "test", "source": {}, "cards": [deck[0].model_dump(mode="json")]}
    bad_file = tmp_path / "short_deck.json"
    bad_file.write_text(json.dumps(payload), encoding="utf-8")

    with pytest.raises(DeckValidationError, match="expected 78"):
        load_deck(bad_file)
