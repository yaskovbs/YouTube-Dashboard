import type { Summary } from "../api/types";
import { formatCompact } from "../utils/format";

interface Props {
  summary: Summary;
}

export function FormatCompare({ summary }: Props) {
  const { shorts_count, long_count, avg_views_shorts, avg_views_long } = summary;
  const maxAvg = Math.max(avg_views_shorts, avg_views_long, 1);
  const total = shorts_count + long_count || 1;

  const rows = [
    { label: "Shorts", count: shorts_count, avg: avg_views_shorts, cls: "bar--primary" },
    { label: "סרטונים ארוכים", count: long_count, avg: avg_views_long, cls: "bar--secondary" },
  ];

  let verdict = "אין מספיק נתונים להשוואה";
  if (shorts_count > 0 && long_count > 0) {
    const ratio = avg_views_shorts / Math.max(avg_views_long, 1);
    verdict =
      ratio >= 1
        ? `Shorts מביאים פי ${ratio.toFixed(1)} יותר צפיות בממוצע`
        : `סרטונים ארוכים מביאים פי ${(1 / ratio).toFixed(1)} יותר צפיות בממוצע`;
  }

  return (
    <section className="card">
      <h3 className="card__title">Shorts מול ארוכים</h3>
      <p className="card__subtitle">{verdict}</p>
      <div className="compare">
        {rows.map((row) => (
          <div className="compare__row" key={row.label}>
            <div className="compare__head">
              <span className="compare__label">{row.label}</span>
              <span className="compare__meta">
                {row.count} סרטונים · {Math.round((row.count / total) * 100)}%
              </span>
            </div>
            <div className="bar-track">
              <div
                className={`bar ${row.cls}`}
                style={{ width: `${(row.avg / maxAvg) * 100}%` }}
              />
            </div>
            <span className="compare__value">{formatCompact(row.avg)} צפיות בממוצע</span>
          </div>
        ))}
      </div>
    </section>
  );
}
