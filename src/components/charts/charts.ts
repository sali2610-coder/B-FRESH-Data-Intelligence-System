import type { EChartsOption } from "echarts";
import type {
  DashboardData,
  TaskStatus,
  TimeSeriesPoint,
} from "@/types/domain";

const PALETTE = ["#1e90ff", "#16a34a", "#f59e0b", "#a855f7", "#06b6d4", "#ef4444"];

const STATUS_LABEL: Record<TaskStatus, string> = {
  open: "פתוח",
  in_progress: "בטיפול",
  blocked: "חסום",
  done: "הושלם",
};

const baseGrid = { left: 8, right: 16, top: 24, bottom: 28, containLabel: true };

const heDate = (iso: string) => {
  const d = new Date(iso);
  return `${d.getDate()}/${d.getMonth() + 1}`;
};

export function lineOption(series: TimeSeriesPoint[]): EChartsOption {
  return {
    grid: baseGrid,
    tooltip: { trigger: "axis" },
    xAxis: {
      type: "category",
      data: series.map((p) => heDate(p.date)),
      axisLine: { lineStyle: { color: "#e5e7eb" } },
      axisLabel: { color: "#6b7280", fontSize: 11 },
    },
    yAxis: {
      type: "value",
      splitLine: { lineStyle: { color: "#f1f5f9" } },
      axisLabel: { color: "#6b7280", fontSize: 11 },
    },
    series: [
      {
        type: "line",
        smooth: true,
        symbol: "circle",
        symbolSize: 6,
        lineStyle: { width: 3, color: PALETTE[0] },
        itemStyle: { color: PALETTE[0] },
        data: series.map((p) => p.value),
      },
    ],
  };
}

export function areaOption(series: TimeSeriesPoint[]): EChartsOption {
  return {
    grid: baseGrid,
    tooltip: { trigger: "axis", valueFormatter: (v) => `${v}%` },
    xAxis: {
      type: "category",
      data: series.map((p) => heDate(p.date)),
      axisLine: { lineStyle: { color: "#e5e7eb" } },
      axisLabel: { color: "#6b7280", fontSize: 11 },
    },
    yAxis: {
      type: "value",
      min: 50,
      max: 100,
      splitLine: { lineStyle: { color: "#f1f5f9" } },
      axisLabel: { color: "#6b7280", fontSize: 11, formatter: "{value}%" },
    },
    series: [
      {
        type: "line",
        smooth: true,
        symbol: "none",
        lineStyle: { width: 2, color: PALETTE[1] },
        areaStyle: {
          color: {
            type: "linear",
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: "rgba(22,163,74,0.35)" },
              { offset: 1, color: "rgba(22,163,74,0)" },
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
    tooltip: { trigger: "item" },
    legend: {
      bottom: 0,
      icon: "circle",
      textStyle: { fontSize: 11, color: "#6b7280" },
    },
    series: [
      {
        type: "pie",
        radius: ["55%", "78%"],
        avoidLabelOverlap: true,
        label: { show: false },
        labelLine: { show: false },
        data: distribution.map((d, i) => ({
          name: STATUS_LABEL[d.status],
          value: d.count,
          itemStyle: { color: PALETTE[i % PALETTE.length] },
        })),
      },
    ],
  };
}

export function heatmapOption(
  data: DashboardData["responseHeatmap"],
): EChartsOption {
  const days = ["א'", "ב'", "ג'", "ד'", "ה'", "ו'", "ש'"];
  const hours = Array.from({ length: 16 }, (_, i) => `${i + 7}:00`);
  const max = Math.max(...data.map((d) => d.value));
  return {
    tooltip: {
      formatter: (p) => {
        const [h, w, v] = (p as { data: number[] }).data;
        return `${days[w]} · ${hours[h]} · ${v} ד'`;
      },
    },
    grid: { left: 40, right: 16, top: 10, bottom: 40, containLabel: true },
    xAxis: {
      type: "category",
      data: hours,
      axisLabel: { color: "#6b7280", fontSize: 10 },
      splitArea: { show: true },
    },
    yAxis: {
      type: "category",
      data: days,
      axisLabel: { color: "#6b7280", fontSize: 11 },
      splitArea: { show: true },
    },
    visualMap: {
      min: 0,
      max,
      orient: "horizontal",
      left: "center",
      bottom: 0,
      itemWidth: 10,
      itemHeight: 100,
      textStyle: { color: "#6b7280", fontSize: 10 },
      inRange: { color: ["#dbeafe", "#60a5fa", "#1d4ed8"] },
    },
    series: [
      {
        type: "heatmap",
        data: data.map((d) => [d.hour - 7, d.weekday, d.value]),
        emphasis: { itemStyle: { shadowBlur: 8 } },
      },
    ],
  };
}

export function funnelOption(funnel: DashboardData["funnel"]): EChartsOption {
  return {
    tooltip: { trigger: "item" },
    series: [
      {
        type: "funnel",
        left: 10,
        right: 10,
        top: 10,
        bottom: 10,
        sort: "descending",
        gap: 4,
        label: { position: "inside", color: "#fff", fontWeight: 700 },
        labelLine: { show: false },
        data: funnel.map((f, i) => ({
          name: f.stage,
          value: f.value,
          itemStyle: { color: PALETTE[i % PALETTE.length] },
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
    grid: { left: 8, right: 32, top: 16, bottom: 16, containLabel: true },
    tooltip: { trigger: "axis", valueFormatter: (v) => `${v}%` },
    xAxis: {
      type: "value",
      max: 100,
      splitLine: { lineStyle: { color: "#f1f5f9" } },
      axisLabel: { color: "#6b7280", fontSize: 11, formatter: "{value}%" },
    },
    yAxis: {
      type: "category",
      data: sorted.map((b) => b.name),
      axisLabel: { color: "#374151", fontSize: 12 },
    },
    series: [
      {
        type: "bar",
        barWidth: 16,
        itemStyle: {
          borderRadius: [0, 8, 8, 0],
          color: {
            type: "linear",
            x: 0,
            y: 0,
            x2: 1,
            y2: 0,
            colorStops: [
              { offset: 0, color: "#22c55e" },
              { offset: 1, color: "#1e90ff" },
            ],
          },
        },
        label: {
          show: true,
          position: "right",
          formatter: "{c}%",
          color: "#374151",
          fontSize: 11,
        },
        data: sorted.map((b) => b.score),
      },
    ],
  };
}
