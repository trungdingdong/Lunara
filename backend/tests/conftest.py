from collections.abc import Iterator
from pathlib import Path

import pytest
from app.core.config import Settings
from app.domain.deck import load_deck
from app.main import create_app
from app.models.schemas import Card
from fastapi import FastAPI
from fastapi.testclient import TestClient


@pytest.fixture(scope="session")
def deck() -> tuple[Card, ...]:
    return load_deck()


@pytest.fixture
def app(tmp_path: Path) -> FastAPI:
    database_url = f"sqlite+aiosqlite:///{tmp_path / 'test.db'}"
    return create_app(Settings(database_url=database_url))


@pytest.fixture
def client(app: FastAPI) -> Iterator[TestClient]:
    with TestClient(app) as test_client:
        yield test_client
