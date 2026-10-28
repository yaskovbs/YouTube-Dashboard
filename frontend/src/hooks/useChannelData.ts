import { useCallback, useEffect, useState } from "react";
import { fetchAnalytics, fetchHealth } from "../api/client";
import type { AnalyticsResponse } from "../api/types";

const LAST_CHANNEL_KEY = "yt-analytics:last-channel";

function readLastChannel(): string {
  try {
    return localStorage.getItem(LAST_CHANNEL_KEY) ?? "";
  } catch {
    return "";
  }
}

function saveLastChannel(channel: string): void {
  try {
    localStorage.setItem(LAST_CHANNEL_KEY, channel);
  } catch {
    // Storage may be unavailable (private mode); ignore.
  }
}

export function useChannelData() {
  const [data, setData] = useState<AnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasApiKey, setHasApiKey] = useState<boolean | null>(null);
  const [lastChannel] = useState(readLastChannel);

  const load = useCallback(async (channel: string, limit?: number) => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchAnalytics(channel.trim(), {
        demo: !channel.trim(),
        limit,
      });
      setData(result);
      if (channel.trim()) saveLastChannel(channel.trim());
    } catch (err) {
      setError(err instanceof Error ? err.message : "שגיאה לא ידועה");
    } finally {
      setLoading(false);
    }
  }, []);

  // On first load: check the backend and show the last channel (or demo data).
  useEffect(() => {
    fetchHealth()
      .then((health) => setHasApiKey(health.has_api_key))
      .catch(() => setError("השרת לא זמין. ודא שה-backend רץ על פורט 8000."));
    void load(lastChannel);
  }, [load, lastChannel]);

  return { data, loading, error, hasApiKey, lastChannel, load };
}
