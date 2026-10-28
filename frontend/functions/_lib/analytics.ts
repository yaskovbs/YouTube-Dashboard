// Dashboard statistics (port of backend/app/analytics.py, without pandas).
import type {
  AnalyticsResponse,
  Summary,
  TimelinePoint,
  Video,
  WeekdayStat,
} from "../../src/api/types";
import type { RawData } from "./types";

const SHORT_MAX_SECONDS = 60;
const TOP_VIDEOS_COUNT = 5;
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const round = (value: number, digits: number) => {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
};
const mean = (values: number[]) =>
  values.length ? round(values.reduce((a, b) => a + b, 0) / values.length, 1) : 0;

function median(values: number[]): number {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = sorted.length >> 1;
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

// Local year-month and Sunday-based weekday of a timestamp in the given timezone.
function localParts(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    weekday: "short",
  }).formatToParts(date);
  const pick = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return {
    month: `${pick("year")}-${pick("month")}`,
    weekday: WEEKDAYS.indexOf(pick("weekday")),
  };
}

function toVideo(raw: RawData["videos"][number]): Video {
  const rate = raw.views > 0 ? ((raw.likes + raw.comments) / raw.views) * 100 : 0;
  return {
    ...raw,
    is_short: raw.duration_seconds <= SHORT_MAX_SECONDS,
    engagement_rate: round(rate, 2),
  };
}

function summarize(videos: Video[]): Summary {
  const views = videos.map((v) => v.views);
  const shorts = videos.filter((v) => v.is_short).map((v) => v.views);
  const longs = videos.filter((v) => !v.is_short).map((v) => v.views);
  const times = videos.map((v) => Date.parse(v.published_at));
  const spanDays = Math.floor((Math.max(...times) - Math.min(...times)) / 86_400_000) || 1;
  return {
    analyzed_videos: videos.length,
    avg_views: mean(views),
    median_views: median(views),
    avg_engagement_rate: mean(videos.map((v) => v.engagement_rate)),
    total_recent_views: views.reduce((a, b) => a + b, 0),
    shorts_count: shorts.length,
    long_count: longs.length,
    avg_views_shorts: mean(shorts),
    avg_views_long: mean(longs),
    uploads_per_week: round(videos.length / (spanDays / 7), 2),
  };
}

function timeline(videos: Video[], tz: string): TimelinePoint[] {
  const months = new Map<string, number[]>();
  for (const video of videos) {
    const { month } = localParts(new Date(video.published_at), tz);
    months.set(month, [...(months.get(month) ?? []), video.views]);
  }
  return [...months.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, views]) => ({
      month,
      videos: views.length,
      views: views.reduce((a, b) => a + b, 0),
      avg_views: mean(views),
    }));
}

function weekdays(videos: Video[], tz: string): WeekdayStat[] {
  const buckets: number[][] = WEEKDAYS.map(() => []);
  for (const video of videos) {
    buckets[localParts(new Date(video.published_at), tz).weekday].push(video.views);
  }
  return buckets.map((views, weekday) => ({
    weekday,
    videos: views.length,
    avg_views: mean(views),
  }));
}

const EMPTY_SUMMARY: Summary = {
  analyzed_videos: 0,
  avg_views: 0,
  median_views: 0,
  avg_engagement_rate: 0,
  total_recent_views: 0,
  shorts_count: 0,
  long_count: 0,
  avg_views_shorts: 0,
  avg_views_long: 0,
  uploads_per_week: 0,
};

export function buildAnalytics(raw: RawData, tz: string, demo: boolean): AnalyticsResponse {
  if (!raw.videos.length) {
    return {
      demo,
      channel: raw.channel,
      summary: EMPTY_SUMMARY,
      timeline: [],
      weekdays: [],
      top_videos: [],
      videos: [],
    };
  }
  const videos = raw.videos
    .map(toVideo)
    .sort((a, b) => Date.parse(b.published_at) - Date.parse(a.published_at));
  const top = [...videos].sort((a, b) => b.views - a.views).slice(0, TOP_VIDEOS_COUNT);
  return {
    demo,
    channel: raw.channel,
    summary: summarize(videos),
    timeline: timeline(videos, tz),
    weekdays: weekdays(videos, tz),
    top_videos: top,
    videos,
  };
}
