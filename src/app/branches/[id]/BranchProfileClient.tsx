"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  AlertOctagon,
  ClipboardCheck,
  ListChecks,
  MessageSquare,
  Sparkles,
  Wrench,
  Users,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ChartCard } from "@/components/charts/ChartCard";
import { EChart } from "@/components/charts/EChart";
import { BranchHero } from "@/components/branch/BranchHero";
import { BranchTimeline } from "@/components/branch/BranchTimeline";
import { AIInsights } from "@/components/dashboard/AIInsights";
import { TasksTable } from "@/components/tables/TasksTable";
import { DetailDialog } from "@/components/dashboard/DetailDialog";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { ErrorState } from "@/components/dashboard/ErrorState";
import { useBranchProfile } from "@/hooks/useBranchProfile";
import { areaOption, lineOption } from "@/components/charts/charts";
import { fmtCurrency, fmtDate, fmtDuration, fmtNumber } from "@/lib/format";
import { STATUS_LABEL, STATUS_TONE } from "@/lib/health";
import { cn } from "@/lib/utils";
import type { EChartsOption } from "echarts";
import type { Task } from "@/types/domain";

const CATEGORY_COLORS = [
  "#1e90ff",
  "#16a34a",
  "#f59e0b",
  "#a855f7",
  "#06b6d4",
  "#ef4444",
  "#0ea5e9",
  "#84cc16",
];

function categoryDonut(
  cats: { category: string; count: number }[],
): EChartsOption {
  return {
    tooltip: {
      trigger: "item",
      backgroundColor: "rgba(255,255,255,0.97)",
      borderColor: "rgba(15,23,42,0.06)",
      borderWidth: 1,
      padding: [10, 14],
      extraCssText:
        "border-radius:14px; box-shadow:0 12px 36px -8px rgba(15,23,42,0.18);",
      formatter: (p) => {
        const it = p as { name: string; value: number; percent: number };
        return `<div style="text-align:right;direction:rtl;font-family:var(--font-heebo)">
          <div style="font-size:11px;color:#64748b">${it.name}</div>
          <div style="font-size:14px;font-weight:800">${it.value} · ${it.percent}%</div>
        </div>`;
      },
    },
    legend: {
      bottom: 0,
      icon: "circle",
      itemWidth: 8,
      itemHeight: 8,
      itemGap: 12,
      textStyle: { fontSize: 11, color: "#475569", fontWeight: 600 },
    },
    series: [
      {
        type: "pie",
        radius: ["55%", "80%"],
        avoidLabelOverlap: true,
        padAngle: 2,
        itemStyle: { borderRadius: 8, borderColor: "#fff", borderWidth: 2 },
        label: { show: false },
        labelLine: { show: false },
        data: cats.map((c, i) => ({
          name: c.category,
          value: c.count,
          itemStyle: { color: CATEGORY_COLORS[i % CATEGORY_COLORS.length] },
        })),
      },
    ],
  };
}

const TABS = [
  { id: "overview", label: "סקירה", icon: ListChecks },
  { id: "tickets", label: "פניות", icon: MessageSquare },
  { id: "maintenance", label: "אחזקה", icon: Wrench },
  { id: "inspections", label: "ביקורות", icon: ClipboardCheck },
  { id: "staffing", label: "צוות", icon: Users },
  { id: "timeline", label: "ציר זמן", icon: Sparkles },
] as const;
type TabId = (typeof TABS)[number]["id"];

