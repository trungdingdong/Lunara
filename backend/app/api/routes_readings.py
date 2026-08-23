from __future__ import annotations

import json
import random
import secrets
from collections.abc import AsyncIterator
from typing import Any

from fastapi import APIRouter, HTTPException, Request, status
from fastapi.responses import StreamingResponse

from app.core.config import Settings
from app.domain.deck import DrawService, get_deck
from app.domain.spreads import get_spread
from app.llm.intent import classify_intent
from app.llm.prompts import build_interpretation_request
from app.models.schemas import ReadingRequest
from app.store.memory import InMemoryReadingStore, StoredReading

router = APIRouter(prefix="/api/readings", tags=["readings"])


def _sse(event: str, data: dict[str, Any]) -> str:
    return f"event: {event}\ndata: {json.dumps(data)}\n\n"


@router.post("", response_model=StoredReading, status_code=status.HTTP_201_CREATED)
async def create_reading(payload: ReadingRequest, request: Request) -> StoredReading:
    settings: Settings = request.app.state.settings
    store: InMemoryReadingStore = request.app.state.store

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

    return store.create(
        spread=spread,
        question=payload.question,
        drawn_cards=drawn_cards,
        intent_category=intent.category,
        seed=seed,
    )


@router.get("/{reading_id}/stream")
async def stream_reading(reading_id: str, request: Request) -> StreamingResponse:
    store: InMemoryReadingStore = request.app.state.store
    reading = store.get(reading_id)
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
        yield _sse("start", {"reading_id": reading.id})
        try:
            async for chunk in provider.stream(prompt):
                yield _sse("token", {"text": chunk})
        except Exception:
            yield _sse("error", {"detail": "interpretation generation failed"})
            return
        yield _sse("done", {})

    return StreamingResponse(
        event_stream(),
        status_code=status.HTTP_200_OK,
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
        media_type="text/event-stream",
    )
