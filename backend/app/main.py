from __future__ import annotations

import asyncio
from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager
from pathlib import Path

from alembic import command
from alembic.config import Config
from fastapi import FastAPI

from app.api.routes import router as health_router
from app.api.routes_draws import router as draws_router
from app.api.routes_readings import router as readings_router
from app.core.config import Settings, get_settings
from app.db.engine import build_engine, build_session_factory
from app.llm.provider import build_provider
from app.store.sql import SQLReadingStore

BACKEND_ROOT = Path(__file__).resolve().parents[1]


def run_migrations(database_url: str) -> None:
    config = Config(str(BACKEND_ROOT / "alembic.ini"))
    config.set_main_option("script_location", str(BACKEND_ROOT / "alembic"))
    config.set_main_option("sqlalchemy.url", database_url)
    command.upgrade(config, "head")


@asynccontextmanager
async def lifespan(application: FastAPI) -> AsyncGenerator[None]:
    settings: Settings = application.state.settings
    await asyncio.to_thread(run_migrations, settings.database_url)
    yield
    await application.state.engine.dispose()


def create_app(settings: Settings | None = None) -> FastAPI:
    resolved = settings or get_settings()
    engine = build_engine(resolved.database_url)
    session_factory = build_session_factory(engine)

    application = FastAPI(title=resolved.app_name, lifespan=lifespan)
    application.state.settings = resolved
    application.state.provider = build_provider(resolved)
    application.state.engine = engine
    application.state.session_factory = session_factory
    application.state.store = SQLReadingStore(session_factory)
    application.include_router(health_router)
    application.include_router(draws_router)
    application.include_router(readings_router)
    return application


app = create_app()
