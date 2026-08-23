import pytest
from app.domain.deck import load_deck
from app.models.schemas import Card


@pytest.fixture(scope="session")
def deck() -> tuple[Card, ...]:
    return load_deck()
