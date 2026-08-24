from __future__ import annotations

import json
import random
import secrets
import uuid as uuid_module
from collections.abc import AsyncIterator
from contextlib import suppress
from typing import Any

from fastapi import APIRouter, HTTPException, Query, Request, status
from fastapi.responses import StreamingResponse

from app.auth.security import OptionalUser
from app.core.config import Settings
from app.domain.deck import DrawService, get_deck
from app.domain.spreads import get_spread
from app.llm.intent import classify_intent
from app.llm.prompts import PROMPT_VERSION, build_interpretation_request
from app.llm.provider import resolve_model_name
from app.models.schemas import ReadingRequest
from app.store.base import NewReading, StoredReading

router = APIRouter(prefix="/api/readings", tags=["readings"])


def _sse(event: str, data: dict[str, Any]) -> str:
    return f"event: {event}\ndata: {json.dumps(data)}\n\n"


@router.post("", response_model=StoredReading, status_code=status.HTTP_201_CREATED)
async def create_reading(
    payload: ReadingRequest,
    request: Request,
    user: OptionalUser,
) -> StoredReading:
    settings: Settings = request.app.state.settings
    store = request.app.state.store

    try:
        spread = get_spread(payload.spread_id)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from None

    seed = secrets.randbits(48)
    draw_service = DrawService(rng=random.Random(seed), reversal_rate=settings.reversal_rate)
    drawn_cards = draw_service.draw(spread, get_deck())

    provider = request.app.state.provider
    intent = await classify_intent(
        provider,
        payload.question,
        confidence_threshold=settings.intent_confidence_threshold,
    )

    new_reading = NewReading(
        user_id=user.id if user else None,
        spread_id=spread.id,
        spread_name=spread.name,
        question=payload.question,
        intent_category=intent.category,
        drawn_cards=drawn_cards,
        seed=seed,
        reversal_rate=settings.reversal_rate,
        provider=settings.llm_provider,
        model_name=resolve_model_name(settings),
        prompt_version=PROMPT_VERSION,
    )
    return await store.create(new_reading)


@router.get("", response_model=list[StoredReading])
async def list_readings(
    request: Request,
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
) -> list[StoredReading]:
    store = request.app.state.store
    readings = await store.list_readings(limit=limit, offset=offset)
    return list(readings)


@router.get("/{reading_id}", response_model=StoredReading)
async def get_reading(reading_id: uuid_module.UUID, request: Request) -> StoredReading:
    store = request.app.state.store
    reading = await store.get(reading_id)
    if reading is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="reading not found")
    return reading


@router.get("/{reading_id}/stream")
async def stream_reading(reading_id: uuid_module.UUID, request: Request) -> StreamingResponse:
    store = request.app.state.store
    reading = await store.get(reading_id)
    if reading is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="reading not found")

    spread = get_spread(reading.spread_id)
    prompt = build_interpretation_request(
        question=reading.question,
        category=reading.intent_category,
        spread=spread,
        drawn_cards=reading.drawn_cards,
    )
    provider = request.app.state.provider

    async def event_stream() -> AsyncIterator[str]:
        yield _sse("start", {"reading_id": str(reading.id)})
        parts: list[str] = []
        try:
            async for chunk in provider.stream(prompt):
                parts.append(chunk)
                yield _sse("token", {"text": chunk})
        except Exception:
            yield _sse("error", {"detail": "interpretation generation failed"})
            return
        with suppress(Exception):
            await store.update_interpretation(reading.id, "".join(parts))
        yield _sse("done", {})

    return StreamingResponse(
        event_stream(),
        status_code=status.HTTP_200_OK,
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
        media_type="text/event-stream",
    )
