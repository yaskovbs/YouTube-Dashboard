// Shared colors and styles for all Recharts charts (matches global.css tokens).

export const CHART = {
  primary: "#ff6b5e",
  secondary: "#3ec7b4",
  muted: "#3a4150",
  grid: "#262b36",
  axis: "#8b93a5",
  tooltipBg: "#161a22",
  tooltipBorder: "#2c3240",
};

export const axisProps = {
  stroke: CHART.axis,
  tick: { fill: CHART.axis, fontSize: 12 },
  tickLine: false,
  axisLine: false,
} as const;

export const tooltipProps = {
  contentStyle: {
    background: CHART.tooltipBg,
    border: `1px solid ${CHART.tooltipBorder}`,
    borderRadius: 10,
    direction: "rtl" as const,
    textAlign: "right" as const,
  },
  labelStyle: { color: "#e8eaf0", fontWeight: 700 },
  itemStyle: { color: "#c5cad6" },
  cursor: { fill: "rgba(255,255,255,0.04)" },
};
