const compact = new Intl.NumberFormat("he-IL", {
  notation: "compact",
  maximumFractionDigits: 1,
});
const full = new Intl.NumberFormat("he-IL");
const dateFmt = new Intl.DateTimeFormat("he-IL", {
  day: "numeric",
  month: "short",
  year: "numeric",
});
const monthFmt = new Intl.DateTimeFormat("he-IL", { month: "short", year: "2-digit" });

export const WEEKDAYS_HE = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"];

export function formatCompact(value: number): string {
  return compact.format(value);
}

export function formatNumber(value: number): string {
  return full.format(Math.round(value));
}

export function formatDate(iso: string): string {
  return dateFmt.format(new Date(iso));
}

/** "2026-05" -> "מאי 26" */
export function formatMonth(month: string): string {
  const [year, m] = month.split("-").map(Number);
  return monthFmt.format(new Date(year, m - 1, 1));
}

export function formatDuration(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
}

export function videoUrl(id: string): string {
  return `https://www.youtube.com/watch?v=${id}`;
}
