"""Tiny in-memory TTL cache to save YouTube API quota."""

import time
from typing import Any


class TTLCache:
    def __init__(self, ttl_seconds: int = 600, max_items: int = 100):
        self._ttl = ttl_seconds
        self._max = max_items
        self._store: dict[str, tuple[float, Any]] = {}

    def get(self, key: str) -> Any | None:
        entry = self._store.get(key)
        if entry is None:
            return None
        expires_at, value = entry
        if time.monotonic() > expires_at:
            self._store.pop(key, None)
            return None
        return value

    def set(self, key: str, value: Any) -> None:
        if len(self._store) >= self._max:
            oldest = min(self._store, key=lambda k: self._store[k][0])
            self._store.pop(oldest, None)
        self._store[key] = (time.monotonic() + self._ttl, value)
