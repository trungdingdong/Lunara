import time
import uuid as uuid_module
from datetime import UTC, datetime, timedelta

import jwt as pyjwt
import pytest
from app.auth.security import (
    create_access_token,
    decode_token_user_id,
    hash_password,
    verify_password,
)
from app.core.config import Settings
from app.models.schemas import UserCreate
from pydantic import ValidationError


def test_hash_roundtrip() -> None:
    hashed = hash_password("correct horse battery staple")

    assert hashed != "correct horse battery staple"
    assert verify_password("correct horse battery staple", hashed)


def test_wrong_password_fails() -> None:
    hashed = hash_password("secret-password")

    assert not verify_password("wrong-password", hashed)
    assert not verify_password("secret-password", hash_password("other"))


def test_corrupt_hash_fails_gracefully() -> None:
    assert not verify_password("anything", "not-a-bcrypt-hash")


def test_access_token_carries_subject() -> None:
    settings = Settings(jwt_secret="test-secret-long-enough-for-hmac")
    token = create_access_token(uuid_module.UUID(int=42), settings)

    assert decode_token_user_id(token, settings) == uuid_module.UUID(int=42)


def test_expired_token_rejected() -> None:
    settings = Settings(jwt_secret="test-secret-long-enough-for-hmac")
    now = datetime.now(UTC)
    payload = {
        "sub": str(uuid_module.UUID(int=1)),
        "iat": int(now.timestamp()),
        "exp": int((now - timedelta(minutes=5)).timestamp()),
    }
    token = pyjwt.encode(payload, settings.jwt_secret, algorithm="HS256")
    time.sleep(0.01)

    assert decode_token_user_id(token, settings) is None


def test_tampered_secret_rejected() -> None:
    token = create_access_token(
        uuid_module.UUID(int=1), Settings(jwt_secret="secret-a-long-enough-key")
    )

    assert decode_token_user_id(token, Settings(jwt_secret="secret-b-long-enough-key")) is None


@pytest.mark.parametrize("password", ["short", "x" * 73])
def test_password_length_bounds(password: str) -> None:
    with pytest.raises(ValidationError):
        UserCreate(email="seeker@example.com", password=password)
