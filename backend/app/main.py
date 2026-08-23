from fastapi import FastAPI

from app.api.routes import router as health_router
from app.api.routes_readings import router as readings_router
from app.core.config import Settings, get_settings
from app.llm.provider import build_provider
from app.store.memory import InMemoryReadingStore


def create_app(settings: Settings | None = None) -> FastAPI:
    resolved = settings or get_settings()
    application = FastAPI(title=resolved.app_name)
    application.state.settings = resolved
    application.state.provider = build_provider(resolved)
    application.state.store = InMemoryReadingStore()
    application.include_router(health_router)
    application.include_router(readings_router)
    return application


app = create_app()
