"use client";

import { motion } from "framer-motion";
import NumberFlow from "@number-flow/react";
import type { LucideIcon } from "lucide-react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Sparkline } from "@/components/charts/Sparkline";

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
  { ring: string; bar: string; iconBg: string; iconFg: string; spark: string }
> = {
  blue: {
    ring: "ring-bfresh-blue/15",
    bar: "from-bfresh-blue to-bfresh-light-blue",
    iconBg: "bg-bfresh-blue/10",
    iconFg: "text-bfresh-blue",
    spark: "oklch(0.55 0.18 235)",
  },
  green: {
    ring: "ring-emerald-500/15",
    bar: "from-bfresh-fresh-green to-emerald-400",
    iconBg: "bg-emerald-500/10",
    iconFg: "text-emerald-600",
    spark: "oklch(0.7 0.18 155)",
  },
  amber: {
    ring: "ring-amber-500/15",
    bar: "from-amber-500 to-orange-400",
    iconBg: "bg-amber-500/10",
    iconFg: "text-amber-600",
    spark: "oklch(0.78 0.18 70)",
  },
  rose: {
    ring: "ring-rose-500/15",
    bar: "from-rose-500 to-pink-400",
    iconBg: "bg-rose-500/10",
    iconFg: "text-rose-600",
    spark: "oklch(0.65 0.21 25)",
  },
  violet: {
    ring: "ring-violet-500/15",
    bar: "from-violet-500 to-purple-400",
    iconBg: "bg-violet-500/10",
    iconFg: "text-violet-600",
    spark: "oklch(0.62 0.2 300)",
  },
  cyan: {
    ring: "ring-cyan-500/15",
    bar: "from-cyan-500 to-sky-400",
    iconBg: "bg-cyan-500/10",
    iconFg: "text-cyan-600",
    spark: "oklch(0.7 0.16 220)",
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
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.35, ease: "easeOut" }}
    >
      <Card
        onClick={onClick}
        role={onClick ? "button" : undefined}
        tabIndex={onClick ? 0 : -1}
        className={cn(
          "lift group elev-1 relative gap-3 overflow-hidden p-5 ring-1",
          a.ring,
          onClick && "cursor-pointer",
        )}
      >
        {/* top brand bar */}
        <span
          className={cn(
            "pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-l",
            a.bar,
          )}
        />

        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 space-y-1.5">
            <div className="text-muted-foreground text-[11px] font-semibold uppercase tracking-wide">
              {label}
            </div>
            {loading ? (
              <Skeleton className="h-9 w-28" />
            ) : (
              <div className="text-foreground flex items-baseline gap-1 text-3xl font-black tracking-tight tabular-nums">
                {showNumeric ? (
                  <>
                    <NumberFlow
                      value={numericValue!}
                      format={{ maximumFractionDigits: decimals }}
                      locales="he-IL"
                    />
                    {suffix && (
                      <span className="text-muted-foreground text-base font-bold">
                        {suffix}
                      </span>
                    )}
                  </>
                ) : (
                  <span className="truncate">{value}</span>
                )}
              </div>
            )}
            {hint && !loading && (
              <div className="text-muted-foreground truncate text-[11px]">
                {hint}
              </div>
            )}
          </div>

          <div
            className={cn(
              "grid size-11 shrink-0 place-items-center rounded-2xl transition-transform group-hover:scale-105",
              a.iconBg,
              a.iconFg,
            )}
          >
            <Icon className="size-5" />
          </div>
        </div>

        <div className="flex items-end justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5">
            {trend && !loading && (
              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold",
                  trend.positive
                    ? "bg-emerald-500/12 text-emerald-700"
                    : "bg-rose-500/12 text-rose-700",
                )}
              >
                {trend.positive ? (
                  <TrendingUp className="size-3" />
                ) : (
                  <TrendingDown className="size-3" />
                )}
                {Math.abs(trend.value)}%
              </span>
            )}
            {badge && !loading && (
              <span
                className={cn(
                  "inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide",
                  badge.tone === "good"
                    ? "bg-emerald-500/12 text-emerald-700"
                    : badge.tone === "bad"
                      ? "bg-rose-500/12 text-rose-700"
                      : "bg-muted text-muted-foreground",
                )}
              >
                {badge.label}
              </span>
            )}
          </div>

          {sparkline && !loading && (
            <div className="w-24 opacity-90" style={{ color: a.spark }}>
              <Sparkline data={sparkline} color={a.spark} height={32} />
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
}
