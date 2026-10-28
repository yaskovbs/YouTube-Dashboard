"""Turn raw channel/video data into dashboard-ready statistics with pandas."""

import pandas as pd

SHORT_MAX_SECONDS = 60
TOP_VIDEOS_COUNT = 5


def _to_frame(videos: list[dict], tz: str) -> pd.DataFrame:
    df = pd.DataFrame(videos)
    if df.empty:
        return df
    df["published"] = pd.to_datetime(df["published_at"], utc=True).dt.tz_convert(tz)
    df["is_short"] = df["duration_seconds"] <= SHORT_MAX_SECONDS
    interactions = df["likes"] + df["comments"]
    df["engagement_rate"] = (interactions / df["views"].where(df["views"] > 0)).fillna(0)
    df["engagement_rate"] = (df["engagement_rate"] * 100).round(2)
    return df.sort_values("published", ascending=False).reset_index(drop=True)


def _safe_mean(series: pd.Series) -> float:
    return round(float(series.mean()), 1) if not series.empty else 0.0


def _summary(df: pd.DataFrame) -> dict:
    shorts, longs = df[df["is_short"]], df[~df["is_short"]]
    span_days = (df["published"].max() - df["published"].min()).days or 1
    return {
        "analyzed_videos": len(df),
        "avg_views": _safe_mean(df["views"]),
        "median_views": float(df["views"].median()),
        "avg_engagement_rate": _safe_mean(df["engagement_rate"]),
        "total_recent_views": int(df["views"].sum()),
        "shorts_count": len(shorts),
        "long_count": len(longs),
        "avg_views_shorts": _safe_mean(shorts["views"]),
        "avg_views_long": _safe_mean(longs["views"]),
        "uploads_per_week": round(len(df) / (span_days / 7), 2),
    }


def _timeline(df: pd.DataFrame) -> list[dict]:
    monthly = (
        df.assign(month=df["published"].dt.strftime("%Y-%m"))
        .groupby("month")
        .agg(videos=("id", "count"), views=("views", "sum"), avg_views=("views", "mean"))
        .reset_index()
        .sort_values("month")
    )
    monthly["avg_views"] = monthly["avg_views"].round(1)
    monthly["views"] = monthly["views"].astype(int)
    return monthly.to_dict(orient="records")


def _weekdays(df: pd.DataFrame) -> list[dict]:
    # pandas: Monday=0. Convert to Sunday=0 for an Israeli week.
    weekday = (df["published"].dt.dayofweek + 1) % 7
    grouped = df.assign(weekday=weekday).groupby("weekday")["views"].agg(["count", "mean"])
    result = []
    for day in range(7):
        if day in grouped.index:
            row = grouped.loc[day]
            result.append(
                {"weekday": day, "videos": int(row["count"]), "avg_views": round(row["mean"], 1)}
            )
        else:
            result.append({"weekday": day, "videos": 0, "avg_views": 0.0})
    return result


def _video_records(df: pd.DataFrame) -> list[dict]:
    columns = [
        "id", "title", "thumbnail", "published_at", "duration_seconds",
        "is_short", "views", "likes", "comments", "engagement_rate",
    ]
    return df[columns].to_dict(orient="records")


def build_analytics(raw: dict, tz: str, demo: bool) -> dict:
    """Main entry point: raw {channel, videos} -> AnalyticsResponse dict."""
    df = _to_frame(raw["videos"], tz)
    if df.empty:
        summary_keys = [
            "analyzed_videos", "avg_views", "median_views", "avg_engagement_rate",
            "total_recent_views", "shorts_count", "long_count",
            "avg_views_shorts", "avg_views_long", "uploads_per_week",
        ]
        return {
            "demo": demo,
            "channel": raw["channel"],
            "summary": {key: 0 for key in summary_keys},
            "timeline": [],
            "weekdays": [],
            "top_videos": [],
            "videos": [],
        }

    top = df.nlargest(TOP_VIDEOS_COUNT, "views")
    return {
        "demo": demo,
        "channel": raw["channel"],
        "summary": _summary(df),
        "timeline": _timeline(df),
        "weekdays": _weekdays(df),
        "top_videos": _video_records(top),
        "videos": _video_records(df),
    }
