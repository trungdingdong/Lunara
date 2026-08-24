from fastapi import APIRouter

from app.domain.spreads import get_spreads
from app.models.schemas import Spread

router = APIRouter(tags=["spreads"])


@router.get("/api/spreads", response_model=list[Spread])
async def list_spreads() -> list[Spread]:
    return list(get_spreads())
