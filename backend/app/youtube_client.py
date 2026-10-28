"""Thin async client for the YouTube Data API v3.

Returns plain dictionaries in a normalized shape so the analytics
layer never has to know about the raw API format.
"""

import re

import httpx

API_BASE = "https://www.googleapis.com/youtube/v3"
DURATION_RE = re.compile(
    r"P(?:(?P<days>\d+)D)?T?(?:(?P<h>\d+)H)?(?:(?P<m>\d+)M)?(?:(?P<s>\d+)S)?"
)


class YouTubeError(Exception):
    """Raised for any problem talking to the YouTube API."""

    def __init__(self, message: str, status_code: int = 400):
        super().__init__(message)
        self.status_code = status_code


def parse_channel_query(query: str) -> tuple[str, str]:
    """Turn user input into (param_name, value) for channels.list.

    Accepts: a channel ID (UC...), an @handle, or a full channel URL.
    """
    query = query.strip()
    url_match = re.search(r"youtube\.com/(channel/|@)([\w.\-]+)", query)
    if url_match:
        prefix, value = url_match.groups()
        return ("id", value) if prefix == "channel/" else ("forHandle", "@" + value)
    if re.fullmatch(r"UC[\w\-]{22}", query):
        return "id", query
    handle = query if query.startswith("@") else "@" + query
    return "forHandle", handle


def parse_duration(iso: str) -> int:
    """Convert an ISO 8601 duration (e.g. PT4M13S) to seconds."""
    match = DURATION_RE.fullmatch(iso or "")
    if not match:
        return 0
    parts = {k: int(v) if v else 0 for k, v in match.groupdict().items()}
    return parts["days"] * 86400 + parts["h"] * 3600 + parts["m"] * 60 + parts["s"]


def _best_thumbnail(thumbnails: dict) -> str:
    for size in ("high", "medium", "default"):
        if size in thumbnails:
            return thumbnails[size]["url"]
    return ""


class YouTubeClient:
    def __init__(self, api_key: str, timeout: float = 15.0):
        self._api_key = api_key
        self._timeout = timeout

    async def _get(self, client: httpx.AsyncClient, endpoint: str, params: dict) -> dict:
        params = {**params, "key": self._api_key}
        try:
            response = await client.get(f"{API_BASE}/{endpoint}", params=params)
        except httpx.HTTPError as exc:
            raise YouTubeError(f"Network error: {exc}", 502) from exc

        if response.status_code != 200:
            try:
                message = response.json()["error"]["message"]
            except (ValueError, KeyError):
                message = response.text[:200]
            raise YouTubeError(f"YouTube API error: {message}", response.status_code)
        return response.json()

    async def fetch_channel_with_videos(self, query: str, max_videos: int) -> dict:
        param, value = parse_channel_query(query)
        async with httpx.AsyncClient(timeout=self._timeout) as client:
            data = await self._get(
                client,
                "channels",
                {"part": "snippet,statistics,contentDetails", param: value},
            )
            items = data.get("items") or []
            if not items:
                raise YouTubeError("Channel not found", 404)

            raw = items[0]
            uploads_id = raw["contentDetails"]["relatedPlaylists"]["uploads"]
            video_ids = await self._fetch_upload_ids(client, uploads_id, max_videos)
            videos = await self._fetch_videos(client, video_ids)

        return {"channel": self._normalize_channel(raw), "videos": videos}

    async def _fetch_upload_ids(
        self, client: httpx.AsyncClient, playlist_id: str, limit: int
    ) -> list[str]:
        ids: list[str] = []
        page_token = None
        while len(ids) < limit:
            params = {
                "part": "contentDetails",
                "playlistId": playlist_id,
                "maxResults": min(50, limit - len(ids)),
            }
            if page_token:
                params["pageToken"] = page_token
            data = await self._get(client, "playlistItems", params)
            ids += [item["contentDetails"]["videoId"] for item in data.get("items", [])]
            page_token = data.get("nextPageToken")
            if not page_token:
                break
        return ids

    async def _fetch_videos(self, client: httpx.AsyncClient, ids: list[str]) -> list[dict]:
        videos: list[dict] = []
        for start in range(0, len(ids), 50):
            chunk = ids[start : start + 50]
            data = await self._get(
                client,
                "videos",
                {"part": "snippet,statistics,contentDetails", "id": ",".join(chunk)},
            )
            videos += [self._normalize_video(item) for item in data.get("items", [])]
        return videos

    @staticmethod
    def _normalize_channel(raw: dict) -> dict:
        snippet, stats = raw["snippet"], raw.get("statistics", {})
        return {
            "id": raw["id"],
            "title": snippet.get("title", ""),
            "description": snippet.get("description", ""),
            "thumbnail": _best_thumbnail(snippet.get("thumbnails", {})),
            "custom_url": snippet.get("customUrl"),
            "subscribers": int(stats.get("subscriberCount", 0)),
            "total_views": int(stats.get("viewCount", 0)),
            "video_count": int(stats.get("videoCount", 0)),
            "published_at": snippet.get("publishedAt", ""),
        }

    @staticmethod
    def _normalize_video(raw: dict) -> dict:
        snippet, stats = raw["snippet"], raw.get("statistics", {})
        return {
            "id": raw["id"],
            "title": snippet.get("title", ""),
            "thumbnail": _best_thumbnail(snippet.get("thumbnails", {})),
            "published_at": snippet.get("publishedAt", ""),
            "duration_seconds": parse_duration(raw["contentDetails"].get("duration", "")),
            "views": int(stats.get("viewCount", 0)),
            "likes": int(stats.get("likeCount", 0)),
            "comments": int(stats.get("commentCount", 0)),
        }
