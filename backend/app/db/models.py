import uuid as uuid_module
from datetime import UTC, datetime
from typing import Any

from sqlalchemy import JSON, BigInteger, DateTime, Enum, Float, Index, String, Text, Uuid
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column

from app.models.schemas import IntentCategory


class Base(DeclarativeBase):
    pass


def _intent_values(enums: type[IntentCategory]) -> list[str]:
    return [member.value for member in enums]


class UserModel(Base):
    __tablename__ = "users"

    id: Mapped[uuid_module.UUID] = mapped_column(
        Uuid(), primary_key=True, default=uuid_module.uuid4
    )
    email: Mapped[str] = mapped_column(String(320), unique=True)
    password_hash: Mapped[str] = mapped_column(String(255))
    display_name: Mapped[str | None] = mapped_column(String(64), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(UTC)
    )


class RefreshTokenModel(Base):
    __tablename__ = "refresh_tokens"

    id: Mapped[uuid_module.UUID] = mapped_column(
        Uuid(), primary_key=True, default=uuid_module.uuid4
    )
    user_id: Mapped[uuid_module.UUID] = mapped_column(Uuid(), nullable=False, index=True)
    token_hash: Mapped[str] = mapped_column(String(64), unique=True)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    revoked_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(UTC)
    )


class ReadingModel(Base):
    __tablename__ = "readings"

    id: Mapped[uuid_module.UUID] = mapped_column(
        Uuid(), primary_key=True, default=uuid_module.uuid4
    )
    user_id: Mapped[uuid_module.UUID | None] = mapped_column(Uuid(), nullable=True, index=True)
    spread_id: Mapped[str] = mapped_column(String(32))
    spread_name: Mapped[str] = mapped_column(String(64))
    question: Mapped[str] = mapped_column(String(500))
    intent_category: Mapped[IntentCategory] = mapped_column(
        Enum(
            IntentCategory,
            native_enum=False,
            length=16,
            values_callable=_intent_values,
            create_constraint=True,
            name="intent_category",
        )
    )
    drawn_cards_json: Mapped[list[dict[str, Any]]] = mapped_column(JSON())
    interpretation_text: Mapped[str | None] = mapped_column(Text(), nullable=True)
    seed: Mapped[int] = mapped_column(BigInteger())
    reversal_rate: Mapped[float] = mapped_column(Float())
    provider: Mapped[str] = mapped_column(String(16))
    model_name: Mapped[str] = mapped_column("model", String(64))
    prompt_version: Mapped[str] = mapped_column(String(16))
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(UTC)
    )

    __table_args__ = (Index("ix_readings_created_at", "created_at"),)
