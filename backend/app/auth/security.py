from __future__ import annotations

import uuid as uuid_module
from datetime import UTC, datetime, timedelta
from typing import Annotated, Any

import bcrypt
import jwt
from fastapi import Depends, HTTPException, Request, status
from fastapi.security import OAuth2PasswordBearer

from app.core.config import Settings
from app.models.schemas import UserPublic

OPTIONAL_OAUTH2 = OAuth2PasswordBearer(tokenUrl="/api/auth/login", auto_error=False)
REQUIRED_OAUTH2 = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

_CREDENTIALS_ERROR = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail="Could not validate credentials",
    headers={"WWW-Authenticate": "Bearer"},
)


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(password: str, password_hash: str) -> bool:
    try:
        return bcrypt.checkpw(password.encode("utf-8"), password_hash.encode("utf-8"))
    except ValueError:
        return False


def create_access_token(user_id: uuid_module.UUID, settings: Settings) -> str:
    now = datetime.now(UTC)
    payload: dict[str, Any] = {
        "sub": str(user_id),
        "iat": int(now.timestamp()),
        "exp": int((now + timedelta(minutes=settings.access_token_minutes)).timestamp()),
    }
    token: str = jwt.encode(  # pyright: ignore[reportUnknownMemberType]
        payload, settings.jwt_secret, algorithm="HS256"
    )
    return token


def decode_token_user_id(token: str, settings: Settings) -> uuid_module.UUID | None:
    try:
        payload = jwt.decode(  # pyright: ignore[reportUnknownMemberType]
            token, settings.jwt_secret, algorithms=["HS256"]
        )
        return uuid_module.UUID(str(payload["sub"]))
    except (jwt.InvalidTokenError, KeyError, ValueError):
        return None


async def _resolve_user(request: Request, token: str | None) -> UserPublic | None:
    if token is None:
        return None
    settings: Settings = request.app.state.settings
    user_id = decode_token_user_id(token, settings)
    if user_id is None:
        return None
    return await request.app.state.auth_store.get_user_by_id(user_id)


async def get_optional_user(
    request: Request, token: str | None = Depends(OPTIONAL_OAUTH2)
) -> UserPublic | None:
    return await _resolve_user(request, token)


async def get_current_user(request: Request, token: str = Depends(REQUIRED_OAUTH2)) -> UserPublic:
    user = await _resolve_user(request, token)
    if user is None:
        raise _CREDENTIALS_ERROR
    return user


CurrentUser = Annotated[UserPublic, Depends(get_current_user)]
OptionalUser = Annotated[UserPublic | None, Depends(get_optional_user)]