export default function BranchProfileClient({
  branchId,
}: {
  branchId: string;
}) {
  const { data, isLoading, isError, refetch } = useBranchProfile(branchId);
  const [tab, setTab] = useState<TabId>("overview");
  const [openTask, setOpenTask] = useState<Task | null>(null);

  if (isError) {
    return (
      <Card className="p-8">
        <ErrorState
          message="לא ניתן לטעון את פרופיל הסניף"
          onRetry={() => refetch()}
        />
      </Card>
    );
  }

  if (isLoading || !data) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-56 w-full rounded-3xl" />
        <Skeleton className="h-12 w-full rounded-2xl" />
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
          <Skeleton className="h-72 w-full rounded-2xl lg:col-span-2" />
          <Skeleton className="h-72 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-[var(--density-section-gap,1.5rem)]">
      <BranchHero profile={data} />

      {/* Sticky tab bar — full bleed on mobile */}
      <div className="sticky top-16 z-20 -mx-4 px-4 md:-mx-6 md:px-6 lg:-mx-8 lg:px-8">
        <div className="bg-background/70 supports-[backdrop-filter]:bg-background/55 border-border/40 -mx-4 border-b px-4 py-2 backdrop-blur-xl md:rounded-2xl md:border md:px-2 md:py-1.5 md:premium-card">
          <div className="flex gap-1 overflow-x-auto scrollbar-none">
            {TABS.map((t) => {
              const Icon = t.icon;
              const active = tab === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTab(t.id)}
                  className={cn(
                    "relative inline-flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-2 text-[13px] font-bold transition-colors",
                    active
                      ? "text-white"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent/40",
                  )}
                >
                  {active && (
                    <motion.span
                      layoutId="branch-tab-active"
                      className="from-bfresh-blue to-bfresh-fresh-green absolute inset-0 -z-10 rounded-xl bg-gradient-to-l shadow-md"
                      transition={{
                        type: "spring",
                        stiffness: 350,
                        damping: 30,
                      }}
                    />
                  )}
                  <Icon className="size-3.5" />
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {tab === "overview" && <OverviewTab profile={data} />}
      {tab === "tickets" && (
        <TicketsTab profile={data} onSelect={setOpenTask} />
      )}
      {tab === "maintenance" && <MaintenanceTab profile={data} />}
      {tab === "inspections" && <InspectionsTab profile={data} />}
      {tab === "staffing" && <StaffingTab profile={data} />}
      {tab === "timeline" && <BranchTimeline items={data.timeline} />}

      <DetailDialog
        task={openTask}
        branches={[data.branch]}
        employees={[]}
        onOpenChange={(o) => !o && setOpenTask(null)}
      />
    </div>
  );
}

/* ---------- Overview ---------- */
function OverviewTab({
  profile,
}: {
  profile: ReturnType<typeof useBranchProfile>["data"] & {};
}) {
  if (!profile) return null;
  const openTickets = profile.tickets.filter((t) => t.status !== "done").length;
  const breached = profile.tickets.filter((t) => t.slaState === "breached")
    .length;
  const last30Done = profile.tickets.filter((t) => t.status === "done").length;

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <ChartCard
        index={0}
        title="פניות לאורך זמן"
        subtitle="30 הימים האחרונים · סניף בלבד"
        className="lg:col-span-2"
      >
        <EChart option={lineOption(profile.ticketTrend)} />
      </ChartCard>

      <ChartCard
        index={1}
        title="עמידה ב-SLA"
        subtitle="מגמת אחוז עמידה יומית"
      >
        <EChart option={areaOption(profile.slaTrend)} />
      </ChartCard>

      <Card className="premium-card lg:col-span-2 grid grid-cols-2 gap-3 p-4 md:grid-cols-4">
        <MiniStat label="פניות פתוחות" value={openTickets} accent="blue" />
        <MiniStat
          label="חריגות SLA"
          value={breached}
          accent={breached > 0 ? "rose" : "green"}
        />
        <MiniStat label="הושלמו (30 ימים)" value={last30Done} accent="green" />
        <MiniStat
          label="CSAT"
          value={profile.csat.score}
          suffix=" / 5"
          accent={profile.csat.score >= 4.3 ? "green" : "amber"}
        />
      </Card>

      <ChartCard index={2} title="התפלגות תלונות לפי קטגוריה">
        {profile.complaintsByCategory.length === 0 ? (
          <EmptyState />
        ) : (
          <EChart option={categoryDonut(profile.complaintsByCategory)} />
        )}
      </ChartCard>

      <div className="lg:col-span-3">
        <AIInsights insights={profile.recommendations} />
      </div>
    </div>
  );
}

