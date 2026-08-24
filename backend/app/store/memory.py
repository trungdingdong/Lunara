from __future__ import annotations

import uuid as uuid_module
from collections.abc import Sequence

from app.store.base import NewReading, StoredReading


class InMemoryReadingStore:
    def __init__(self) -> None:
        self._readings: dict[uuid_module.UUID, StoredReading] = {}

    async def create(self, reading: NewReading) -> StoredReading:
        stored = StoredReading(
            id=uuid_module.uuid4(),
            spread_id=reading.spread_id,
            spread_name=reading.spread_name,
            question=reading.question,
            intent_category=reading.intent_category,
            drawn_cards=reading.drawn_cards,
            seed=reading.seed,
            reversal_rate=reading.reversal_rate,
            provider=reading.provider,
            model_name=reading.model_name,
            prompt_version=reading.prompt_version,
        )
        self._readings[stored.id] = stored
        return stored

    async def get(self, reading_id: uuid_module.UUID) -> StoredReading | None:
        return self._readings.get(reading_id)

    async def list_readings(self, *, limit: int, offset: int) -> Sequence[StoredReading]:
        ordered = sorted(self._readings.values(), key=lambda r: r.seed)
        return list(ordered[offset : offset + limit])

    async def update_interpretation(self, reading_id: uuid_module.UUID, text: str) -> None:
        stored = self._readings.get(reading_id)
        if stored is not None:
            updated = stored.model_copy(update={"interpretation_text": text})
            self._readings[reading_id] = updated

    async def clear(self) -> None:
        self._readings.clear()
