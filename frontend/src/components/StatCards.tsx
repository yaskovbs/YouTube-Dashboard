import type { Summary } from "../api/types";
import { formatCompact, formatNumber } from "../utils/format";

interface Props {
  summary: Summary;
}

interface Stat {
  label: string;
  value: string;
  hint?: string;
}

export function StatCards({ summary }: Props) {
  const stats: Stat[] = [
    {
      label: "ממוצע צפיות לסרטון",
      value: formatCompact(summary.avg_views),
      hint: `חציון: ${formatCompact(summary.median_views)}`,
    },
    {
      label: "אחוז מעורבות",
      value: `${summary.avg_engagement_rate}%`,
      hint: "לייקים + תגובות / צפיות",
    },
    {
      label: "העלאות בשבוע",
      value: String(summary.uploads_per_week),
      hint: `${summary.analyzed_videos} סרטונים נותחו`,
    },
    {
      label: "צפיות בסרטונים שנותחו",
      value: formatCompact(summary.total_recent_views),
      hint: formatNumber(summary.total_recent_views),
    },
  ];

  return (
    <section className="stats">
      {stats.map((stat) => (
        <div className="stat card" key={stat.label}>
          <span className="stat__label">{stat.label}</span>
          <span className="stat__value">{stat.value}</span>
          {stat.hint && <span className="stat__hint">{stat.hint}</span>}
        </div>
      ))}
    </section>
  );
}
