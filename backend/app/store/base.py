from __future__ import annotations

import uuid as uuid_module
from collections.abc import Sequence
from typing import Protocol, runtime_checkable

from pydantic import BaseModel

from app.models.schemas import DrawnCard, IntentCategory


class StoredReading(BaseModel):
    id: uuid_module.UUID
    spread_id: str
    spread_name: str
    question: str
    intent_category: IntentCategory
    drawn_cards: list[DrawnCard]
    interpretation_text: str | None = None
    seed: int
    reversal_rate: float
    provider: str
    model_name: str
    prompt_version: str


class NewReading(BaseModel):
    spread_id: str
    spread_name: str
    question: str
    intent_category: IntentCategory
    drawn_cards: list[DrawnCard]
    seed: int
    reversal_rate: float
    provider: str = "mock"
    model_name: str = "mock"
    prompt_version: str = "v2-intent"


@runtime_checkable
class ReadingStore(Protocol):
    async def create(self, reading: NewReading) -> StoredReading: ...

    async def get(self, reading_id: uuid_module.UUID) -> StoredReading | None: ...

    async def list_readings(self, *, limit: int, offset: int) -> Sequence[StoredReading]: ...

    async def update_interpretation(self, reading_id: uuid_module.UUID, text: str) -> None: ...

    async def clear(self) -> None: ...
