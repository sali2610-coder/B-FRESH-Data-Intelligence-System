"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Crown, ShieldAlert, ArrowLeft, Activity, Inbox } from "lucide-react";
import { cn } from "@/lib/utils";
import { SPRING_SMOOTH, enterUp } from "@/lib/motion";
import { getBranchStatus, getStatusLabel, getStatusTone, safeArray, safeNumber, safeText } from "@/lib/safe";
import type { BranchHealth } from "@/types/domain";

export function SpotlightCards({
  branches,
  networkScore,
  networkTrend,
}: {
  branches: BranchHealth[] | null | undefined;
  networkScore: number | null | undefined;
  networkTrend: number | null | undefined;
}) {
  const safeBranches = safeArray(branches).filter((b) => b && typeof b === "object");
  const sorted = [...safeBranches].sort(
    (a, b) => safeNumber(b.score) - safeNumber(a.score),
  );
  const top = sorted[0];
  const bottom = sorted.length > 1 ? sorted[sorted.length - 1] : undefined;
  const biggestRise = [...safeBranches].sort(
    (a, b) => safeNumber(b.movement) - safeNumber(a.movement),
  )[0];

  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
      <NetworkScoreCard
        score={safeNumber(networkScore)}
        trend={safeNumber(networkTrend)}
        index={0}
      />
      {top ? (
        <BranchSpotlight
          kind="top"
          branch={top}
          title="הסניף המוביל ברשת"
          icon={Crown}
          index={1}
        />
      ) : (
        <EmptySpotlight
          title="הסניף המוביל ברשת"
          icon={Crown}
          index={1}
        />
      )}
      {bottom ? (
        <BranchSpotlight
          kind="bottom"
          branch={bottom}
          title="דורש תשומת לב מיידית"
          icon={ShieldAlert}
          index={2}
          riser={biggestRise}
        />
      ) : (
        <EmptySpotlight
          title="דורש תשומת לב מיידית"
          icon={ShieldAlert}
          index={2}
        />
      )}
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
      ? "from-bfresh-fresh-green to-bfresh-light-blue"
      : score >= 70
        ? "from-bfresh-blue to-bfresh-light-blue"
        : score >= 60
          ? "from-tone-warm to-tone-sla"
          : score > 0
            ? "from-bfresh-coral to-bfresh-coral-deep"
            : "from-muted to-muted";

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
              {score || "—"}
            </span>
            <span className="text-muted-foreground text-sm font-bold">
              / 100
            </span>
          </div>
          {trend !== 0 && (
            <div
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-black tabular-nums",
                trend >= 0
                  ? "bg-bfresh-fresh-green/12 text-tone-success"
                  : "bg-bfresh-coral/12 text-bfresh-coral",
              )}
            >
              {trend >= 0 ? "▲" : "▼"} {Math.abs(trend)}% מהשבוע הקודם
            </div>
          )}
        </div>
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="from-bfresh-blue/15 to-transparent grid size-16 place-items-center rounded-2xl bg-gradient-to-br"
        >
          <Activity className="text-bfresh-blue size-6" />
        </motion.div>
      </div>
      <p className="text-muted-foreground relative mt-3 text-xs leading-relaxed">
        {score > 0
          ? "ממוצע משוקלל של כל הסניפים. כולל SLA, תלונות, ביקורות, אחזקה, איוש, סנטימנט וגיל פניות."
          : "אין נתוני סניפים זמינים עדיין. הוסף עמודת סניף ל-Monday board או חבר board סניפים."}
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
  const status = getBranchStatus(branch);
  const tone = getStatusTone(status);
  const branchId = safeText(branch?.branchId, "");
  const branchName = safeText(branch?.branchName);
  const manager = safeText(branch?.manager);
  const score = safeNumber(branch?.score);
  const trend = safeNumber(branch?.trend);

  return (
    <motion.div
      variants={enterUp(index)}
      initial="hidden"
      animate="visible"
      whileHover={{ y: -3 }}
      transition={SPRING_SMOOTH}
    >
      <Link
        href={branchId ? `/branches/${branchId}` : "#"}
        className={cn(
          "premium-card group relative block overflow-hidden p-5",
          kind === "top" ? "glow-success" : "glow-critical",
        )}
      >
        <span
          className={cn(
            "pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-l",
            kind === "top"
              ? "from-bfresh-fresh-green to-bfresh-light-blue"
              : "from-bfresh-coral to-bfresh-coral-deep",
          )}
        />
        <div className="relative flex items-start justify-between gap-3">
          <div className="space-y-1.5">
            <div className="text-muted-foreground text-[10.5px] font-bold uppercase tracking-wider">
              {title}
            </div>
            <div className="text-lg font-black tracking-tight">
              {branchName}
            </div>
            <div className="text-muted-foreground text-[11px] font-medium">
              מנהל · {manager}
            </div>
          </div>
          <div
            className={cn(
              "grid size-12 shrink-0 place-items-center rounded-2xl text-white shadow-md ring-1 ring-white/30",
              kind === "top"
                ? "bg-gradient-to-br from-bfresh-fresh-green to-bfresh-light-blue"
                : "bg-gradient-to-br from-bfresh-coral to-bfresh-coral-deep",
            )}
          >
            <Icon className="size-5" />
          </div>
        </div>

        <div className="relative mt-4 flex items-end justify-between">
          <div className="space-y-1">
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-black tabular-nums">{score || "—"}</span>
              {trend !== 0 && (
                <span
                  className={cn(
                    "inline-flex items-center gap-0.5 text-[11px] font-black tabular-nums",
                    trend >= 0 ? "text-tone-success" : "text-bfresh-coral",
                  )}
                >
                  {trend >= 0 ? "▲" : "▼"} {Math.abs(trend)}%
                </span>
              )}
            </div>
            <span
              className={cn(
                "inline-flex rounded-full border px-2 py-0.5 text-[10px] font-bold",
                tone.chip,
              )}
            >
              {getStatusLabel(status)}
            </span>
          </div>
          <span className="text-bfresh-blue inline-flex items-center gap-1 text-[11px] font-bold opacity-0 transition-opacity group-hover:opacity-100">
            פתח פרופיל
            <ArrowLeft className="size-3" />
          </span>
        </div>

        {kind === "bottom" && riser && safeNumber(riser.movement) > 0 && (
          <div className="bg-bfresh-fresh-green/8 text-tone-success relative mt-3 rounded-lg p-2 text-[11px] leading-snug">
            <span className="font-black">{safeText(riser.branchName)}</span> זינק{" "}
            <span className="font-black">+{safeNumber(riser.movement)}</span> מקומות
            בדירוג — ניתן להעתיק נהלים.
          </div>
        )}
      </Link>
    </motion.div>
  );
}

function EmptySpotlight({
  title,
  icon: Icon,
  index,
}: {
  title: string;
  icon: typeof Crown;
  index: number;
}) {
  return (
    <motion.div
      variants={enterUp(index)}
      initial="hidden"
      animate="visible"
      transition={SPRING_SMOOTH}
      className="premium-card relative overflow-hidden p-5"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1.5">
          <div className="text-muted-foreground text-[10.5px] font-bold uppercase tracking-wider">
            {title}
          </div>
          <div className="text-foreground text-base font-bold">
            אין נתוני סניפים זמינים
          </div>
          <p className="text-muted-foreground text-[11px] leading-relaxed">
            הוסף עמודת סניף ל-Monday board או הפעל board סניפים ייעודי כדי
            לראות דירוג ובריאות.
          </p>
        </div>
        <div className="bg-muted/60 text-muted-foreground grid size-12 shrink-0 place-items-center rounded-2xl">
          <Icon className="size-5 opacity-60" />
        </div>
      </div>
      <div className="text-muted-foreground/70 mt-4 inline-flex items-center gap-1 text-[11px] font-medium">
        <Inbox className="size-3" />
        ממתין לנתונים תפעוליים
      </div>
    </motion.div>
  );
}
