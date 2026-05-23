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

// B-FRESH brand status tones — coral/aqua/green/coral progression
export const STATUS_TONE: Record<
  BranchStatus,
  { fg: string; bg: string; border: string; chip: string; dot: string }
> = {
  excellent: {
    fg: "text-tone-success",
    bg: "bg-bfresh-fresh-green/10",
    border: "border-bfresh-fresh-green/30",
    chip:
      "bg-bfresh-fresh-green/12 text-tone-success border-bfresh-fresh-green/30",
    dot: "bg-bfresh-fresh-green",
  },
  stable: {
    fg: "text-bfresh-blue",
    bg: "bg-bfresh-blue/10",
    border: "border-bfresh-blue/30",
    chip: "bg-bfresh-blue/12 text-bfresh-blue border-bfresh-blue/30",
    dot: "bg-bfresh-blue",
  },
  attention: {
    fg: "text-tone-warm",
    bg: "bg-tone-warm/10",
    border: "border-tone-warm/30",
    chip: "bg-tone-warm/15 text-tone-warm border-tone-warm/30",
    dot: "bg-tone-warm",
  },
  critical: {
    fg: "text-bfresh-coral",
    bg: "bg-bfresh-coral/10",
    border: "border-bfresh-coral/30",
    chip: "bg-bfresh-coral/15 text-bfresh-coral border-bfresh-coral/30",
    dot: "bg-bfresh-coral",
  },
};

export function scoreColor(score: number): string {
  if (score >= 88) return "#3ed598"; // bfresh-fresh-green
  if (score >= 75) return "#12a9e8"; // bfresh-blue
  if (score >= 60) return "#ffb454"; // tone-warm
  return "#ff7a6b"; // bfresh-coral
}

export const STATUS_RANK: Record<BranchStatus, number> = {
  critical: 0,
  attention: 1,
  stable: 2,
  excellent: 3,
};
