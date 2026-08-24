from __future__ import annotations

from functools import lru_cache
from typing import Literal

from pydantic import Field, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_prefix="TAROT_", extra="ignore")

    app_name: str = "Tarot Reader API"
    environment: str = "dev"
    reversal_rate: float = Field(default=0.35, ge=0.0, le=1.0)

    llm_provider: Literal["anthropic", "ollama", "mock"] = "mock"
    intent_confidence_threshold: float = Field(default=0.6, ge=0.0, le=1.0)
    anthropic_api_key: str | None = None
    anthropic_model: str = "claude-sonnet-4-5"
    ollama_base_url: str = "http://localhost:11434"
    ollama_model: str = "llama3.2"

    database_url: str = "sqlite+aiosqlite:///./data/app.db"

    cors_origins: list[str] = Field(default_factory=lambda: ["http://localhost:5173"])

    jwt_secret: str = "dev-insecure-secret-change-me"
    access_token_minutes: int = Field(default=30, ge=1)
    refresh_token_days: int = Field(default=14, ge=1)

    @model_validator(mode="after")
    def _require_key_for_anthropic(self) -> Settings:
        if self.llm_provider == "anthropic" and not self.anthropic_api_key:
            raise ValueError(
                "TAROT_ANTHROPIC_API_KEY is required when TAROT_LLM_PROVIDER=anthropic"
            )
        return self


@lru_cache
def get_settings() -> Settings:
    return Settings()
