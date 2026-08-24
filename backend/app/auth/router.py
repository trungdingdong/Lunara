from __future__ import annotations

import secrets
import uuid as uuid_module

from fastapi import APIRouter, HTTPException, Request, status

from app.auth.security import CurrentUser, create_access_token, hash_password, verify_password
from app.auth.store import (
    EmailAlreadyExistsError,
    SQLAuthStore,
    UnknownRefreshTokenError,
)
from app.core.config import Settings
from app.models.schemas import ExportBundle, RefreshRequest, TokenResponse, UserCreate, UserPublic

router = APIRouter(prefix="/api/auth", tags=["auth"])

_GENERIC_LOGIN_ERROR = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail="Incorrect email or password",
)
_INVALID_REFRESH_ERROR = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail="invalid refresh token",
)


def _store(request: Request) -> SQLAuthStore:
    return request.app.state.auth_store


def _settings(request: Request) -> Settings:
    return request.app.state.settings


async def _issue_pair(request: Request, user_id: uuid_module.UUID) -> TokenResponse:
    store = _store(request)
    access = create_access_token(user_id, _settings(request))
    refresh = secrets.token_urlsafe(32)
    await store.issue_refresh_token(user_id, refresh, _settings(request))
    return TokenResponse(access_token=access, refresh_token=refresh)


@router.post("/register", response_model=UserPublic, status_code=status.HTTP_201_CREATED)
async def register(payload: UserCreate, request: Request) -> UserPublic:
    email = payload.email.strip().lower()
    try:
        user = await _store(request).create_user(
            email=email,
            password_hash=hash_password(payload.password),
            display_name=payload.display_name,
        )
    except EmailAlreadyExistsError:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT, detail="email already registered"
        ) from None
    return user


@router.post("/login", response_model=TokenResponse)
async def login(payload: UserCreate, request: Request) -> TokenResponse:
    email = payload.email.strip().lower()
    auth_user = await _store(request).get_auth_user_by_email(email)
    if auth_user is None or not verify_password(payload.password, auth_user.password_hash):
        raise _GENERIC_LOGIN_ERROR
    return await _issue_pair(request, auth_user.id)


@router.post("/refresh", response_model=TokenResponse)
async def refresh_tokens(payload: RefreshRequest, request: Request) -> TokenResponse:
    store = _store(request)
    try:
        token_state = await store.inspect_refresh(payload.refresh_token)
    except UnknownRefreshTokenError:
        raise _INVALID_REFRESH_ERROR from None

    if token_state.revoked or token_state.expired:
        if token_state.revoked:
            await store.revoke_all_for_user(token_state.user_id)
        raise _INVALID_REFRESH_ERROR

    await store.revoke_refresh_token(payload.refresh_token)
    return await _issue_pair(request, token_state.user_id)


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
async def logout(payload: RefreshRequest, request: Request) -> None:
    await _store(request).revoke_refresh_token(payload.refresh_token)


@router.get("/me", response_model=UserPublic)
async def me(current_user: CurrentUser) -> UserPublic:
    return current_user


@router.delete("/me", status_code=status.HTTP_204_NO_CONTENT)
async def delete_me(current_user: CurrentUser, request: Request) -> None:
    await _store(request).delete_user_cascade(current_user.id)


@router.get("/me/export", response_model=ExportBundle)
async def export_me(current_user: CurrentUser, request: Request) -> ExportBundle:
    readings = await _store(request).list_readings_for_user(current_user.id)
    return ExportBundle(user=current_user, readings=list(readings))
