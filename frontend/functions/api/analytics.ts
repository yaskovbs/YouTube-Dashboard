// GET /api/analytics?channel=&demo=&limit=  (port of backend/app/routes.py)
import { buildAnalytics } from "../_lib/analytics";
import { buildDemoData } from "../_lib/demo";
import type { Env } from "../_lib/types";
import { YouTubeError } from "../_lib/types";
import { fetchChannelWithVideos } from "../_lib/youtube";

const CACHE_SECONDS = 600;

const fail = (status: number, detail: string) => Response.json({ detail }, { status });

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const params = new URL(request.url).searchParams;
  const channel = (params.get("channel") ?? "").trim();
  const apiKey = (env.YOUTUBE_API_KEY ?? "").trim();
  const tz = env.TIMEZONE || "Asia/Jerusalem";
  const defaultMax = Math.min(parseInt(env.MAX_VIDEOS ?? "50", 10) || 50, 200);

  const limitParam = params.get("limit");
  const limit = limitParam === null ? null : Number(limitParam);
  if (limit !== null && (!Number.isInteger(limit) || limit < 5 || limit > 200)) {
    return fail(422, "limit must be an integer between 5 and 200");
  }
  const maxVideos = limit ?? defaultMax;

  if (params.get("demo") === "true" || !apiKey || !channel) {
    return Response.json(buildAnalytics(buildDemoData(maxVideos), tz, true));
  }

  // Cache real results at the edge to save YouTube API quota.
  const cache = (caches as unknown as { default: Cache }).default;
  const cacheKey = new Request(
    `https://cache.internal/analytics/${encodeURIComponent(channel.toLowerCase())}/${maxVideos}`,
  );
  const cached = await cache.match(cacheKey);
  if (cached) return cached;

  try {
    const raw = await fetchChannelWithVideos(apiKey, channel, maxVideos);
    const response = Response.json(buildAnalytics(raw, tz, false), {
      headers: { "Cache-Control": `public, max-age=${CACHE_SECONDS}` },
    });
    await cache.put(cacheKey, response.clone());
    return response;
  } catch (err) {
    if (err instanceof YouTubeError) return fail(err.status, err.message);
    throw err;
  }
};
