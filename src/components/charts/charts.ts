import type { EChartsOption } from "echarts";
import type {
  DashboardData,
  TaskStatus,
  TimeSeriesPoint,
} from "@/types/domain";

export const CHART_PALETTE = {
  blue: "#1e90ff",
  blueSoft: "rgba(30,144,255,0.18)",
  green: "#22c55e",
  greenSoft: "rgba(34,197,94,0.22)",
  amber: "#f59e0b",
  violet: "#a855f7",
  cyan: "#06b6d4",
  rose: "#ef4444",
  grid: "#eef2f7",
  axis: "#94a3b8",
};

const SERIES = [
  CHART_PALETTE.blue,
  CHART_PALETTE.green,
  CHART_PALETTE.amber,
  CHART_PALETTE.violet,
  CHART_PALETTE.cyan,
  CHART_PALETTE.rose,
];

const STATUS_LABEL: Record<TaskStatus, string> = {
  open: "פתוח",
  in_progress: "בטיפול",
  blocked: "חסום",
  done: "הושלם",
};

const tooltipBase = {
  backgroundColor: "rgba(255,255,255,0.97)",
  borderColor: "rgba(15,23,42,0.06)",
  borderWidth: 1,
  padding: [10, 14] as [number, number],
  textStyle: {
    color: "#0f172a",
    fontSize: 12,
    fontWeight: 600,
    fontFamily: "var(--font-heebo), Heebo, system-ui, sans-serif",
  },
  extraCssText:
    "border-radius:14px; box-shadow:0 12px 36px -8px rgba(15,23,42,0.18), 0 2px 6px rgba(15,23,42,0.06); backdrop-filter:blur(12px) saturate(140%); transition:all 0.22s cubic-bezier(0.16,1,0.3,1);",
};

const baseGrid = {
  left: 6,
  right: 14,
  top: 14,
  bottom: 18,
  containLabel: true,
};

const heDate = (iso: string) => {
  const d = new Date(iso);
  return `${d.getDate()}/${d.getMonth() + 1}`;
};

const heDateFull = (iso: string) => {
  const d = new Date(iso);
  return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
};

export function lineOption(series: TimeSeriesPoint[]): EChartsOption {
  const dates = series.map((p) => p.date);
  return {
    grid: baseGrid,
    tooltip: {
      trigger: "axis",
      ...tooltipBase,
      formatter: (params) => {
        const p = Array.isArray(params) ? params[0] : params;
        const idx = (p as { dataIndex: number }).dataIndex;
        const val = (p as { value: number }).value;
        return `
          <div style="display:flex;flex-direction:column;gap:2px;text-align:right;direction:rtl">
            <span style="font-size:11px;color:#64748b">${heDateFull(dates[idx])}</span>
            <span style="font-size:14px;font-weight:800;color:#0f172a">${val} פניות</span>
          </div>`;
      },
    },
    xAxis: {
      type: "category",
      data: series.map((p) => heDate(p.date)),
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: CHART_PALETTE.axis, fontSize: 11, margin: 12 },
    },
    yAxis: {
      type: "value",
      axisLine: { show: false },
      axisTick: { show: false },
      splitLine: { lineStyle: { color: CHART_PALETTE.grid, type: "dashed" } },
      axisLabel: { color: CHART_PALETTE.axis, fontSize: 11 },
    },
    series: [
      {
        type: "line",
        smooth: 0.4,
        symbol: "circle",
        symbolSize: 8,
        showSymbol: false,
        sampling: "lttb",
        emphasis: {
          focus: "series",
          scale: 1.8,
          itemStyle: {
            shadowColor: "rgba(30,144,255,0.45)",
            shadowBlur: 16,
          },
        },
        animationDuration: 900,
        animationEasing: "cubicOut",
        lineStyle: {
          width: 3,
          color: CHART_PALETTE.blue,
          shadowColor: "rgba(30,144,255,0.35)",
          shadowBlur: 14,
          shadowOffsetY: 4,
        },
        itemStyle: {
          color: CHART_PALETTE.blue,
          borderColor: "#fff",
          borderWidth: 2,
        },
        areaStyle: {
          color: {
            type: "linear",
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: "rgba(30,144,255,0.32)" },
              { offset: 0.6, color: "rgba(30,144,255,0.08)" },
              { offset: 1, color: "rgba(30,144,255,0)" },
            ],
          },
        },
        data: series.map((p) => p.value),
      },
    ],
  };
}

