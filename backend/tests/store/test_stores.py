import uuid as uuid_module

import pytest
from app.domain.spreads import THREE_CARD
from app.main import run_migrations
from app.models.schemas import Card, DrawnCard, IntentCategory
from app.store.base import NewReading, ReadingStore, StoredReading
from app.store.memory import InMemoryReadingStore
from fastapi import FastAPI


@pytest.fixture(params=["memory", "sql"])
def store(request: pytest.FixtureRequest, app: FastAPI) -> ReadingStore:
    if request.param == "memory":
        return InMemoryReadingStore()
    settings = app.state.settings
    run_migrations(settings.database_url)
    return app.state.store


def _new_reading(deck: tuple[Card, ...]) -> NewReading:
    drawn = [
        DrawnCard(card=card, is_reversed=False, position=position.name)
        for card, position in zip(deck[:3], THREE_CARD.positions, strict=True)
    ]
    return NewReading(
        spread_id=THREE_CARD.id,
        spread_name=THREE_CARD.name,
        question="What does my future hold?",
        intent_category=IntentCategory.GENERAL,
        drawn_cards=drawn,
        seed=123456789,
        reversal_rate=0.35,
    )


@pytest.mark.anyio
async def test_create_and_get_roundtrip(store: ReadingStore, deck: tuple[Card, ...]) -> None:
    created = await store.create(_new_reading(deck))

    fetched = await store.get(created.id)

    assert fetched is not None
    assert fetched.id == created.id
    assert fetched.question == created.question
    assert fetched.seed == 123456789
    assert [d.card.id for d in fetched.drawn_cards] == [d.card.id for d in created.drawn_cards]


@pytest.mark.anyio
async def test_get_unknown_returns_none(store: ReadingStore) -> None:
    result = await store.get(uuid_module.UUID(int=0))

    assert result is None


@pytest.mark.anyio
async def test_list_paginates(store: ReadingStore, deck: tuple[Card, ...]) -> None:
    for _ in range(3):
        await store.create(_new_reading(deck))

    page_one: list[StoredReading] = list(await store.list_readings(limit=2, offset=0))
    page_two: list[StoredReading] = list(await store.list_readings(limit=2, offset=2))

    assert len(page_one) == 2
    assert len(page_two) == 1
    all_ids = {r.id for r in page_one} | {r.id for r in page_two}
    assert len(all_ids) == 3


@pytest.mark.anyio
async def test_update_interpretation_persists(store: ReadingStore, deck: tuple[Card, ...]) -> None:
    created = await store.create(_new_reading(deck))

    await store.update_interpretation(created.id, "## Overview\n\nThe reading begins.")

    fetched = await store.get(created.id)
    assert fetched is not None
    assert fetched.interpretation_text is not None
    assert fetched.interpretation_text.startswith("## Overview")


@pytest.mark.anyio
async def test_clear_empties_store(store: ReadingStore, deck: tuple[Card, ...]) -> None:
    await store.create(_new_reading(deck))
    await store.clear()

    readings = list(await store.list_readings(limit=10, offset=0))

    assert readings == []
