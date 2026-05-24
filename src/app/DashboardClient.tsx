"use client";

import { useState } from "react";
import {
  Activity,
  AlertOctagon,
  CheckCircle2,
  Crown,
  Star,
  Timer,
  Users,
  Wrench,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { useDashboard } from "@/hooks/useDashboard";
import { HeroSummary } from "@/components/dashboard/HeroSummary";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { ChartCard } from "@/components/charts/ChartCard";
import { EChart } from "@/components/charts/EChart";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { ErrorState } from "@/components/dashboard/ErrorState";
import { GlobalFilters } from "@/components/filters/GlobalFilters";
import { TasksTable } from "@/components/tables/TasksTable";
import { EmployeesTable } from "@/components/tables/EmployeesTable";
import { DetailDialog } from "@/components/dashboard/DetailDialog";
import { SLAAlerts } from "@/components/dashboard/SLAAlerts";
import { UrgentAlertsRail } from "@/components/cockpit/UrgentAlertsRail";
import { NetworkHeatmap } from "@/components/cockpit/NetworkHeatmap";
import { ActivityFeed } from "@/components/cockpit/ActivityFeed";
import { SpotlightCards } from "@/components/cockpit/SpotlightCards";
import { AICopilotRail } from "@/components/cockpit/AICopilotRail";
import { LiveTicker } from "@/components/cockpit/LiveTicker";
import { NarrativeBar } from "@/components/cockpit/NarrativeBar";
import { ComplaintPulse } from "@/components/cockpit/ComplaintPulse";
import { OwnerDrillPanel } from "@/components/cockpit/OwnerDrillPanel";
import { useComplaints } from "@/hooks/useComplaints";
import { useEffect } from "react";
import {
  areaOption,
  donutOption,
  funnelOption,
  heatmapOption,
  lineOption,
} from "@/components/charts/charts";
import { fmtDuration, fmtNumber } from "@/lib/format";
import type { Task } from "@/types/domain";

export default function DashboardClient() {
  const { data, isLoading, isError, refetch } = useDashboard();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [drillOwner, setDrillOwner] = useState<string | null>(null);
  const { data: complaintsData } = useComplaints();

  if (isError) {
    return (
      <Card className="p-8">
        <ErrorState onRetry={() => refetch()} />
      </Card>
    );
  }

  const loading = isLoading || !data;
  const slaLatest = data?.slaCompliance.slice(-1)[0]?.value ?? 0;
  const sparkTasks = data?.tasksOverTime.slice(-14).map((p) => p.value) ?? [];
  const sparkSLA = data?.slaCompliance.slice(-14).map((p) => p.value) ?? [];

  // Active maintenance heuristic from activity feed
  const openMaintenance =
    data?.activity.filter((a) => a.kind === "maintenance_call").length ?? 0;
  const recruitmentOpen =
    data?.activity.filter((a) => a.kind === "recruitment_spike").length ?? 0;
  const franchiseLeads =
    data?.activity.filter((a) => a.kind === "franchise_lead").length ?? 0;

  // ── Operational mood — drives the page atmosphere tint ──
  const criticalCount =
    data?.activity.filter((a) => a.severity === "critical").length ?? 0;
  const highCount =
    data?.activity.filter((a) => a.severity === "high").length ?? 0;
  const mood: "critical" | "warm" | "ok" =
    criticalCount >= 3 || (data?.networkScore ?? 100) < 65
      ? "critical"
      : highCount >= 5 || (data?.networkScore ?? 100) < 78
        ? "warm"
        : "ok";

  useEffect(() => {
    const main = document.querySelector("main");
    if (!main) return;
    main.setAttribute("data-pressure", mood);
    return () => main.removeAttribute("data-pressure");
  }, [mood]);

  return (
    <div className="grid grid-cols-1 gap-[var(--density-section-gap,1.5rem)] xl:grid-cols-[1fr_360px]">
      {/* MAIN COLUMN */}
      <div className="flex min-w-0 flex-col gap-[var(--density-section-gap,1.5rem)]">
        {/* ── Band 1: Hero ── */}
        <HeroSummary
          openTasks={data?.kpis.openTasks ?? 0}
          slaCompliancePct={slaLatest}
          loading={loading}
        />

        {/* ── Band 1.4: AI narrative bar ── */}
        <NarrativeBar />

        {/* ── Band 1.5: Live operational ticker ── */}
        {data && <LiveTicker events={data.activity} />}

        {/* ── Band 2: Urgent rail ── */}
        {data && <UrgentAlertsRail events={data.activity} />}

        {/* ── Band 3: Filters ── */}
        {data && (
          <GlobalFilters branches={data.branches} employees={data.employees} />
        )}

        {/* ── Band 4: Network spotlight ── */}
        {data && (
          <SpotlightCards
            branches={data.branchHealth}
            networkScore={data.networkScore}
            networkTrend={data.networkScoreTrend}
          />
        )}

        {/* ── Band 4.5: Complaint pulse (live complaints surface) ── */}
        {data?.complaintMetrics && (
          <ComplaintPulse
            metrics={data.complaintMetrics}
            employees={data.employees}
            onOwnerClick={(id) => setDrillOwner(id)}
          />
        )}

        {/* ── Band 5: KPI Pulse Strip ── */}
        <div className="section-title flex items-center justify-between">
          <span>פעימה תפעולית · 24 שעות אחרונות</span>
        </div>
        <section className="-mt-3 grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-8">
          <KpiCard
            index={0}
            label="פניות פתוחות"
            value="—"
            numericValue={data?.kpis.openTasks}
            icon={Activity}
            accent="blue"
            loading={loading}
            trend={{ value: 4.2, positive: false }}
            sparkline={sparkTasks}
          />
          <KpiCard
            index={1}
            label="חריגות SLA"
            value="—"
            numericValue={data?.kpis.slaBreaches}
            icon={AlertOctagon}
            accent="rose"
            loading={loading}
            trend={{ value: 12, positive: false }}
            badge={{ label: "דרוש מענה", tone: "bad" }}
          />
          <KpiCard
            index={2}
            label="זמן טיפול"
            value={data ? fmtDuration(data.kpis.avgHandlingMinutes) : "—"}
            icon={Timer}
            accent="amber"
            loading={loading}
            trend={{ value: 8.1, positive: true }}
          />
          <KpiCard
            index={3}
            label="הושלמו היום"
            value="—"
            numericValue={data?.kpis.completedToday}
            icon={CheckCircle2}
            accent="green"
            loading={loading}
            trend={{ value: 18, positive: true }}
            sparkline={sparkSLA}
            badge={{ label: "מעולה", tone: "good" }}
          />
          <KpiCard
            index={4}
            label="קריאות אחזקה"
            value="—"
            numericValue={openMaintenance}
            icon={Wrench}
            accent="violet"
            loading={loading}
            hint="ספקים פעילים בשטח"
          />
          <KpiCard
            index={5}
            label="בריאות הרשת"
            value="—"
            numericValue={data?.networkScore}
            suffix=" / 100"
            icon={Activity}
            accent="cyan"
            loading={loading}
            trend={
              data
                ? {
                    value: Math.abs(data.networkScoreTrend),
                    positive: data.networkScoreTrend >= 0,
                  }
                : undefined
            }
          />
          <KpiCard
            index={6}
            label="לידים זכיינות"
            value="—"
            numericValue={franchiseLeads}
            icon={Crown}
            accent="blue"
            loading={loading}
            hint="חדשים השבוע"
          />
          <KpiCard
            index={7}
            label="דרושים פתוחים"
            value="—"
            numericValue={recruitmentOpen}
            icon={Users}
            accent="green"
            loading={loading}
            hint="זינוקי גיוס פעילים"
          />
        </section>

        {/* ── Band 6: Network heatmap ── */}
        <div className="section-title">תצוגת רשת · כל הסניפים</div>
        <div className="-mt-3">
          {data && <NetworkHeatmap branches={data.branchHealth} />}
        </div>

        {/* ── Band 7: SLA + Activity ── */}
        <div className="section-title">תור עדיפויות · אירועים חיים</div>
        {data && (
          <section className="-mt-3 grid grid-cols-1 gap-4 lg:grid-cols-2">
            <SLAAlerts alerts={data.slaAlerts} />
            <ActivityFeed events={data.activity} />
          </section>
        )}

        {/* ── Band 8: Charts grid ── */}
        <div className="section-title">ניתוח · 30 ימים</div>
        <div className="-mt-3" />
        <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <ChartCard
            index={0}
            title="פניות לאורך זמן"
            subtitle="30 הימים האחרונים"
            loading={loading}
            className="lg:col-span-2"
          >
            {data && <EChart option={lineOption(data.tasksOverTime)} />}
          </ChartCard>

          <ChartCard
            index={1}
            title="התפלגות סטטוסים"
            subtitle="פיצול כלל המשימות"
            loading={loading}
          >
            {data && data.statusDistribution.length > 0 ? (
              <EChart option={donutOption(data.statusDistribution)} />
            ) : (
              <EmptyState />
            )}
          </ChartCard>

          <ChartCard
            index={2}
            title="עמידה ביעדי SLA"
            subtitle="אחוז עמידה יומי"
            loading={loading}
          >
            {data && <EChart option={areaOption(data.slaCompliance)} />}
          </ChartCard>

          <ChartCard
            index={3}
            title="זמני תגובה לפי יום ושעה"
            subtitle="היטמפ ניתוח עומסים"
            loading={loading}
            className="lg:col-span-2"
            minHeight={320}
          >
            {data && (
              <EChart
                option={heatmapOption(data.responseHeatmap)}
                height={300}
              />
            )}
          </ChartCard>

          <ChartCard
            index={4}
            title="משפך מחזור חיים"
            subtitle="פתיחה → סגירה → SLA"
            loading={loading}
          >
            {data && <EChart option={funnelOption(data.funnel)} />}
          </ChartCard>
        </section>

        {/* ── Band 9: Employees ── */}
        {data && (
          <section>
            <EmployeesTable rows={data.employeePerformance} />
          </section>
        )}

        {/* ── Band 10: Recent tasks ── */}
        <section>
          <ChartCard
            index={5}
            title="פניות אחרונות"
            subtitle="לחץ על שורה לפתיחת פירוט"
            loading={loading}
            minHeight={420}
          >
            {data && (
              <TasksTable
                tasks={data.recentTasks}
                branches={data.branches}
                employees={data.employees}
                onRowClick={setSelectedTask}
              />
            )}
          </ChartCard>
        </section>

        {data && (
          <DetailDialog
            task={selectedTask}
            branches={data.branches}
            employees={data.employees}
            onOpenChange={(o) => !o && setSelectedTask(null)}
          />
        )}

        <OwnerDrillPanel
          ownerId={drillOwner}
          complaints={complaintsData?.complaints}
          employees={complaintsData?.employees ?? data?.employees}
          onOpenChange={(o) => !o && setDrillOwner(null)}
        />
      </div>

      {/* RIGHT RAIL: AI Copilot — xl+ sticky, smaller as floating sheet */}
      {data && <AICopilotRail insights={data.insights} />}
    </div>
  );
}
