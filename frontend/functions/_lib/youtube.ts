// Thin client for the YouTube Data API v3 (port of backend/app/youtube_client.py).
import type { RawData, RawVideo } from "./types";
import { YouTubeError } from "./types";
import type { Channel } from "../../src/api/types";

const API_BASE = "https://www.googleapis.com/youtube/v3";
const DURATION_RE = /^P(?:(\d+)D)?T?(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/;

type Json = Record<string, any>;

export function parseChannelQuery(input: string): [string, string] {
  const query = input.trim();
  const url = query.match(/youtube\.com\/(channel\/|@)([\w.\-]+)/);
  if (url) {
    return url[1] === "channel/" ? ["id", url[2]] : ["forHandle", "@" + url[2]];
  }
  if (/^UC[\w\-]{22}$/.test(query)) return ["id", query];
  return ["forHandle", query.startsWith("@") ? query : "@" + query];
}

export function parseDuration(iso: string): number {
  const match = DURATION_RE.exec(iso || "");
  if (!match) return 0;
  const [d, h, m, s] = match.slice(1).map((v) => (v ? parseInt(v, 10) : 0));
  return d * 86400 + h * 3600 + m * 60 + s;
}

function bestThumbnail(thumbnails: Json = {}): string {
  for (const size of ["high", "medium", "default"]) {
    if (thumbnails[size]) return thumbnails[size].url;
  }
  return "";
}

async function get(apiKey: string, endpoint: string, params: Json): Promise<Json> {
  const url = new URL(`${API_BASE}/${endpoint}`);
  for (const [key, value] of Object.entries({ ...params, key: apiKey })) {
    url.searchParams.set(key, String(value));
  }
  let response: Response;
  try {
    response = await fetch(url);
  } catch (err) {
    throw new YouTubeError(`Network error: ${err}`, 502);
  }
  if (!response.ok) {
    let message: string;
    try {
      message = ((await response.json()) as Json).error.message;
    } catch {
      message = response.statusText;
    }
    throw new YouTubeError(`YouTube API error: ${message}`, response.status);
  }
  return (await response.json()) as Json;
}

function normalizeChannel(raw: Json): Channel {
  const { snippet, statistics: stats = {} } = raw;
  return {
    id: raw.id,
    title: snippet.title ?? "",
    description: snippet.description ?? "",
    thumbnail: bestThumbnail(snippet.thumbnails),
    custom_url: snippet.customUrl ?? null,
    subscribers: Number(stats.subscriberCount ?? 0),
    total_views: Number(stats.viewCount ?? 0),
    video_count: Number(stats.videoCount ?? 0),
    published_at: snippet.publishedAt ?? "",
  };
}

function normalizeVideo(raw: Json): RawVideo {
  const { snippet, statistics: stats = {} } = raw;
  return {
    id: raw.id,
    title: snippet.title ?? "",
    thumbnail: bestThumbnail(snippet.thumbnails),
    published_at: snippet.publishedAt ?? "",
    duration_seconds: parseDuration(raw.contentDetails?.duration ?? ""),
    views: Number(stats.viewCount ?? 0),
    likes: Number(stats.likeCount ?? 0),
    comments: Number(stats.commentCount ?? 0),
  };
}

async function fetchUploadIds(apiKey: string, playlistId: string, limit: number) {
  const ids: string[] = [];
  let pageToken: string | undefined;
  while (ids.length < limit) {
    const params: Json = {
      part: "contentDetails",
      playlistId,
      maxResults: Math.min(50, limit - ids.length),
    };
    if (pageToken) params.pageToken = pageToken;
    const data = await get(apiKey, "playlistItems", params);
    for (const item of data.items ?? []) ids.push(item.contentDetails.videoId);
    pageToken = data.nextPageToken;
    if (!pageToken) break;
  }
  return ids;
}

async function fetchVideos(apiKey: string, ids: string[]): Promise<RawVideo[]> {
  const chunks: string[][] = [];
  for (let i = 0; i < ids.length; i += 50) chunks.push(ids.slice(i, i + 50));
  const pages = await Promise.all(
    chunks.map((chunk) =>
      get(apiKey, "videos", {
        part: "snippet,statistics,contentDetails",
        id: chunk.join(","),
      }),
    ),
  );
  return pages.flatMap((page) => (page.items ?? []).map(normalizeVideo));
}

export async function fetchChannelWithVideos(
  apiKey: string,
  query: string,
  maxVideos: number,
): Promise<RawData> {
  const [param, value] = parseChannelQuery(query);
  const data = await get(apiKey, "channels", {
    part: "snippet,statistics,contentDetails",
    [param]: value,
  });
  const raw = data.items?.[0];
  if (!raw) throw new YouTubeError("Channel not found", 404);

  const uploadsId = raw.contentDetails.relatedPlaylists.uploads;
  const ids = await fetchUploadIds(apiKey, uploadsId, maxVideos);
  return { channel: normalizeChannel(raw), videos: await fetchVideos(apiKey, ids) };
}
