"""Application settings, loaded from environment variables / .env file."""

import os
from dataclasses import dataclass, field

from dotenv import load_dotenv

load_dotenv()


def _parse_origins(raw: str) -> list[str]:
    return [origin.strip() for origin in raw.split(",") if origin.strip()]


@dataclass(frozen=True)
class Settings:
    youtube_api_key: str = os.getenv("YOUTUBE_API_KEY", "").strip()
    max_videos: int = min(int(os.getenv("MAX_VIDEOS", "50")), 200)
    timezone: str = os.getenv("TIMEZONE", "Asia/Jerusalem")
    cors_origins: list[str] = field(
        default_factory=lambda: _parse_origins(
            os.getenv("CORS_ORIGINS", "http://localhost:5173")
        )
    )

    @property
    def has_api_key(self) -> bool:
        return bool(self.youtube_api_key)


settings = Settings()
