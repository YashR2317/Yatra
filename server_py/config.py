"""
BrajYatra.AI — Centralized Configuration
==========================================
Pydantic Settings class loading from the root .env file.
Validates required keys at startup.
"""

import os
from pathlib import Path
from functools import lru_cache
from pydantic_settings import BaseSettings
from pydantic import Field

# Resolve the root .env path
ROOT_DIR = Path(__file__).resolve().parent.parent
ENV_PATH = ROOT_DIR / ".env"


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # ── AI Agent ─────────────────────────────────────────────
    GEMINI_API_KEY: str = ""
    LLM_MODE: str = "gemini"
    GOOGLE_MAPS_API_KEY: str = ""
    OPENWEATHER_API_KEY: str = ""

    # ── Auth Backend ─────────────────────────────────────────
    MONGO_URI: str = ""
    JWT_SECRET: str = "brajyatra-dev-secret-do-not-use-in-production"
    JWT_ISSUER: str = "brajyatra.ai"
    RESEND_API_KEY: str = ""

    # ── Ports ────────────────────────────────────────────────
    AGENT_PORT: int = 3000
    CLIENT_PORT: int = 5173

    # ── Environment ──────────────────────────────────────────
    NODE_ENV: str = "development"

    # ── Security ─────────────────────────────────────────────
    ALLOWED_ORIGINS: str = "http://localhost:5173,http://localhost:3000"

    # ── Google OAuth ─────────────────────────────────────────
    GOOGLE_CLIENT_ID: str = ""

    # ── Kaggle ───────────────────────────────────────────────
    KAGGLE_ENDPOINT_URL: str = ""

    # ── Rate Limiting ────────────────────────────────────────
    RATE_LIMIT_WINDOW_MS: int = 900000  # 15 min
    RATE_LIMIT_MAX_REQUESTS: int = 100

    @property
    def is_production(self) -> bool:
        return self.NODE_ENV == "production"

    @property
    def allowed_origins_list(self) -> list[str]:
        return [o.strip() for o in self.ALLOWED_ORIGINS.split(",") if o.strip()]

    model_config = {
        "env_file": str(ENV_PATH),
        "env_file_encoding": "utf-8",
        "extra": "ignore",
    }


@lru_cache
def get_settings() -> Settings:
    """Singleton settings instance."""
    return Settings()
