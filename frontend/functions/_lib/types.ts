import type { Channel, Video } from "../../src/api/types";

export interface Env {
  YOUTUBE_API_KEY?: string;
  MAX_VIDEOS?: string;
  TIMEZONE?: string;
}

export type RawVideo = Omit<Video, "is_short" | "engagement_rate">;

export interface RawData {
  channel: Channel;
  videos: RawVideo[];
}

export class YouTubeError extends Error {
  constructor(
    message: string,
    public status: number = 400,
  ) {
    super(message);
  }
}