export function areaOption(series: TimeSeriesPoint[]): EChartsOption {
  const dates = series.map((p) => p.date);
  return {
    grid: baseGrid,
    tooltip: {
      trigger: "axis",
      ...tooltipBase,
      formatter: (params) => {
        const p = Array.isArray(params) ? params[0] : params;
        const idx = (p as { dataIndex: number }).dataIndex;
        const val = (p as { value: number }).value;
        return `
          <div style="display:flex;flex-direction:column;gap:2px;text-align:right;direction:rtl">
            <span style="font-size:11px;color:#64748b">${heDateFull(dates[idx])}</span>
            <span style="font-size:14px;font-weight:800;color:#16a34a">${val}% עמידה</span>
          </div>`;
      },
    },
    xAxis: {
      type: "category",
      data: series.map((p) => heDate(p.date)),
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: CHART_PALETTE.axis, fontSize: 11, margin: 12 },
    },
    yAxis: {
      type: "value",
      min: 50,
      max: 100,
      axisLine: { show: false },
      axisTick: { show: false },
      splitLine: { lineStyle: { color: CHART_PALETTE.grid, type: "dashed" } },
      axisLabel: {
        color: CHART_PALETTE.axis,
        fontSize: 11,
        formatter: "{value}%",
      },
    },
    series: [
      {
        type: "line",
        smooth: 0.4,
        symbol: "none",
        sampling: "lttb",
        animationDuration: 900,
        animationEasing: "cubicOut",
        emphasis: { focus: "series" },
        lineStyle: {
          width: 2.5,
          color: CHART_PALETTE.green,
          shadowColor: "rgba(34,197,94,0.3)",
          shadowBlur: 10,
          shadowOffsetY: 3,
        },
        areaStyle: {
          color: {
            type: "linear",
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: "rgba(34,197,94,0.5)" },
              { offset: 0.6, color: "rgba(34,197,94,0.12)" },
              { offset: 1, color: "rgba(34,197,94,0)" },
            ],
          },
        },
        data: series.map((p) => p.value),
      },
    ],
  };
}

export function donutOption(
  distribution: DashboardData["statusDistribution"],
): EChartsOption {
  return {
    tooltip: {
      trigger: "item",
      ...tooltipBase,
      formatter: (p) => {
        const item = p as { name: string; value: number; percent: number };
        return `
          <div style="text-align:right;direction:rtl;display:flex;flex-direction:column;gap:2px">
            <span style="font-size:11px;color:#64748b">${item.name}</span>
            <span style="font-size:14px;font-weight:800;color:#0f172a">${item.value} · ${item.percent}%</span>
          </div>`;
      },
    },
    legend: {
      bottom: 0,
      icon: "circle",
      itemWidth: 8,
      itemHeight: 8,
      itemGap: 14,
      textStyle: { fontSize: 11, color: "#475569", fontWeight: 600 },
    },
    series: [
      {
        type: "pie",
        radius: ["58%", "82%"],
        avoidLabelOverlap: true,
        padAngle: 2,
        itemStyle: { borderRadius: 8, borderWidth: 2, borderColor: "#fff" },
        label: { show: false },
        labelLine: { show: false },
        data: distribution.map((d, i) => ({
          name: STATUS_LABEL[d.status],
          value: d.count,
          itemStyle: { color: SERIES[i % SERIES.length] },
        })),
      },
    ],
  };
}

