"""Pydantic models that define the API response shape."""

from pydantic import BaseModel


class Channel(BaseModel):
    id: str
    title: str
    description: str
    thumbnail: str
    custom_url: str | None = None
    subscribers: int
    total_views: int
    video_count: int
    published_at: str


class Video(BaseModel):
    id: str
    title: str
    thumbnail: str
    published_at: str
    duration_seconds: int
    is_short: bool
    views: int
    likes: int
    comments: int
    engagement_rate: float


class Summary(BaseModel):
    analyzed_videos: int
    avg_views: float
    median_views: float
    avg_engagement_rate: float
    total_recent_views: int
    shorts_count: int
    long_count: int
    avg_views_shorts: float
    avg_views_long: float
    uploads_per_week: float


class TimelinePoint(BaseModel):
    month: str
    videos: int
    views: int
    avg_views: float


class WeekdayStat(BaseModel):
    weekday: int  # 0 = Sunday ... 6 = Saturday
    videos: int
    avg_views: float


class AnalyticsResponse(BaseModel):
    demo: bool
    channel: Channel
    summary: Summary
    timeline: list[TimelinePoint]
    weekdays: list[WeekdayStat]
    top_videos: list[Video]
    videos: list[Video]
