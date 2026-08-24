from datetime import datetime
from enum import StrEnum
from uuid import UUID

from pydantic import BaseModel, EmailStr, Field


class HealthResponse(BaseModel):
    status: str


class Arcana(StrEnum):
    MAJOR = "major"
    MINOR = "minor"


class Suit(StrEnum):
    WANDS = "wands"
    CUPS = "cups"
    SWORDS = "swords"
    PENTACLES = "pentacles"


class IntentCategory(StrEnum):
    LOVE = "love"
    CAREER = "career"
    PROSPERITY = "prosperity"
    FUTURE = "future"
    GENERAL = "general"


class OrientationBlock(BaseModel):
    meanings: list[str] = Field(min_length=1)


class Card(BaseModel):
    id: str
    name: str
    arcana: Arcana
    suit: Suit | None = None
    rank: int = Field(ge=0, le=21)
    keywords: list[str] = Field(min_length=1)
    upright: OrientationBlock
    reversed: OrientationBlock
    fortune_telling: list[str] = Field(default_factory=list)
    archetype: str | None = None
    elemental: str | None = None
    questions_to_ask: list[str] = Field(default_factory=list)


class DrawnCard(BaseModel):
    card: Card
    is_reversed: bool
    position: str


class ReadingRequest(BaseModel):
    spread_id: str = Field(min_length=1)
    question: str = Field(min_length=3, max_length=500)


class DrawRequest(BaseModel):
    spread_id: str = Field(min_length=1)


class DrawResponse(BaseModel):
    spread_id: str
    seed: int
    drawn_cards: list[DrawnCard]


class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=72)
    display_name: str | None = Field(default=None, min_length=1, max_length=64)


class UserPublic(BaseModel):
    id: UUID
    email: str
    display_name: str | None = None
    created_at: datetime


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class RefreshRequest(BaseModel):
    refresh_token: str = Field(min_length=16)


class StoredReading(BaseModel):
    id: UUID
    user_id: UUID | None = None
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
    user_id: UUID | None = None
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


class ExportBundle(BaseModel):
    user: UserPublic
    readings: list[StoredReading]


class SpreadPosition(BaseModel):
    index: int
    name: str


class Spread(BaseModel):
    id: str
    name: str
    positions: list[SpreadPosition]

    @property
    def position_count(self) -> int:
        return len(self.positions)
