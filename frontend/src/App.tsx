import { ChannelHeader } from "./components/ChannelHeader";
import { ChannelSearch } from "./components/ChannelSearch";
import { FormatCompare } from "./components/FormatCompare";
import { StatCards } from "./components/StatCards";
import { StatusMessage } from "./components/StatusMessage";
import { TimelineChart } from "./components/TimelineChart";
import { TopVideos } from "./components/TopVideos";
import { VideoTable } from "./components/VideoTable";
import { WeekdayChart } from "./components/WeekdayChart";
import { useChannelData } from "./hooks/useChannelData";

export default function App() {
  const { data, loading, error, hasApiKey, lastChannel, load } = useChannelData();

  return (
    <div className="app">
      <header className="app__header">
        <div>
          <h1 className="app__title">
            דשבורד <span className="accent">יוטיוב</span>
          </h1>
          <p className="app__subtitle">ניתוח ביצועים של ערוץ: מה עובד, מתי להעלות ואיזה פורמט מנצח</p>
        </div>
      </header>

      <ChannelSearch
        initialValue={lastChannel}
        loading={loading}
        hasApiKey={hasApiKey}
        onSearch={(channel, limit) => void load(channel, limit)}
      />

      {error && <StatusMessage type="error" message={error} />}
      {loading && !data && <StatusMessage type="loading" />}

      {data && (
        <main className={`dashboard ${loading ? "is-refreshing" : ""}`}>
          <ChannelHeader channel={data.channel} demo={data.demo} />
          <StatCards summary={data.summary} />
          <TimelineChart data={data.timeline} />
          <div className="grid-2">
            <WeekdayChart data={data.weekdays} />
            <FormatCompare summary={data.summary} />
          </div>
          <TopVideos videos={data.top_videos} />
          <VideoTable videos={data.videos} />
        </main>
      )}

      <footer className="app__footer">נתונים מ-YouTube Data API v3 · עודכן בכל חיפוש</footer>
    </div>
  );
}
