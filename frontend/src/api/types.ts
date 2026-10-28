// Mirrors backend/app/models.py

export interface Channel {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  custom_url: string | null;
  subscribers: number;
  total_views: number;
  video_count: number;
  published_at: string;
}

export interface Video {
  id: string;
  title: string;
  thumbnail: string;
  published_at: string;
  duration_seconds: number;
  is_short: boolean;
  views: number;
  likes: number;
  comments: number;
  engagement_rate: number;
}

export interface Summary {
  analyzed_videos: number;
  avg_views: number;
  median_views: number;
  avg_engagement_rate: number;
  total_recent_views: number;
  shorts_count: number;
  long_count: number;
  avg_views_shorts: number;
  avg_views_long: number;
  uploads_per_week: number;
}

export interface TimelinePoint {
  month: string;
  videos: number;
  views: number;
  avg_views: number;
}

export interface WeekdayStat {
  weekday: number; // 0 = Sunday
  videos: number;
  avg_views: number;
}

export interface AnalyticsResponse {
  demo: boolean;
  channel: Channel;
  summary: Summary;
  timeline: TimelinePoint[];
  weekdays: WeekdayStat[];
  top_videos: Video[];
  videos: Video[];
}

export interface HealthResponse {
  status: string;
  has_api_key: boolean;
}
