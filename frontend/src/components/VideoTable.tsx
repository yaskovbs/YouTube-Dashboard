import { useMemo, useState } from "react";
import type { Video } from "../api/types";
import { formatDate, formatDuration, formatNumber, videoUrl } from "../utils/format";

interface Props {
  videos: Video[];
}

type SortKey = "published_at" | "views" | "likes" | "comments" | "engagement_rate";
type Filter = "all" | "shorts" | "long";

const COLUMNS: { key: SortKey; label: string }[] = [
  { key: "published_at", label: "תאריך" },
  { key: "views", label: "צפיות" },
  { key: "likes", label: "לייקים" },
  { key: "comments", label: "תגובות" },
  { key: "engagement_rate", label: "מעורבות" },
];

const FILTERS: { key: Filter; label: string }[] = [
  { key: "all", label: "הכל" },
  { key: "shorts", label: "Shorts" },
  { key: "long", label: "ארוכים" },
];

export function VideoTable({ videos }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>("published_at");
  const [ascending, setAscending] = useState(false);
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = videos.filter((v) => {
      if (filter === "shorts" && !v.is_short) return false;
      if (filter === "long" && v.is_short) return false;
      return !q || v.title.toLowerCase().includes(q);
    });
    return [...filtered].sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      const diff = typeof av === "string" ? av.localeCompare(bv as string) : av - (bv as number);
      return ascending ? diff : -diff;
    });
  }, [videos, sortKey, ascending, filter, query]);

  const toggleSort = (key: SortKey) => {
    if (key === sortKey) setAscending((a) => !a);
    else {
      setSortKey(key);
      setAscending(false);
    }
  };

  return (
    <section className="card">
      <div className="table-toolbar">
        <h3 className="card__title">כל הסרטונים ({rows.length})</h3>
        <div className="table-toolbar__controls">
          <input
            className="search__input search__input--small"
            placeholder="חיפוש לפי כותרת…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <div className="segmented" role="group" aria-label="סינון סוג סרטון">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                type="button"
                className={filter === f.key ? "is-active" : ""}
                onClick={() => setFilter(f.key)}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="table-scroll">
        <table className="table">
          <thead>
            <tr>
              <th>סרטון</th>
              <th>אורך</th>
              {COLUMNS.map((col) => (
                <th key={col.key}>
                  <button type="button" className="th-sort" onClick={() => toggleSort(col.key)}>
                    {col.label}
                    {sortKey === col.key && <span>{ascending ? " ▲" : " ▼"}</span>}
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((v) => (
              <tr key={v.id}>
                <td className="table__title">
                  <a href={videoUrl(v.id)} target="_blank" rel="noreferrer" title={v.title} dir="auto">
                    {v.title}
                  </a>
                </td>
                <td className="num">{formatDuration(v.duration_seconds)}</td>
                <td>{formatDate(v.published_at)}</td>
                <td className="num">{formatNumber(v.views)}</td>
                <td className="num">{formatNumber(v.likes)}</td>
                <td className="num">{formatNumber(v.comments)}</td>
                <td className="num">{v.engagement_rate}%</td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && <p className="empty">לא נמצאו סרטונים</p>}
      </div>
    </section>
  );
}
