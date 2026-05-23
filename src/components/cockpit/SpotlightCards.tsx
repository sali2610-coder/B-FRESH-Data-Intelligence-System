"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Crown, ShieldAlert, ArrowLeft, Activity } from "lucide-react";
import { cn } from "@/lib/utils";
import { SPRING_SMOOTH, enterUp } from "@/lib/motion";
import { STATUS_LABEL, STATUS_TONE } from "@/lib/health";
import type { BranchHealth } from "@/types/domain";

export function SpotlightCards({
  branches,
  networkScore,
  networkTrend,
}: {
  branches: BranchHealth[];
  networkScore: number;
  networkTrend: number;
}) {
  const sorted = [...branches].sort((a, b) => b.score - a.score);
  const top = sorted[0];
  const bottom = sorted[sorted.length - 1];
  const biggestRise = [...branches].sort((a, b) => b.movement - a.movement)[0];

  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
      <NetworkScoreCard score={networkScore} trend={networkTrend} index={0} />
      <BranchSpotlight
        kind="top"
        branch={top}
        title="הסניף המוביל ברשת"
        icon={Crown}
        index={1}
      />
      <BranchSpotlight
        kind="bottom"
        branch={bottom}
        title="דורש תשומת לב מיידית"
        icon={ShieldAlert}
        index={2}
        riser={biggestRise}
      />
    </div>
  );
}

function NetworkScoreCard({
  score,
  trend,
  index,
}: {
  score: number;
  trend: number;
  index: number;
}) {
  const tone =
    score >= 85
      ? "from-emerald-500 to-bfresh-fresh-green"
      : score >= 70
        ? "from-bfresh-blue to-sky-500"
        : score >= 60
          ? "from-amber-500 to-orange-500"
          : "from-rose-500 to-rose-600";

  return (
    <motion.div
      variants={enterUp(index)}
      initial="hidden"
      animate="visible"
      whileHover={{ y: -3 }}
      transition={SPRING_SMOOTH}
      className="premium-card relative overflow-hidden p-5"
    >
      <span
        className={cn(
          "pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-l",
          tone,
        )}
      />
      <div className="relative flex items-start justify-between">
        <div className="space-y-1">
          <div className="text-muted-foreground text-[10.5px] font-bold uppercase tracking-wider">
            ציון בריאות הרשת
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-black leading-none tabular-nums">
              {score}
            </span>
            <span className="text-muted-foreground text-sm font-bold">
              / 100
            </span>
          </div>
          <div
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-black tabular-nums",
              trend >= 0
                ? "bg-emerald-500/12 text-emerald-700"
                : "bg-rose-500/12 text-rose-700",
            )}
          >
            {trend >= 0 ? "▲" : "▼"} {Math.abs(trend)}% מהשבוע הקודם
          </div>
        </div>
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className={cn(
            "from-bfresh-blue/15 to-transparent grid size-16 place-items-center rounded-2xl bg-gradient-to-br",
          )}
        >
          <Activity className="text-bfresh-blue size-6" />
        </motion.div>
      </div>
      <p className="text-muted-foreground relative mt-3 text-xs leading-relaxed">
        ממוצע משוקלל של כל הסניפים. כולל SLA, תלונות, ביקורות, אחזקה, איוש,
        סנטימנט וגיל פניות.
      </p>
    </motion.div>
  );
}

function BranchSpotlight({
  kind,
  branch,
  title,
  icon: Icon,
  index,
  riser,
}: {
  kind: "top" | "bottom";
  branch: BranchHealth;
  title: string;
  icon: typeof Crown;
  index: number;
  riser?: BranchHealth;
}) {
  const tone = STATUS_TONE[branch.status];

  return (
    <motion.div
      variants={enterUp(index)}
      initial="hidden"
      animate="visible"
      whileHover={{ y: -3 }}
      transition={SPRING_SMOOTH}
    >
      <Link
        href={`/branches/${branch.branchId}`}
        className={cn(
          "premium-card group relative block overflow-hidden p-5",
          kind === "top" ? "glow-green" : "glow-rose",
        )}
      >
        <span
          className={cn(
            "pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-l",
            kind === "top"
              ? "from-emerald-500 to-bfresh-fresh-green"
              : "from-rose-500 to-rose-600",
          )}
        />
        <div className="relative flex items-start justify-between gap-3">
          <div className="space-y-1.5">
            <div className="text-muted-foreground text-[10.5px] font-bold uppercase tracking-wider">
              {title}
            </div>
            <div className="text-lg font-black tracking-tight">
              {branch.branchName}
            </div>
            <div className="text-muted-foreground text-[11px] font-medium">
              מנהל · {branch.manager}
            </div>
          </div>
          <div
            className={cn(
              "grid size-12 shrink-0 place-items-center rounded-2xl text-white shadow-md ring-1 ring-white/30",
              kind === "top"
                ? "bg-gradient-to-br from-emerald-500 to-bfresh-fresh-green"
                : "bg-gradient-to-br from-rose-500 to-rose-600",
            )}
          >
            <Icon className="size-5" />
          </div>
        </div>

        <div className="relative mt-4 flex items-end justify-between">
          <div className="space-y-1">
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-black tabular-nums">
                {branch.score}
              </span>
              <span
                className={cn(
                  "inline-flex items-center gap-0.5 text-[11px] font-black tabular-nums",
                  branch.trend >= 0 ? "text-emerald-700" : "text-rose-700",
                )}
              >
                {branch.trend >= 0 ? "▲" : "▼"} {Math.abs(branch.trend)}%
              </span>
            </div>
            <span
              className={cn(
                "inline-flex rounded-full border px-2 py-0.5 text-[10px] font-bold",
                tone.chip,
              )}
            >
              {STATUS_LABEL[branch.status]}
            </span>
          </div>
          <span className="text-bfresh-blue inline-flex items-center gap-1 text-[11px] font-bold opacity-0 transition-opacity group-hover:opacity-100">
            פתח פרופיל
            <ArrowLeft className="size-3" />
          </span>
        </div>

        {kind === "bottom" && riser && riser.movement > 0 && (
          <div className="relative mt-3 rounded-lg bg-emerald-500/8 p-2 text-[11px] leading-snug text-emerald-800">
            <span className="font-black">{riser.branchName}</span> זינק{" "}
            <span className="font-black">+{riser.movement}</span> מקומות בדירוג —
            ניתן להעתיק נהלים.
          </div>
        )}
      </Link>
    </motion.div>
  );
}
