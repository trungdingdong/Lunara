from __future__ import annotations

import random
import secrets

from fastapi import APIRouter, HTTPException, Request, status

from app.domain.deck import DrawService, get_deck
from app.domain.spreads import get_spread
from app.models.schemas import DrawRequest, DrawResponse

router = APIRouter(prefix="/api/draws", tags=["draws"])


@router.post("", response_model=DrawResponse, status_code=status.HTTP_201_CREATED)
async def draw_cards(payload: DrawRequest, request: Request) -> DrawResponse:
    settings = request.app.state.settings

    try:
        spread = get_spread(payload.spread_id)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from None

    seed = secrets.randbits(48)
    draw_service = DrawService(rng=random.Random(seed), reversal_rate=settings.reversal_rate)
    drawn_cards = draw_service.draw(spread, get_deck())

    return DrawResponse(spread_id=spread.id, seed=seed, drawn_cards=drawn_cards)
