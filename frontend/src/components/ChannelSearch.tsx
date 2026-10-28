import { useState, type FormEvent } from "react";

interface Props {
  initialValue: string;
  loading: boolean;
  hasApiKey: boolean | null;
  onSearch: (channel: string, limit: number) => void;
}

const LIMIT_OPTIONS = [25, 50, 100, 200];

export function ChannelSearch({ initialValue, loading, hasApiKey, onSearch }: Props) {
  const [value, setValue] = useState(initialValue);
  const [limit, setLimit] = useState(50);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    onSearch(value, limit);
  };

  return (
    <form className="search" onSubmit={handleSubmit}>
      <div className="search__row">
        <input
          className="search__input"
          type="text"
          dir="ltr"
          placeholder="@handle / קישור לערוץ / Channel ID"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          aria-label="ערוץ לניתוח"
        />
        <select
          className="search__select"
          value={limit}
          onChange={(e) => setLimit(Number(e.target.value))}
          aria-label="מספר סרטונים לניתוח"
        >
          {LIMIT_OPTIONS.map((n) => (
            <option key={n} value={n}>
              {n} סרטונים
            </option>
          ))}
        </select>
        <button className="btn btn--primary" type="submit" disabled={loading}>
          {loading ? "מנתח…" : "נתח ערוץ"}
        </button>
        <button
          className="btn btn--ghost"
          type="button"
          disabled={loading}
          onClick={() => {
            setValue("");
            onSearch("", limit);
          }}
        >
          נתוני דמו
        </button>
      </div>
      {hasApiKey === false && (
        <p className="search__hint">
          אין מפתח API בשרת, לכן מוצגים נתוני דמו. הוסף <code>YOUTUBE_API_KEY</code>{" "}
          לקובץ <code>backend/.env</code> כדי לנתח ערוצים אמיתיים.
        </p>
      )}
    </form>
  );
}
