import type { BranchStatus } from "@/types/domain";

export const HEALTH_WEIGHTS = {
  sla: 0.3,
  complaints: 0.18,
  inspection: 0.14,
  maintenance: 0.14,
  staffing: 0.1,
  sentiment: 0.08,
  aging: 0.06,
} as const;

export function computeHealthScore(parts: {
  sla: number;
  complaints: number;
  inspection: number;
  maintenance: number;
  staffing: number;
  sentiment: number;
  aging: number;
}): number {
  const sum =
    parts.sla * HEALTH_WEIGHTS.sla +
    parts.complaints * HEALTH_WEIGHTS.complaints +
    parts.inspection * HEALTH_WEIGHTS.inspection +
    parts.maintenance * HEALTH_WEIGHTS.maintenance +
    parts.staffing * HEALTH_WEIGHTS.staffing +
    parts.sentiment * HEALTH_WEIGHTS.sentiment +
    parts.aging * HEALTH_WEIGHTS.aging;
  return Math.round(sum);
}

export function statusFromScore(score: number): BranchStatus {
  if (score >= 88) return "excellent";
  if (score >= 75) return "stable";
  if (score >= 60) return "attention";
  return "critical";
}

export const STATUS_LABEL: Record<BranchStatus, string> = {
  excellent: "מצוין",
  stable: "יציב",
  attention: "דורש תשומת לב",
  critical: "קריטי",
};

export const STATUS_TONE: Record<
  BranchStatus,
  { fg: string; bg: string; border: string; chip: string; dot: string }
> = {
  excellent: {
    fg: "text-emerald-700",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/30",
    chip: "bg-emerald-500/15 text-emerald-700 border-emerald-500/30",
    dot: "bg-emerald-500",
  },
  stable: {
    fg: "text-bfresh-blue",
    bg: "bg-bfresh-blue/10",
    border: "border-bfresh-blue/30",
    chip: "bg-bfresh-blue/12 text-bfresh-blue border-bfresh-blue/30",
    dot: "bg-bfresh-blue",
  },
  attention: {
    fg: "text-amber-700",
    bg: "bg-amber-500/10",
    border: "border-amber-500/30",
    chip: "bg-amber-500/15 text-amber-700 border-amber-500/30",
    dot: "bg-amber-500",
  },
  critical: {
    fg: "text-rose-700",
    bg: "bg-rose-500/10",
    border: "border-rose-500/30",
    chip: "bg-rose-500/15 text-rose-700 border-rose-500/30",
    dot: "bg-rose-500",
  },
};

export function scoreColor(score: number): string {
  if (score >= 88) return "#16a34a"; // emerald
  if (score >= 75) return "#1e90ff"; // blue
  if (score >= 60) return "#f59e0b"; // amber
  return "#ef4444"; // rose
}

export const STATUS_RANK: Record<BranchStatus, number> = {
  critical: 0,
  attention: 1,
  stable: 2,
  excellent: 3,
};
