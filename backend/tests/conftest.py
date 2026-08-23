import pytest
from app.domain.deck import load_deck
from app.main import app
from app.models.schemas import Card
from fastapi.testclient import TestClient


@pytest.fixture
def client() -> TestClient:
    return TestClient(app)


@pytest.fixture(scope="session")
def deck() -> tuple[Card, ...]:
    return load_deck()
