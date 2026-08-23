from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_prefix="TAROT_", extra="ignore")

    app_name: str = "Tarot Reader API"
    environment: str = "dev"
    reversal_rate: float = Field(default=0.35, ge=0.0, le=1.0)


@lru_cache
def get_settings() -> Settings:
    return Settings()
