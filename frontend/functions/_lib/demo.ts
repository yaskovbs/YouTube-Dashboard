// Realistic fake data so the dashboard works without an API key.
import type { RawData, RawVideo } from "./types";

const TITLES = [
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
];

const HOUR = 3_600_000;
const DAY = 24 * HOUR;

// Small seeded PRNG (mulberry32) so the demo is stable between requests.
function makeRng(seed: number) {
  let state = seed >>> 0;
  const next = () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const uniform = (a: number, b: number) => a + (b - a) * next();
  const int = (a: number, b: number) => Math.floor(uniform(a, b + 1));
  const lognormal = (mu: number, sigma: number) => {
    const u = 1 - next();
    const z = Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * next());
    return Math.exp(mu + sigma * z);
  };
  return { next, uniform, int, lognormal };
}

export function buildDemoData(maxVideos = 50, seed = 42): RawData {
  const rng = makeRng(seed);
  const now = Date.now();
  const videos: RawVideo[] = [];
  let published = now - rng.int(6, 30) * HOUR;

  for (let index = 0; index < maxVideos; index++) {
    const isShort = rng.next() < 0.3;
    const duration = isShort ? rng.int(20, 59) : rng.int(360, 1500);
    let base = rng.lognormal(isShort ? 10.2 : 9.6, 0.8);
    // Friday/Saturday uploads perform a bit better in the demo data.
    if ([5, 6].includes(new Date(published).getUTCDay())) base *= 1.35;
    const views = Math.floor(base);
    const title = TITLES[rng.int(0, TITLES.length - 1)];

    videos.push({
      id: `demo${String(index).padStart(4, "0")}`,
      title: isShort ? `#shorts ${title}` : title,
      thumbnail: `https://picsum.photos/seed/yt${index}/480/270`,
      published_at: new Date(published).toISOString(),
      duration_seconds: duration,
      views,
      likes: Math.floor(views * rng.uniform(0.02, 0.06)),
      comments: Math.floor(views * rng.uniform(0.002, 0.01)),
    });
    published -= rng.uniform(1.5, 5) * DAY + rng.int(0, 12) * HOUR;
  }

  return {
    channel: {
      id: "UCdemo000000000000000000",
      title: "ערוץ דמו - סיכומי סדרות",
      description: "Demo channel. Add a YOUTUBE_API_KEY to load real data.",
      thumbnail: "https://picsum.photos/seed/ytchannel/240/240",
      custom_url: "@demo-recaps",
      subscribers: 48_300,
      total_views: videos.reduce((sum, v) => sum + v.views, 0) * 4,
      video_count: maxVideos * 3,
      published_at: new Date(now - 900 * DAY).toISOString(),
    },
    videos,
  };
}