function MiniStat({
  label,
  value,
  suffix,
  accent,
}: {
  label: string;
  value: number;
  suffix?: string;
  accent: "blue" | "green" | "amber" | "rose";
}) {
  const tones = {
    blue: "text-bfresh-blue",
    green: "text-emerald-700",
    amber: "text-amber-700",
    rose: "text-rose-700",
  };
  return (
    <div className="bg-muted/40 rounded-xl p-3">
      <div className="text-muted-foreground text-[10px] font-black uppercase tracking-wider">
        {label}
      </div>
      <div
        className={cn(
          "mt-1 text-2xl font-black leading-none tabular-nums",
          tones[accent],
        )}
      >
        {fmtNumber(value)}
        {suffix && (
          <span className="text-muted-foreground text-sm font-bold">
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
}

/* ---------- Tickets ---------- */
function TicketsTab({
  profile,
  onSelect,
}: {
  profile: ReturnType<typeof useBranchProfile>["data"] & {};
  onSelect: (t: Task) => void;
}) {
  if (!profile) return null;
  if (profile.tickets.length === 0) {
    return (
      <Card className="premium-card p-6">
        <EmptyState
          title="אין פניות פעילות בסניף זה"
          description="כל המשימות נסגרו או לא נפתחו עדיין השבוע."
        />
      </Card>
    );
  }
  return (
    <Card className="premium-card overflow-hidden border-0 bg-transparent shadow-none">
      <div className="border-border/50 border-b p-4">
        <h2 className="text-base font-bold tracking-tight">
          פניות בסניף · {profile.tickets.length} סה״כ
        </h2>
      </div>
      <div className="p-3">
        <TasksTable
          tasks={profile.tickets}
          branches={[profile.branch]}
          employees={[]}
          onRowClick={onSelect}
        />
      </div>
    </Card>
  );
}

/* ---------- Maintenance ---------- */
function MaintenanceTab({
  profile,
}: {
  profile: ReturnType<typeof useBranchProfile>["data"] & {};
}) {
  if (!profile) return null;
  return (
    <Card className="premium-card overflow-hidden border-0 bg-transparent shadow-none">
      <div className="border-border/50 border-b p-4">
        <h2 className="text-base font-bold tracking-tight">
          היסטוריית אחזקה
        </h2>
        <p className="text-muted-foreground text-xs">
          ספקים, עלויות וזמן טיפול
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="bg-muted/40 text-muted-foreground border-b border-border/50 text-[10.5px] uppercase tracking-wider">
              <th className="py-3 ps-4 text-start font-bold">תיאור</th>
              <th className="py-3 text-start font-bold">ספק</th>
              <th className="py-3 text-start font-bold">נפתח</th>
              <th className="py-3 text-start font-bold">משך טיפול</th>
              <th className="py-3 pe-4 text-start font-bold">עלות</th>
            </tr>
          </thead>
          <tbody>
            {profile.maintenanceHistory.map((m) => {
              const duration =
                m.resolvedAt && m.occurredAt
                  ? Math.round(
                      (new Date(m.resolvedAt).getTime() -
                        new Date(m.occurredAt).getTime()) /
                        60000,
                    )
                  : 0;
              return (
                <tr
                  key={m.id}
                  className="hover:bg-bfresh-blue/[0.05] border-b border-border/30 last:border-0"
                >
                  <td className="py-3 ps-4 font-semibold">{m.title}</td>
                  <td className="py-3 text-xs">{m.supplier}</td>
                  <td className="py-3 text-xs text-muted-foreground">
                    {fmtDate(m.occurredAt)}
                  </td>
                  <td className="py-3 text-xs tabular-nums">
                    {duration ? fmtDuration(duration) : "—"}
                  </td>
                  <td className="py-3 pe-4 text-xs tabular-nums font-bold">
                    {m.cost ? fmtCurrency(m.cost) : "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

/* ---------- Inspections ---------- */
function InspectionsTab({
  profile,
}: {
  profile: ReturnType<typeof useBranchProfile>["data"] & {};
}) {
  if (!profile) return null;
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
      {profile.inspections.map((ins) => {
        const tone =
          ins.score >= 88
            ? STATUS_TONE.excellent
            : ins.score >= 75
              ? STATUS_TONE.stable
              : ins.score >= 60
                ? STATUS_TONE.attention
                : STATUS_TONE.critical;
        const status =
          ins.score >= 88
            ? "excellent"
            : ins.score >= 75
              ? "stable"
              : ins.score >= 60
                ? "attention"
                : "critical";
        return (
          <motion.div
            key={ins.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="premium-card flex items-center gap-4 p-4"
          >
            <div className={cn("size-1 self-stretch rounded-full", tone.dot)} />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <ClipboardCheck className="text-muted-foreground size-4" />
                <span className="text-sm font-bold">
                  ביקורת {fmtDate(ins.date)}
                </span>
                <Badge variant="outline" className={cn("rounded-full", tone.chip)}>
                  {STATUS_LABEL[status]}
                </Badge>
              </div>
              <div className="text-muted-foreground mt-1 text-xs">
                {ins.findings} ממצאים · בודק: {ins.inspector}
              </div>
            </div>
            <div className="text-4xl font-black tabular-nums leading-none">
              {ins.score}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

/* ---------- Staffing ---------- */
function StaffingTab({
  profile,
}: {
  profile: ReturnType<typeof useBranchProfile>["data"] & {};
}) {
  if (!profile) return null;
  const fillPct = Math.round(
    (profile.staffing.headcount / Math.max(profile.staffing.target, 1)) * 100,
  );
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
      <Card className="premium-card p-5">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-muted-foreground text-[10.5px] font-black uppercase tracking-wider">
              איוש
            </div>
            <div className="mt-1 text-3xl font-black tabular-nums">
              {profile.staffing.headcount}
              <span className="text-muted-foreground text-base font-bold">
                {" "}/{" "}
                {profile.staffing.target}
              </span>
            </div>
          </div>
          <div className="text-bfresh-blue text-3xl font-black tabular-nums">
            {fillPct}%
          </div>
        </div>
        <div className="bg-muted mt-3 h-2 overflow-hidden rounded-full">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${fillPct}%` }}
            transition={{ duration: 0.8 }}
            className={cn(
              "h-full rounded-full",
              fillPct >= 95
                ? "bg-emerald-500"
                : fillPct >= 80
                  ? "bg-bfresh-blue"
                  : "bg-amber-500",
            )}
          />
        </div>
      </Card>

      <Card className="premium-card grid grid-cols-2 gap-3 p-5">
        <div className="bg-muted/40 rounded-xl p-3">
          <div className="text-muted-foreground text-[10px] font-black uppercase tracking-wider">
            ותק ממוצע
          </div>
          <div className="mt-1 text-2xl font-black tabular-nums">
            {profile.staffing.avgTenureMonths}
            <span className="text-muted-foreground text-sm font-bold"> ח׳</span>
          </div>
        </div>
        <div className="bg-muted/40 rounded-xl p-3">
          <div className="text-muted-foreground text-[10px] font-black uppercase tracking-wider">
            דרושים פתוחים
          </div>
          <div className="mt-1 text-2xl font-black tabular-nums">
            {profile.staffing.openReqs}
          </div>
        </div>
      </Card>

      <div className="md:col-span-2">
        <Card className="premium-card flex items-center gap-3 p-4">
          <div className="grid size-10 place-items-center rounded-2xl bg-violet-500/15 text-violet-700">
            <Users className="size-4" />
          </div>
          <div className="flex-1">
            <div className="text-sm font-bold">
              {profile.staffing.openReqs > 0
                ? `${profile.staffing.openReqs} משרות פתוחות`
                : "הסניף מאויש במלואו"}
            </div>
            <div className="text-muted-foreground text-xs">
              נתוני גיוס סנכרון אחרון: {fmtDate(new Date())}
            </div>
          </div>
          {profile.staffing.openReqs > 0 && (
            <Badge
              variant="outline"
              className="border-violet-500/30 bg-violet-500/10 text-violet-700 rounded-full"
            >
              <AlertOctagon className="me-1 size-3" />
              חוסר באיוש
            </Badge>
          )}
        </Card>
      </div>
    </div>
  );
}
