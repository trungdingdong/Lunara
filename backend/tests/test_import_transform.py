import json
from pathlib import Path
from typing import Any

import pytest
from scripts.import_deck import transform_card

RawCard = dict[str, Any]

FIXTURE_PATH = Path(__file__).resolve().parents[1] / "tests" / "fixtures" / "raw_deck_sample.json"


@pytest.fixture
def raw_cards() -> list[RawCard]:
    return json.loads(FIXTURE_PATH.read_text(encoding="utf-8-sig"))


def test_transform_maps_major_arcana(raw_cards: list[RawCard]) -> None:
    card = transform_card(raw_cards[0])
    expected_upright = ["Freeing yourself from limitation", "Taking a leap of faith"]

    assert card["id"] == "the-fool"
    assert card["arcana"] == "major"
    assert card["suit"] is None
    assert card["rank"] == 0
    assert card["img"] == "m00.jpg"
    assert card["keywords"] == ["freedom", "faith", "inexperience", "innocence"]
    assert card["upright"]["meanings"] == expected_upright
    assert card["reversed"]["meanings"] == ["Being gullible and naive", "Taking unnecessary risks"]
    assert card["archetype"] == "The Divine Madman"
    assert card["elemental"] == "Air"


def test_transform_maps_minor_and_court_ranks(raw_cards: list[RawCard]) -> None:
    ace = transform_card(raw_cards[1])
    knight = transform_card(raw_cards[2])

    assert ace["id"] == "ace-of-wands"
    assert ace["suit"] == "wands"
    assert ace["rank"] == 1
    assert knight["id"] == "knight-of-cups"
    assert knight["suit"] == "cups"
    assert knight["rank"] == 12
    assert knight["archetype"] == "The Romantic"


def test_transform_missing_name_raises(raw_cards: list[RawCard]) -> None:
    broken = dict(raw_cards[0])
    del broken["name"]

    with pytest.raises(ValueError, match="missing name"):
        transform_card(broken)


def test_transform_empty_keywords_raises(raw_cards: list[RawCard]) -> None:
    broken = dict(raw_cards[0])
    broken["keywords"] = []

    with pytest.raises(ValueError, match="no keywords"):
        transform_card(broken)


def test_transform_unknown_suit_raises(raw_cards: list[RawCard]) -> None:
    broken = dict(raw_cards[1])
    broken["suit"] = "Crystals"

    with pytest.raises(ValueError, match="unknown suit"):
        transform_card(broken)
