import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { WeekdayStat } from "../api/types";
import { CHART, axisProps, tooltipProps } from "../utils/chartTheme";
import { WEEKDAYS_HE, formatCompact, formatNumber } from "../utils/format";

interface Props {
  data: WeekdayStat[];
}

export function WeekdayChart({ data }: Props) {
  const rows = data.map((d) => ({ ...d, label: WEEKDAYS_HE[d.weekday] }));
  const withVideos = rows.filter((r) => r.videos > 0);
  const best = withVideos.reduce<(typeof rows)[number] | null>(
    (top, row) => (!top || row.avg_views > top.avg_views ? row : top),
    null,
  );

  return (
    <section className="card chart-card">
      <h3 className="card__title">יום העלאה מומלץ</h3>
      <p className="card__subtitle">
        {best ? (
          <>
            סרטונים שעלו ביום <strong className="accent">{best.label}</strong> קיבלו הכי הרבה
            צפיות בממוצע
          </>
        ) : (
          "אין מספיק נתונים"
        )}
      </p>
      <div className="chart-wrap" dir="ltr">
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={rows} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
            <CartesianGrid stroke={CHART.grid} vertical={false} />
            <XAxis dataKey="label" reversed {...axisProps} />
            <YAxis orientation="right" tickFormatter={formatCompact} width={48} {...axisProps} />
            <Tooltip
              {...tooltipProps}
              formatter={(value: number) => [formatNumber(value), "ממוצע צפיות"]}
              labelFormatter={(label, payload) => {
                const videos = payload?.[0]?.payload?.videos ?? 0;
                return `${label} · ${videos} סרטונים`;
              }}
            />
            <Bar dataKey="avg_views" radius={[6, 6, 0, 0]} maxBarSize={40}>
              {rows.map((row) => (
                <Cell
                  key={row.weekday}
                  fill={best && row.weekday === best.weekday ? CHART.primary : CHART.muted}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
