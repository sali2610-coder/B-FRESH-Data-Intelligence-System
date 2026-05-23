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

// Brand emotional tones — every accent ties to the B-FRESH palette.
// blue = Network · green = Success · amber = Warm · rose = Critical/Watermelon · violet = AI · cyan = Sky
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
    iconBg: "bg-gradient-to-br from-bfresh-blue/15 to-bfresh-sky/30",
    iconFg: "text-bfresh-blue",
    spark: "#12a9e8",
    glowClass: "glow-network",
    softTint: "from-bfresh-light-blue/[0.10] to-transparent",
  },
  green: {
    bar: "from-bfresh-fresh-green to-bfresh-light-blue",
    iconBg: "bg-gradient-to-br from-bfresh-fresh-green/15 to-bfresh-fresh-green/5",
    iconFg: "text-tone-success",
    spark: "#3ed598",
    glowClass: "glow-success",
    softTint: "from-bfresh-fresh-green/[0.06] to-transparent",
  },
  amber: {
    bar: "from-tone-warm to-tone-sla",
    iconBg: "bg-gradient-to-br from-tone-warm/15 to-tone-warm/5",
    iconFg: "text-tone-warm",
    spark: "#ffb454",
    glowClass: "glow-amber",
    softTint: "from-tone-warm/[0.06] to-transparent",
  },
  rose: {
    bar: "from-bfresh-coral to-bfresh-coral-deep",
    iconBg: "bg-gradient-to-br from-bfresh-coral/15 to-bfresh-coral/5",
    iconFg: "text-bfresh-coral",
    spark: "#ff7a6b",
    glowClass: "glow-critical",
    softTint: "from-bfresh-coral/[0.08] to-transparent",
  },
  violet: {
    bar: "from-tone-ai to-bfresh-light-blue",
    iconBg: "bg-gradient-to-br from-tone-ai/15 to-tone-ai/5",
    iconFg: "text-tone-ai",
    spark: "#7c6cff",
    glowClass: "glow-ai",
    softTint: "from-tone-ai/[0.06] to-transparent",
  },
  cyan: {
    bar: "from-bfresh-light-blue to-bfresh-blue",
    iconBg: "bg-gradient-to-br from-bfresh-light-blue/20 to-bfresh-sky/30",
    iconFg: "text-bfresh-blue",
    spark: "#6fd3ff",
    glowClass: "glow-cyan",
    softTint: "from-bfresh-sky/[0.16] to-transparent",
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
                  ? "bg-bfresh-fresh-green/12 text-tone-success ring-1 ring-bfresh-fresh-green/15"
                  : "bg-bfresh-coral/12 text-bfresh-coral ring-1 ring-bfresh-coral/15",
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
                  ? "bg-bfresh-fresh-green/12 text-tone-success ring-1 ring-bfresh-fresh-green/15"
                  : badge.tone === "bad"
                    ? "bg-bfresh-coral/12 text-bfresh-coral ring-1 ring-bfresh-coral/15"
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
