from __future__ import annotations

import uuid
from datetime import UTC, datetime

from pydantic import BaseModel

from app.models.schemas import DrawnCard, IntentCategory, Spread


class StoredReading(BaseModel):
    id: str
    spread_id: str
    spread_name: str
    question: str
    intent_category: IntentCategory
    drawn_cards: list[DrawnCard]
    seed: int
    created_at: datetime


class InMemoryReadingStore:
    def __init__(self) -> None:
        self._readings: dict[str, StoredReading] = {}

    def create(
        self,
        spread: Spread,
        question: str,
        drawn_cards: list[DrawnCard],
        intent_category: IntentCategory,
        seed: int,
    ) -> StoredReading:
        reading = StoredReading(
            id=uuid.uuid4().hex,
            spread_id=spread.id,
            spread_name=spread.name,
            question=question,
            intent_category=intent_category,
            drawn_cards=drawn_cards,
            seed=seed,
            created_at=datetime.now(UTC),
        )
        self._readings[reading.id] = reading
        return reading

    def get(self, reading_id: str) -> StoredReading | None:
        return self._readings.get(reading_id)

    def clear(self) -> None:
        self._readings.clear()
