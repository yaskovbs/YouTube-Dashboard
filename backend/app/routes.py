"""HTTP routes for the analytics API."""

from fastapi import APIRouter, HTTPException, Query

from .analytics import build_analytics
from .cache import TTLCache
from .config import settings
from .mock_data import build_demo_data
from .models import AnalyticsResponse
from .youtube_client import YouTubeClient, YouTubeError

router = APIRouter(prefix="/api")
cache = TTLCache(ttl_seconds=600)


@router.get("/health")
def health() -> dict:
    return {"status": "ok", "has_api_key": settings.has_api_key}


@router.get("/analytics", response_model=AnalyticsResponse)
async def analytics(
    channel: str = Query("", description="Channel ID, @handle or channel URL"),
    demo: bool = Query(False, description="Force demo data"),
    limit: int | None = Query(None, ge=5, le=200, description="Videos to analyze"),
) -> dict:
    max_videos = limit or settings.max_videos
    use_demo = demo or not settings.has_api_key or not channel.strip()

    if use_demo:
        raw = build_demo_data(max_videos)
        return build_analytics(raw, settings.timezone, demo=True)

    cache_key = f"{channel.strip().lower()}:{max_videos}"
    cached = cache.get(cache_key)
    if cached is not None:
        return cached

    client = YouTubeClient(settings.youtube_api_key)
    try:
        raw = await client.fetch_channel_with_videos(channel, max_videos)
    except YouTubeError as exc:
        raise HTTPException(status_code=exc.status_code, detail=str(exc)) from exc

    result = build_analytics(raw, settings.timezone, demo=False)
    cache.set(cache_key, result)
    return result