export function heatmapOption(
  data: DashboardData["responseHeatmap"],
): EChartsOption {
  const days = ["א'", "ב'", "ג'", "ד'", "ה'", "ו'", "שבת"];
  const hours = Array.from({ length: 16 }, (_, i) => `${i + 7}:00`);
  const max = Math.max(...data.map((d) => d.value));
  return {
    tooltip: {
      ...tooltipBase,
      formatter: (p) => {
        const [h, w, v] = (p as { data: number[] }).data;
        return `
          <div style="text-align:right;direction:rtl;display:flex;flex-direction:column;gap:2px">
            <span style="font-size:11px;color:#64748b">${days[w]} · ${hours[h]}</span>
            <span style="font-size:14px;font-weight:800;color:#0f172a">${v} דקות תגובה</span>
          </div>`;
      },
    },
    grid: { left: 40, right: 8, top: 8, bottom: 38, containLabel: true },
    xAxis: {
      type: "category",
      data: hours,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: CHART_PALETTE.axis, fontSize: 10 },
      splitArea: { show: false },
    },
    yAxis: {
      type: "category",
      data: days,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: CHART_PALETTE.axis, fontSize: 11 },
      splitArea: { show: false },
    },
    visualMap: {
      min: 0,
      max,
      orient: "horizontal",
      left: "center",
      bottom: 0,
      itemWidth: 12,
      itemHeight: 120,
      textStyle: { color: CHART_PALETTE.axis, fontSize: 10 },
      inRange: { color: ["#eff6ff", "#93c5fd", "#1d4ed8"] },
    },
    series: [
      {
        type: "heatmap",
        data: data.map((d) => [d.hour - 7, d.weekday, d.value]),
        itemStyle: { borderRadius: 4, borderWidth: 2, borderColor: "#fff" },
        emphasis: { itemStyle: { shadowBlur: 10, shadowColor: "rgba(0,0,0,0.15)" } },
      },
    ],
  };
}

export function funnelOption(funnel: DashboardData["funnel"]): EChartsOption {
  return {
    tooltip: {
      trigger: "item",
      ...tooltipBase,
      formatter: (p) => {
        const item = p as { name: string; value: number; percent: number };
        return `
          <div style="text-align:right;direction:rtl;display:flex;flex-direction:column;gap:2px">
            <span style="font-size:11px;color:#64748b">${item.name}</span>
            <span style="font-size:14px;font-weight:800;color:#0f172a">${item.value} · ${item.percent}%</span>
          </div>`;
      },
    },
    series: [
      {
        type: "funnel",
        left: 12,
        right: 12,
        top: 8,
        bottom: 8,
        sort: "descending",
        gap: 6,
        label: {
          position: "inside",
          color: "#fff",
          fontWeight: 800,
          fontSize: 12,
        },
        labelLine: { show: false },
        itemStyle: { borderColor: "#fff", borderWidth: 2 },
        emphasis: { label: { fontSize: 13 } },
        data: funnel.map((f, i) => ({
          name: f.stage,
          value: f.value,
          itemStyle: { color: SERIES[i % SERIES.length] },
        })),
      },
    ],
  };
}

export function branchBarOption(
  ranking: DashboardData["branchRanking"],
): EChartsOption {
  const sorted = [...ranking].sort((a, b) => a.score - b.score);
  return {
    grid: { left: 8, right: 36, top: 12, bottom: 12, containLabel: true },
    tooltip: {
      trigger: "axis",
      ...tooltipBase,
      formatter: (params) => {
        const p = Array.isArray(params) ? params[0] : params;
        const name = (p as { name: string }).name;
        const val = (p as { value: number }).value;
        return `
          <div style="text-align:right;direction:rtl;display:flex;flex-direction:column;gap:2px">
            <span style="font-size:11px;color:#64748b">${name}</span>
            <span style="font-size:14px;font-weight:800;color:#0f172a">ציון ${val}%</span>
          </div>`;
      },
    },
    xAxis: {
      type: "value",
      max: 100,
      axisLine: { show: false },
      axisTick: { show: false },
      splitLine: { lineStyle: { color: CHART_PALETTE.grid, type: "dashed" } },
      axisLabel: {
        color: CHART_PALETTE.axis,
        fontSize: 11,
        formatter: "{value}%",
      },
    },
    yAxis: {
      type: "category",
      data: sorted.map((b) => b.name),
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: "#334155", fontSize: 12, fontWeight: 600 },
    },
    series: [
      {
        type: "bar",
        barWidth: 18,
        itemStyle: {
          borderRadius: [0, 999, 999, 0],
          color: {
            type: "linear",
            x: 0,
            y: 0,
            x2: 1,
            y2: 0,
            colorStops: [
              { offset: 0, color: CHART_PALETTE.green },
              { offset: 1, color: CHART_PALETTE.blue },
            ],
          },
        },
        label: {
          show: true,
          position: "right",
          formatter: "{c}%",
          color: "#475569",
          fontSize: 11,
          fontWeight: 700,
        },
        data: sorted.map((b) => b.score),
      },
    ],
  };
}
