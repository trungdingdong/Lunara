from enum import StrEnum

from pydantic import BaseModel, Field


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
