from __future__ import annotations

import hashlib
import uuid as uuid_module
from datetime import UTC, datetime, timedelta
from typing import NamedTuple

from sqlalchemy import delete, select, update
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker

from app.core.config import Settings
from app.db.models import ReadingModel, RefreshTokenModel, UserModel
from app.models.schemas import UserPublic
from app.store.sql import row_to_stored


class EmailAlreadyExistsError(Exception):
    pass


class UnknownRefreshTokenError(Exception):
    pass


def _hash_token(raw: str) -> str:
    return hashlib.sha256(raw.encode("utf-8")).hexdigest()


def _aware(value: datetime) -> datetime:
    return value if value.tzinfo is not None else value.replace(tzinfo=UTC)


def _user_public(row: UserModel) -> UserPublic:
    return UserPublic(
        id=row.id, email=row.email, display_name=row.display_name, created_at=row.created_at
    )


class AuthUserRecord(UserPublic):
    password_hash: str


class RefreshStatus(NamedTuple):
    user_id: uuid_module.UUID
    revoked: bool
    expired: bool


class SQLAuthStore:
    def __init__(self, session_factory: async_sessionmaker[AsyncSession]) -> None:
        self._session_factory = session_factory

    async def create_user(
        self, email: str, password_hash: str, display_name: str | None
    ) -> UserPublic:
        async with self._session_factory() as session:
            row = UserModel(email=email, password_hash=password_hash, display_name=display_name)
            session.add(row)
            try:
                await session.commit()
            except IntegrityError:
                raise EmailAlreadyExistsError(email) from None
            await session.refresh(row)
            return _user_public(row)

    async def get_user_by_id(self, user_id: uuid_module.UUID) -> UserPublic | None:
        async with self._session_factory() as session:
            row = await session.get(UserModel, user_id)
            return _user_public(row) if row is not None else None

    async def get_auth_user_by_email(self, email: str) -> AuthUserRecord | None:
        statement = select(UserModel).where(UserModel.email == email)
        async with self._session_factory() as session:
            row = (await session.scalars(statement)).first()
            if row is None:
                return None
            base = _user_public(row).model_dump()
            return AuthUserRecord(**base, password_hash=row.password_hash)

    async def issue_refresh_token(
        self, user_id: uuid_module.UUID, raw_token: str, settings: Settings
    ) -> None:
        expires_at = datetime.now(UTC) + timedelta(days=settings.refresh_token_days)
        async with self._session_factory() as session:
            session.add(
                RefreshTokenModel(
                    user_id=user_id, token_hash=_hash_token(raw_token), expires_at=expires_at
                )
            )
            await session.commit()

    async def inspect_refresh(self, raw_token: str) -> RefreshStatus:
        statement = select(RefreshTokenModel).where(
            RefreshTokenModel.token_hash == _hash_token(raw_token)
        )
        async with self._session_factory() as session:
            row = (await session.scalars(statement)).first()
        if row is None:
            raise UnknownRefreshTokenError
        return RefreshStatus(
            user_id=row.user_id,
            revoked=row.revoked_at is not None,
            expired=_aware(row.expires_at) <= datetime.now(UTC),
        )

    async def revoke_refresh_token(self, raw_token: str) -> None:
        statement = (
            update(RefreshTokenModel)
            .where(RefreshTokenModel.token_hash == _hash_token(raw_token))
            .values(revoked_at=datetime.now(UTC))
        )
        async with self._session_factory() as session:
            await session.execute(statement)
            await session.commit()

    async def revoke_all_for_user(self, user_id: uuid_module.UUID) -> None:
        statement = (
            update(RefreshTokenModel)
            .where(RefreshTokenModel.user_id == user_id)
            .values(revoked_at=datetime.now(UTC))
        )
        async with self._session_factory() as session:
            await session.execute(statement)
            await session.commit()

    async def list_readings_for_user(self, user_id: uuid_module.UUID):
        statement = (
            select(ReadingModel)
            .where(ReadingModel.user_id == user_id)
            .order_by(ReadingModel.created_at.desc())
        )
        async with self._session_factory() as session:
            rows = (await session.scalars(statement)).all()
            return [row_to_stored(row) for row in rows]

    async def delete_user_cascade(self, user_id: uuid_module.UUID) -> None:
        async with self._session_factory() as session:
            await session.execute(delete(ReadingModel).where(ReadingModel.user_id == user_id))
            await session.execute(
                delete(RefreshTokenModel).where(RefreshTokenModel.user_id == user_id)
            )
            await session.execute(delete(UserModel).where(UserModel.id == user_id))
            await session.commit()
