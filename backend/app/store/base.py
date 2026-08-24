from __future__ import annotations

import uuid as uuid_module
from collections.abc import Sequence
from typing import Protocol, runtime_checkable

from app.models.schemas import NewReading, StoredReading

__all__: list[str] = ["NewReading", "ReadingStore", "StoredReading"]


@runtime_checkable
class ReadingStore(Protocol):
    async def create(self, reading: NewReading) -> StoredReading: ...

    async def get(self, reading_id: uuid_module.UUID) -> StoredReading | None: ...

    async def list_readings(self, *, limit: int, offset: int) -> Sequence[StoredReading]: ...

    async def update_interpretation(self, reading_id: uuid_module.UUID, text: str) -> None: ...

    async def clear(self) -> None: ...
