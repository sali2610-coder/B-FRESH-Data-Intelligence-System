"use client";

import { motion } from "framer-motion";
import NumberFlow from "@number-flow/react";
import type { LucideIcon } from "lucide-react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Sparkline } from "@/components/charts/Sparkline";
import { SPRING_BOUNCE, SPRING_SMOOTH, enterUp } from "@/lib/motion";

type Trend = { value: number; positive?: boolean } | null;

export type KpiAccent = "blue" | "green" | "amber" | "rose" | "violet" | "cyan";

export type KpiCardProps = {
  label: string;
  value: string | number;
  numericValue?: number;
  suffix?: string;
  decimals?: number;
  icon: LucideIcon;
  hint?: string;
  trend?: Trend;
  badge?: { label: string; tone?: "good" | "bad" | "neutral" };
  accent?: KpiAccent;
  sparkline?: number[];
  onClick?: () => void;
  loading?: boolean;
  index?: number;
};

const accent: Record<
  KpiAccent,
  {
    bar: string;
    iconBg: string;
    iconFg: string;
    spark: string;
    glowClass: string;
    softTint: string;
  }
> = {
  blue: {
    bar: "from-bfresh-blue to-bfresh-light-blue",
    iconBg: "bg-gradient-to-br from-bfresh-blue/15 to-bfresh-blue/5",
    iconFg: "text-bfresh-blue",
    spark: "oklch(0.55 0.18 235)",
    glowClass: "glow-blue",
    softTint: "from-bfresh-blue/[0.04] to-transparent",
  },
  green: {
    bar: "from-bfresh-fresh-green to-emerald-400",
    iconBg: "bg-gradient-to-br from-emerald-500/15 to-emerald-500/5",
    iconFg: "text-emerald-600",
    spark: "oklch(0.7 0.18 155)",
    glowClass: "glow-green",
    softTint: "from-emerald-500/[0.04] to-transparent",
  },
  amber: {
    bar: "from-amber-500 to-orange-400",
    iconBg: "bg-gradient-to-br from-amber-500/15 to-amber-500/5",
    iconFg: "text-amber-600",
    spark: "oklch(0.78 0.18 70)",
    glowClass: "glow-amber",
    softTint: "from-amber-500/[0.04] to-transparent",
  },
  rose: {
    bar: "from-rose-500 to-pink-400",
    iconBg: "bg-gradient-to-br from-rose-500/15 to-rose-500/5",
    iconFg: "text-rose-600",
    spark: "oklch(0.65 0.21 25)",
    glowClass: "glow-rose",
    softTint: "from-rose-500/[0.04] to-transparent",
  },
  violet: {
    bar: "from-violet-500 to-purple-400",
    iconBg: "bg-gradient-to-br from-violet-500/15 to-violet-500/5",
    iconFg: "text-violet-600",
    spark: "oklch(0.62 0.2 300)",
    glowClass: "glow-violet",
    softTint: "from-violet-500/[0.04] to-transparent",
  },
  cyan: {
    bar: "from-cyan-500 to-sky-400",
    iconBg: "bg-gradient-to-br from-cyan-500/15 to-cyan-500/5",
    iconFg: "text-cyan-600",
    spark: "oklch(0.7 0.16 220)",
    glowClass: "glow-cyan",
    softTint: "from-cyan-500/[0.04] to-transparent",
  },
};

export function KpiCard({
  label,
  value,
  numericValue,
  suffix,
  decimals = 0,
  icon: Icon,
  hint,
  trend,
  badge,
  accent: tone = "blue",
  sparkline,
  onClick,
  loading,
  index = 0,
}: KpiCardProps) {
  const a = accent[tone];
  const showNumeric = typeof numericValue === "number";

  return (
    <motion.div
      variants={enterUp(index)}
      initial="hidden"
      animate="visible"
      whileHover={{ y: -3 }}
      transition={SPRING_BOUNCE}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : -1}
      className={cn(
        "premium-card group relative overflow-hidden p-[var(--density-card-padding,1.25rem)] transition-shadow",
        a.glowClass,
        onClick && "cursor-pointer",
      )}
    >
      {/* Top brand bar */}
      <span
        className={cn(
          "pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-l",
          a.bar,
        )}
      />
      {/* Soft accent tint at corner */}
      <span
        className={cn(
          "pointer-events-none absolute inset-0 bg-gradient-to-bl opacity-70",
          a.softTint,
        )}
      />

      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-1.5">
          <div className="text-muted-foreground text-[10.5px] font-bold uppercase tracking-wider">
            {label}
          </div>
          {loading ? (
            <div className="shimmer h-9 w-28" />
          ) : (
            <div className="text-foreground flex items-baseline gap-1 text-[28px] font-black tracking-tight tabular-nums leading-none">
              {showNumeric ? (
                <>
                  <NumberFlow
                    value={numericValue!}
                    format={{ maximumFractionDigits: decimals }}
                    locales="he-IL"
                    spinTiming={{
                      duration: 750,
                      easing: "cubic-bezier(0.22,1,0.36,1)",
                    }}
                  />
                  {suffix && (
                    <span className="text-muted-foreground text-base font-bold">
                      {suffix}
                    </span>
                  )}
                </>
              ) : (
                <span className="truncate text-2xl">{value}</span>
              )}
            </div>
          )}
          {hint && !loading && (
            <div className="text-muted-foreground truncate text-[11px]">
              {hint}
            </div>
          )}
        </div>

        <motion.div
          whileHover={{ rotate: -6, scale: 1.08 }}
          transition={SPRING_BOUNCE}
          className={cn(
            "grid size-11 shrink-0 place-items-center rounded-2xl ring-1 ring-inset ring-white/40",
            a.iconBg,
            a.iconFg,
          )}
        >
          <Icon className="size-5" />
        </motion.div>
      </div>

      <div className="relative mt-3 flex items-end justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {trend && !loading && (
            <motion.span
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ ...SPRING_SMOOTH, delay: 0.15 }}
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-black tabular-nums",
                trend.positive
                  ? "bg-emerald-500/12 text-emerald-700 ring-1 ring-emerald-500/15"
                  : "bg-rose-500/12 text-rose-700 ring-1 ring-rose-500/15",
              )}
            >
              {trend.positive ? (
                <TrendingUp className="size-3" />
              ) : (
                <TrendingDown className="size-3" />
              )}
              {Math.abs(trend.value)}%
            </motion.span>
          )}
          {badge && !loading && (
            <span
              className={cn(
                "inline-flex rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-wide",
                badge.tone === "good"
                  ? "bg-emerald-500/12 text-emerald-700 ring-1 ring-emerald-500/15"
                  : badge.tone === "bad"
                    ? "bg-rose-500/12 text-rose-700 ring-1 ring-rose-500/15"
                    : "bg-muted text-muted-foreground",
              )}
            >
              {badge.label}
            </span>
          )}
        </div>

        {sparkline && !loading && (
          <div
            className="w-24 opacity-95 transition-transform group-hover:scale-110 group-hover:opacity-100"
            style={{ color: a.spark }}
          >
            <Sparkline data={sparkline} color={a.spark} height={34} showPeak />
          </div>
        )}
      </div>
    </motion.div>
  );
}
