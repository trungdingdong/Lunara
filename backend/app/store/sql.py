from __future__ import annotations

import uuid as uuid_module
from collections.abc import Sequence

from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker

from app.db.models import ReadingModel
from app.models.schemas import DrawnCard
from app.store.base import NewReading, StoredReading


def row_to_stored(row: ReadingModel) -> StoredReading:
    return StoredReading(
        id=row.id,
        user_id=row.user_id,
        spread_id=row.spread_id,
        spread_name=row.spread_name,
        question=row.question,
        intent_category=row.intent_category,
        drawn_cards=[DrawnCard.model_validate(card) for card in row.drawn_cards_json],
        interpretation_text=row.interpretation_text,
        seed=row.seed,
        reversal_rate=row.reversal_rate,
        provider=row.provider,
        model_name=row.model_name,
        prompt_version=row.prompt_version,
    )


class SQLReadingStore:
    def __init__(self, session_factory: async_sessionmaker[AsyncSession]) -> None:
        self._session_factory = session_factory

    async def create(self, reading: NewReading) -> StoredReading:
        async with self._session_factory() as session:
            row = ReadingModel(
                user_id=reading.user_id,
                spread_id=reading.spread_id,
                spread_name=reading.spread_name,
                question=reading.question,
                intent_category=reading.intent_category,
                drawn_cards_json=[card.model_dump(mode="json") for card in reading.drawn_cards],
                seed=reading.seed,
                reversal_rate=reading.reversal_rate,
                provider=reading.provider,
                model_name=reading.model_name,
                prompt_version=reading.prompt_version,
            )
            session.add(row)
            await session.commit()
            await session.refresh(row)
            return row_to_stored(row)

    async def get(self, reading_id: uuid_module.UUID) -> StoredReading | None:
        async with self._session_factory() as session:
            row = await session.get(ReadingModel, reading_id)
            return row_to_stored(row) if row is not None else None

    async def list_readings(self, *, limit: int, offset: int) -> Sequence[StoredReading]:
        statement = (
            select(ReadingModel)
            .order_by(ReadingModel.created_at.desc())
            .limit(limit)
            .offset(offset)
        )
        async with self._session_factory() as session:
            rows = (await session.scalars(statement)).all()
            return [row_to_stored(row) for row in rows]

    async def update_interpretation(self, reading_id: uuid_module.UUID, text: str) -> None:
        async with self._session_factory() as session:
            row = await session.get(ReadingModel, reading_id)
            if row is not None:
                row.interpretation_text = text
                await session.commit()

    async def clear(self) -> None:
        async with self._session_factory() as session:
            await session.execute(delete(ReadingModel))
            await session.commit()
