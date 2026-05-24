"use client";

import { motion } from "framer-motion";
import NumberFlow from "@number-flow/react";
import {
  AlertOctagon,
  CheckCircle2,
  Clock,
  Inbox,
  MessageSquare,
  TrendingDown,
  TrendingUp,
  Users,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkline } from "@/components/charts/Sparkline";
import { SPRING_SMOOTH, enterUp } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { fmtNumber } from "@/lib/format";
import type { ComplaintMetricsView } from "@/types/domain";

/**
 * Surfaces the rich complaint metrics computed server-side
 * (computeComplaintMetrics) — visible whenever the dashboard receives
 * complaintMetrics. Becomes the primary operational pulse in
 * complaint-board-only live mode.
 */
export function ComplaintPulse({
  metrics,
  employees,
  onOwnerClick,
}: {
  metrics: ComplaintMetricsView | undefined | null;
  employees?: { id: string; name: string; avatarColor?: string }[];
  onOwnerClick?: (ownerId: string) => void;
}) {
  if (!metrics || metrics.total === 0) {
    return (
      <Card className="premium-card p-6">
        <div className="text-muted-foreground flex flex-col items-center gap-2 py-6 text-center">
          <Inbox className="text-bfresh-blue size-8 opacity-50" />
          <div className="text-foreground text-sm font-bold">
            אין תלונות זמינות עדיין
          </div>
          <p className="max-w-md text-xs leading-relaxed">
            ברגע שתלונות חדשות יזרמו מ-Monday — הנתונים יופיעו כאן באופן
            אוטומטי.
          </p>
        </div>
      </Card>
    );
  }

  const sparkline = metrics.trend30d.map((p) => p.count);
  const trendLast7 = metrics.trend30d.slice(-7).reduce((s, p) => s + p.count, 0);
  const trendPrev7 = metrics.trend30d.slice(-14, -7).reduce((s, p) => s + p.count, 0);
  const weekDelta = trendPrev7
    ? Math.round(((trendLast7 - trendPrev7) / trendPrev7) * 100)
    : 0;

  const empMap = new Map(
    (employees ?? []).map((e) => [e.id, e]),
  );

  const topOwners = metrics.byOwner
    .filter((o) => o.owner !== "unassigned")
    .slice(0, 5);

  const secondaryStatusActive = metrics.bySecondaryStatus.filter(
    (s) => s.status !== "—",
  );

  return (
    <Card className="premium-card overflow-hidden border-0 bg-transparent shadow-none">
      <CardHeader className="border-border/50 flex-row items-center justify-between border-b pb-4">
        <div className="flex items-center gap-3">
          <div className="from-bfresh-blue to-bfresh-light-blue grid size-10 place-items-center rounded-2xl bg-gradient-to-br text-white shadow-md shadow-bfresh-blue/30 ring-1 ring-white/30">
            <MessageSquare className="size-4" />
          </div>
          <div>
            <CardTitle className="text-base font-bold tracking-tight">
              דופק תלונות חי
            </CardTitle>
            <p className="text-muted-foreground text-xs">
              נתונים אמיתיים מבורד Monday · {fmtNumber(metrics.total)} תלונות
              סה״כ
            </p>
          </div>
        </div>
        <Badge
          variant="outline"
          className={cn(
            "rounded-full gap-1.5 text-[10px] font-bold",
            weekDelta > 0
              ? "border-bfresh-coral/30 bg-bfresh-coral/8 text-bfresh-coral"
              : "border-bfresh-fresh-green/30 bg-bfresh-fresh-green/8 text-tone-success",
          )}
        >
          {weekDelta > 0 ? (
            <TrendingUp className="size-3" />
          ) : (
            <TrendingDown className="size-3" />
          )}
          {weekDelta > 0 ? "+" : ""}
          {weekDelta}% מהשבוע הקודם
        </Badge>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* KPI row */}
        <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
          <PulseStat
            label="פתוחות"
            value={metrics.open}
            icon={MessageSquare}
            tone="blue"
            index={0}
          />
          <PulseStat
            label="בטיפול"
            value={metrics.inProgress}
            icon={Clock}
            tone="amber"
            index={1}
          />
          <PulseStat
            label="חריגות SLA"
            value={metrics.overdue}
            icon={AlertOctagon}
            tone="coral"
            index={2}
          />
          <PulseStat
            label="בסיכון SLA"
            value={metrics.slaRisk}
            icon={Clock}
            tone="warm"
            index={3}
          />
          <PulseStat
            label="הושלמו"
            value={metrics.closed}
            icon={CheckCircle2}
            tone="green"
            index={4}
          />
        </div>

        {/* Trend + Owners */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
          {/* Trend 30d */}
          <motion.div
            variants={enterUp(5)}
            initial="hidden"
            animate="visible"
            transition={SPRING_SMOOTH}
            className="premium-card lg:col-span-3 overflow-hidden p-4"
          >
            <div className="text-muted-foreground mb-2 text-[10.5px] font-bold uppercase tracking-wider">
              מגמת 30 ימים · תלונות יומיות
            </div>
            <div className="text-bfresh-blue flex items-baseline gap-2">
              <span className="text-3xl font-black tabular-nums">
                <NumberFlow value={trendLast7} locales="he-IL" />
              </span>
              <span className="text-muted-foreground text-xs font-bold">
                7 ימים אחרונים
              </span>
            </div>
            <div className="text-bfresh-blue mt-2 w-full">
              <Sparkline
                data={sparkline}
                color="oklch(0.66 0.143 234)"
                height={60}
                showPeak
              />
            </div>
          </motion.div>

          {/* Top owners */}
          <motion.div
            variants={enterUp(6)}
            initial="hidden"
            animate="visible"
            transition={SPRING_SMOOTH}
            className="premium-card lg:col-span-2 overflow-hidden p-4"
          >
            <div className="text-muted-foreground mb-3 inline-flex items-center gap-1.5 text-[10.5px] font-bold uppercase tracking-wider">
              <Users className="size-3" />
              עומס לפי אחראי
            </div>
            {topOwners.length === 0 ? (
              <div className="text-muted-foreground py-4 text-center text-xs">
                אין אחראים משויכים
              </div>
            ) : (
              <ul className="flex flex-col gap-2">
                {topOwners.map((o, i) => {
                  const emp = empMap.get(o.owner);
                  const name = emp?.name ?? o.owner.replace(/^e-/, "");
                  const color = emp?.avatarColor ?? "#12a9e8";
                  const maxTotal = topOwners[0].total;
                  return (
                    <li
                      key={o.owner}
                      onClick={() => onOwnerClick?.(o.owner)}
                      className={cn(
                        "flex items-center gap-2.5 rounded-lg p-1 -mx-1 transition-colors",
                        onOwnerClick &&
                          "hover:bg-bfresh-blue/[0.06] cursor-pointer",
                      )}
                    >
                      <span
                        className="grid size-7 shrink-0 place-items-center rounded-full text-[11px] font-black text-white ring-2 ring-white shadow-sm"
                        style={{ backgroundColor: color }}
                      >
                        {String(i + 1)}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-baseline justify-between gap-2">
                          <span className="truncate text-[12.5px] font-bold">
                            {name}
                          </span>
                          <span className="text-foreground text-xs font-black tabular-nums">
                            {fmtNumber(o.total)}
                          </span>
                        </div>
                        <div className="bg-muted relative mt-1 h-1.5 overflow-hidden rounded-full">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{
                              width: `${(o.total / maxTotal) * 100}%`,
                            }}
                            transition={{ duration: 0.7, delay: i * 0.05 }}
                            className="from-bfresh-blue to-bfresh-fresh-green absolute inset-y-0 start-0 rounded-full bg-gradient-to-l"
                          />
                        </div>
                        <div className="text-muted-foreground mt-0.5 flex flex-wrap items-center gap-1.5 text-[10px]">
                          <span>
                            פתוחות:{" "}
                            <span className="font-bold tabular-nums">
                              {o.open}
                            </span>
                          </span>
                          {o.overdue > 0 && (
                            <span className="text-bfresh-coral font-bold">
                              · חריגות:{" "}
                              <span className="tabular-nums">{o.overdue}</span>
                            </span>
                          )}
                          <span
                            className={cn(
                              "ms-auto rounded-full px-1.5 py-0.5 text-[9.5px] font-black tabular-nums",
                              o.slaScore >= 85
                                ? "bg-bfresh-fresh-green/15 text-tone-success"
                                : o.slaScore >= 70
                                  ? "bg-tone-warm/15 text-tone-warm"
                                  : "bg-bfresh-coral/15 text-bfresh-coral",
                            )}
                            title={
                              o.avgResolutionMinutes
                                ? `ממוצע טיפול: ${o.avgResolutionMinutes} ד'`
                                : undefined
                            }
                          >
                            SLA {o.slaScore}%
                          </span>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </motion.div>
        </div>

        {/* Secondary status chips */}
        {secondaryStatusActive.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-muted-foreground text-[10.5px] font-bold uppercase tracking-wider">
              סטטוס משני
            </span>
            {secondaryStatusActive.map((s) => (
              <Badge
                key={s.status}
                variant="outline"
                className="bg-muted/40 rounded-full gap-1 text-[10.5px] font-bold"
              >
                {s.status}
                <span className="text-muted-foreground tabular-nums">
                  · {fmtNumber(s.count)}
                </span>
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function PulseStat({
  label,
  value,
  icon: Icon,
  tone,
  index,
}: {
  label: string;
  value: number;
  icon: typeof MessageSquare;
  tone: "blue" | "amber" | "coral" | "warm" | "green";
  index: number;
}) {
  const tones = {
    blue: {
      bg: "bg-bfresh-blue/8",
      text: "text-bfresh-blue",
      iconBg: "bg-bfresh-blue/15",
    },
    amber: {
      bg: "bg-tone-warm/8",
      text: "text-tone-warm",
      iconBg: "bg-tone-warm/15",
    },
    coral: {
      bg: "bg-bfresh-coral/8",
      text: "text-bfresh-coral",
      iconBg: "bg-bfresh-coral/15",
    },
    warm: {
      bg: "bg-tone-warm/8",
      text: "text-tone-warm",
      iconBg: "bg-tone-warm/15",
    },
    green: {
      bg: "bg-bfresh-fresh-green/8",
      text: "text-tone-success",
      iconBg: "bg-bfresh-fresh-green/15",
    },
  } as const;
  const t = tones[tone];
  return (
    <motion.div
      variants={enterUp(index)}
      initial="hidden"
      animate="visible"
      whileHover={{ y: -2 }}
      transition={SPRING_SMOOTH}
      className={cn("premium-card relative overflow-hidden p-3", t.bg)}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="text-muted-foreground text-[10px] font-bold uppercase tracking-wider">
            {label}
          </div>
          <div
            className={cn(
              "text-2xl font-black leading-none tabular-nums",
              t.text,
            )}
          >
            <NumberFlow value={value} locales="he-IL" />
          </div>
        </div>
        <div
          className={cn(
            "grid size-8 place-items-center rounded-xl",
            t.iconBg,
            t.text,
          )}
        >
          <Icon className="size-4" />
        </div>
      </div>
    </motion.div>
  );
}
