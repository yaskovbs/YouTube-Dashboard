import type { Channel } from "../api/types";
import { formatCompact, formatDate } from "../utils/format";

interface Props {
  channel: Channel;
  demo: boolean;
}

export function ChannelHeader({ channel, demo }: Props) {
  return (
    <section className="channel card">
      <img className="channel__avatar" src={channel.thumbnail} alt="" />
      <div className="channel__info">
        <div className="channel__title-row">
          <h2 className="channel__title">{channel.title}</h2>
          {demo && <span className="badge badge--demo">דמו</span>}
        </div>
        {channel.custom_url && (
          <span className="channel__handle" dir="ltr">
            {channel.custom_url}
          </span>
        )}
        <div className="channel__meta">
          <span>
            <strong>{formatCompact(channel.subscribers)}</strong> מנויים
          </span>
          <span>
            <strong>{formatCompact(channel.total_views)}</strong> צפיות סה״כ
          </span>
          <span>
            <strong>{formatCompact(channel.video_count)}</strong> סרטונים
          </span>
          <span>נפתח ב-{formatDate(channel.published_at)}</span>
        </div>
      </div>
    </section>
  );
}
