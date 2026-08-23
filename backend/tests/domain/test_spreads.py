import pytest
from app.domain.spreads import get_spread, get_spreads


def test_all_spreads_exposed() -> None:
    spreads = get_spreads()
    expected = {"single-card", "three-card", "five-card", "celtic-cross"}

    assert {spread.id for spread in spreads} == expected


@pytest.mark.parametrize(
    ("spread_id", "count"),
    [("single-card", 1), ("three-card", 3), ("five-card", 5), ("celtic-cross", 10)],
)
def test_position_counts(spread_id: str, count: int) -> None:
    spread = get_spread(spread_id)

    assert spread.position_count == count
    assert [position.index for position in spread.positions] == list(range(count))


@pytest.mark.parametrize("spread_id", ["single-card", "three-card", "five-card", "celtic-cross"])
def test_position_names_unique(spread_id: str) -> None:
    spread = get_spread(spread_id)
    names = [position.name for position in spread.positions]

    assert len(set(names)) == len(names)


def test_five_card_positions() -> None:
    spread = get_spread("five-card")

    assert [position.name for position in spread.positions] == [
        "Situation",
        "Challenge",
        "Root Cause",
        "Advice",
        "Outcome",
    ]


def test_unknown_spread_raises() -> None:
    with pytest.raises(ValueError, match="unknown spread"):
        get_spread("horseshoe")
