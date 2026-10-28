import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { TimelinePoint } from "../api/types";
import { CHART, axisProps, tooltipProps } from "../utils/chartTheme";
import { formatCompact, formatMonth, formatNumber } from "../utils/format";

interface Props {
  data: TimelinePoint[];
}

export function TimelineChart({ data }: Props) {
  const rows = data.map((p) => ({ ...p, label: formatMonth(p.month) }));

  return (
    <section className="card chart-card">
      <h3 className="card__title">צפיות לפי חודש העלאה</h3>
      <p className="card__subtitle">עמודות: סך הצפיות · קו: ממוצע לסרטון</p>
      {/* Charts render LTR internally; the X axis is reversed so time flows right-to-left. */}
      <div className="chart-wrap" dir="ltr">
        <ResponsiveContainer width="100%" height={280}>
          <ComposedChart data={rows} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
            <CartesianGrid stroke={CHART.grid} vertical={false} />
            <XAxis dataKey="label" reversed {...axisProps} />
            <YAxis
              yAxisId="total"
              orientation="right"
              tickFormatter={formatCompact}
              width={48}
              {...axisProps}
            />
            <YAxis
              yAxisId="avg"
              orientation="left"
              tickFormatter={formatCompact}
              width={48}
              {...axisProps}
            />
            <Tooltip
              {...tooltipProps}
              formatter={(value: number, name: string) => [formatNumber(value), name]}
            />
            <Legend wrapperStyle={{ direction: "rtl", fontSize: 13 }} />
            <Bar
              yAxisId="total"
              dataKey="views"
              name="סך צפיות"
              fill={CHART.primary}
              radius={[6, 6, 0, 0]}
              maxBarSize={36}
            />
            <Line
              yAxisId="avg"
              dataKey="avg_views"
              name="ממוצע לסרטון"
              stroke={CHART.secondary}
              strokeWidth={2.5}
              dot={{ r: 3, fill: CHART.secondary }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
