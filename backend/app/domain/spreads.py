from __future__ import annotations

from app.models.schemas import Spread, SpreadPosition


def _spread(spread_id: str, name: str, position_names: tuple[str, ...]) -> Spread:
    positions = [SpreadPosition(index=i, name=n) for i, n in enumerate(position_names)]
    return Spread(id=spread_id, name=name, positions=positions)


SINGLE_CARD = _spread("single-card", "Single Card", ("Guidance",))
THREE_CARD = _spread("three-card", "Three Card", ("Past", "Present", "Future"))
FIVE_CARD = _spread(
    "five-card",
    "Five Card",
    ("Situation", "Challenge", "Root Cause", "Advice", "Outcome"),
)
CELTIC_CROSS = _spread(
    "celtic-cross",
    "Celtic Cross",
    (
        "Situation",
        "Challenge",
        "Foundation",
        "Recent Past",
        "Crown",
        "Near Future",
        "Self",
        "External Influences",
        "Hopes & Fears",
        "Outcome",
    ),
)

_ALL_SPREADS = (SINGLE_CARD, THREE_CARD, FIVE_CARD, CELTIC_CROSS)
_SPREADS_BY_ID = {spread.id: spread for spread in _ALL_SPREADS}


def get_spreads() -> tuple[Spread, ...]:
    return _ALL_SPREADS


def get_spread(spread_id: str) -> Spread:
    try:
        return _SPREADS_BY_ID[spread_id]
    except KeyError:
        raise ValueError(f"unknown spread id: {spread_id!r}") from None
