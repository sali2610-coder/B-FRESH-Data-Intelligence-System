"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

type Trend = { value: number; positive?: boolean } | null;

export type KpiCardProps = {
  label: string;
  value: string | number;
  icon: LucideIcon;
  hint?: string;
  trend?: Trend;
  accent?: "blue" | "green" | "amber" | "rose" | "violet" | "cyan";
  onClick?: () => void;
  loading?: boolean;
  index?: number;
};

const accentMap: Record<NonNullable<KpiCardProps["accent"]>, string> = {
  blue: "from-bfresh-blue/15 to-transparent text-bfresh-blue",
  green: "from-bfresh-fresh-green/15 to-transparent text-bfresh-fresh-green",
  amber: "from-amber-500/15 to-transparent text-amber-600",
  rose: "from-rose-500/15 to-transparent text-rose-600",
  violet: "from-violet-500/15 to-transparent text-violet-600",
  cyan: "from-cyan-500/15 to-transparent text-cyan-600",
};

export function KpiCard({
  label,
  value,
  icon: Icon,
  hint,
  trend,
  accent = "blue",
  onClick,
  loading,
  index = 0,
}: KpiCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.35, ease: "easeOut" }}
      whileHover={{ y: -2 }}
    >
      <Card
        onClick={onClick}
        role={onClick ? "button" : undefined}
        tabIndex={onClick ? 0 : -1}
        className={cn(
          "group relative gap-3 overflow-hidden p-5 transition-shadow",
          "bg-gradient-to-bl shadow-sm hover:shadow-md",
          accentMap[accent],
          onClick && "cursor-pointer",
        )}
      >
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="text-muted-foreground text-xs font-medium">
              {label}
            </div>
            {loading ? (
              <Skeleton className="h-9 w-24" />
            ) : (
              <div className="text-foreground text-3xl font-extrabold tracking-tight tabular-nums">
                {value}
              </div>
            )}
            {hint && !loading && (
              <div className="text-muted-foreground text-[11px]">{hint}</div>
            )}
          </div>
          <div className="bg-background/60 grid size-10 place-items-center rounded-xl shadow-sm">
            <Icon className="size-5" />
          </div>
        </div>
        {trend && !loading && (
          <div
            className={cn(
              "inline-flex items-center gap-1 self-start rounded-full px-2 py-0.5 text-[11px] font-medium",
              trend.positive
                ? "bg-bfresh-fresh-green/15 text-bfresh-fresh-green"
                : "bg-rose-500/15 text-rose-600",
            )}
          >
            {trend.positive ? "▲" : "▼"} {Math.abs(trend.value)}%
          </div>
        )}
      </Card>
    </motion.div>
  );
}
