"""Realistic fake data so the dashboard works without an API key."""

import random
from datetime import datetime, timedelta, timezone

TITLES = [
    "Full Season Recap in 15 Minutes",
    "Everything You Missed Before the Finale",
    "The Ending Explained",
    "Top 10 Moments of the Season",
    "Character Breakdown: Who Changed the Most?",
    "Theories for Next Season",
    "Hidden Details You Didn't Notice",
    "Movie Recap: The Whole Story",
    "Episode 1 Recap and Reactions",
    "Why Everyone Is Talking About This Show",
    "Trailer Breakdown",
    "Best Scenes Ranked",
]


def _thumb(seed: int) -> str:
    return f"https://picsum.photos/seed/yt{seed}/480/270"


def build_demo_data(max_videos: int = 50, seed: int = 42) -> dict:
    """Generate one fake channel and a list of its recent videos."""
    rng = random.Random(seed)
    now = datetime.now(timezone.utc)
    videos: list[dict] = []
    published = now - timedelta(hours=rng.randint(6, 30))

    for index in range(max_videos):
        is_short = rng.random() < 0.3
        duration = rng.randint(20, 59) if is_short else rng.randint(360, 1500)
        base = rng.lognormvariate(10.2 if is_short else 9.6, 0.8)
        # Weekend uploads perform a bit better in the demo data.
        if published.weekday() in (4, 5):
            base *= 1.35
        views = int(base)
        likes = int(views * rng.uniform(0.02, 0.06))
        comments = int(views * rng.uniform(0.002, 0.01))
        title = rng.choice(TITLES)
        if is_short:
            title = f"#shorts {title}"

        videos.append(
            {
                "id": f"demo{index:04d}",
                "title": title,
                "thumbnail": _thumb(index),
                "published_at": published.isoformat().replace("+00:00", "Z"),
                "duration_seconds": duration,
                "views": views,
                "likes": likes,
                "comments": comments,
            }
        )
        published -= timedelta(days=rng.uniform(1.5, 5), hours=rng.randint(0, 12))

    channel = {
        "id": "UCdemo000000000000000000",
        "title": "ערוץ דמו - סיכומי סדרות",
        "description": "Demo channel. Add a YOUTUBE_API_KEY to load real data.",
        "thumbnail": "https://picsum.photos/seed/ytchannel/240/240",
        "custom_url": "@demo-recaps",
        "subscribers": 48_300,
        "total_views": sum(v["views"] for v in videos) * 4,
        "video_count": max_videos * 3,
        "published_at": (now - timedelta(days=900)).isoformat().replace("+00:00", "Z"),
    }
    return {"channel": channel, "videos": videos}
