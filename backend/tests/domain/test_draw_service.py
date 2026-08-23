import random

import pytest
from app.domain.deck import DrawService
from app.domain.spreads import CELTIC_CROSS, THREE_CARD
from app.models.schemas import Card


@pytest.fixture
def service() -> DrawService:
    return DrawService(rng=random.Random(42))


def test_same_seed_produces_identical_draws(deck: tuple[Card, ...], service: DrawService) -> None:
    other = DrawService(rng=random.Random(42))

    first = service.draw(THREE_CARD, deck)
    second = other.draw(THREE_CARD, deck)

    assert [drawn.model_dump() for drawn in first] == [drawn.model_dump() for drawn in second]


def test_draw_matches_spread_positions(deck: tuple[Card, ...], service: DrawService) -> None:
    drawn = service.draw(CELTIC_CROSS, deck)

    assert len(drawn) == 10
    assert [d.position for d in drawn] == [position.name for position in CELTIC_CROSS.positions]
    assert len({d.card.id for d in drawn}) == 10


def test_different_seeds_diverge(deck: tuple[Card, ...]) -> None:
    draws: list[list[str]] = []
    for seed in range(5):
        service = DrawService(rng=random.Random(seed))
        draws.append([d.card.id for d in service.draw(THREE_CARD, deck)])

    assert any(draw != draws[0] for draw in draws[1:])


def test_reversal_rate_approximates_target(deck: tuple[Card, ...]) -> None:
    service = DrawService(rng=random.Random(7), reversal_rate=0.35)
    flips = [d.is_reversed for _ in range(300) for d in service.draw(THREE_CARD, deck)]

    observed = sum(flips) / len(flips)
    assert abs(observed - 0.35) < 0.05


def test_zero_and_full_reversal_rates(deck: tuple[Card, ...]) -> None:
    never = DrawService(rng=random.Random(1), reversal_rate=0.0)
    always = DrawService(rng=random.Random(1), reversal_rate=1.0)

    assert all(d.is_reversed is False for d in never.draw(THREE_CARD, deck))
    assert all(d.is_reversed is True for d in always.draw(THREE_CARD, deck))


def test_invalid_reversal_rate_rejected(deck: tuple[Card, ...]) -> None:
    with pytest.raises(ValueError, match="reversal_rate"):
        DrawService(rng=random.Random(1), reversal_rate=1.5)


def test_oversized_spread_rejected(deck: tuple[Card, ...]) -> None:
    tiny_deck = deck[:2]
    service = DrawService(rng=random.Random(1))

    with pytest.raises(ValueError, match="deck has"):
        service.draw(THREE_CARD, tiny_deck)
