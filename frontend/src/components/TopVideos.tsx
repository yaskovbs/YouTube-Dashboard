import type { Video } from "../api/types";
import { formatCompact, formatDate, formatDuration, videoUrl } from "../utils/format";

interface Props {
  videos: Video[];
}

export function TopVideos({ videos }: Props) {
  return (
    <section className="card">
      <h3 className="card__title">הסרטונים המובילים</h3>
      <p className="card__subtitle">לפי צפיות, מתוך הסרטונים שנותחו</p>
      <ol className="top-list">
        {videos.map((video, index) => (
          <li key={video.id} className="top-item">
            <span className="top-item__rank">{index + 1}</span>
            <a
              className="top-item__thumb"
              href={videoUrl(video.id)}
              target="_blank"
              rel="noreferrer"
            >
              <img src={video.thumbnail} alt="" loading="lazy" />
              <span className="top-item__duration">{formatDuration(video.duration_seconds)}</span>
            </a>
            <div className="top-item__info">
              <a
                className="top-item__title"
                href={videoUrl(video.id)}
                target="_blank"
                rel="noreferrer"
                title={video.title}
                dir="auto"
              >
                {video.title}
              </a>
              <span className="top-item__meta">
                {formatCompact(video.views)} צפיות · {video.engagement_rate}% מעורבות ·{" "}
                {formatDate(video.published_at)}
              </span>
            </div>
            {video.is_short && <span className="badge">Short</span>}
          </li>
        ))}
      </ol>
    </section>
  );
}
