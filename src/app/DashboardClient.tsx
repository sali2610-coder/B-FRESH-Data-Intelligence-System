"use client";

import { useState } from "react";
import {
  Activity,
  AlertOctagon,
  CheckCircle2,
  Crown,
  Star,
  Timer,
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
import { AIInsights } from "@/components/dashboard/AIInsights";
import { SLAAlerts } from "@/components/dashboard/SLAAlerts";
import {
  areaOption,
  branchBarOption,
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

  return (
    <div className="flex flex-col gap-[var(--density-section-gap,1.5rem)]">
      <HeroSummary
        openTasks={data?.kpis.openTasks ?? 0}
        slaCompliancePct={slaLatest}
        loading={loading}
      />

      {data && (
        <GlobalFilters branches={data.branches} employees={data.employees} />
      )}

      {/* KPI Row */}
      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <KpiCard
          index={0}
          label="משימות פתוחות"
          value="—"
          numericValue={data?.kpis.openTasks}
          icon={Activity}
          accent="blue"
          loading={loading}
          trend={{ value: 4.2, positive: false }}
          sparkline={sparkTasks}
          hint="כולל בטיפול ובהמתנה"
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
          label="זמן טיפול ממוצע"
          value={data ? fmtDuration(data.kpis.avgHandlingMinutes) : "—"}
          icon={Timer}
          accent="amber"
          loading={loading}
          trend={{ value: 8.1, positive: true }}
          hint="ירידה לעומת חודש קודם"
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
          label="סניף מוביל"
          value={data?.kpis.topBranch.name ?? "—"}
          icon={Crown}
          accent="violet"
          loading={loading}
          hint={data ? `ציון SLA · ${data.kpis.topBranch.score}%` : undefined}
        />
        <KpiCard
          index={5}
          label="עובד מצטיין"
          value={data?.kpis.topEmployee.name ?? "—"}
          icon={Star}
          accent="cyan"
          loading={loading}
          hint={
            data
              ? `${fmtNumber(data.kpis.topEmployee.score)} משימות הושלמו`
              : undefined
          }
        />
      </section>

      {/* Charts grid */}
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <ChartCard
          index={0}
          title="משימות לאורך זמן"
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
            <EChart option={heatmapOption(data.responseHeatmap)} height={300} />
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

        <ChartCard
          index={5}
          title="דירוג סניפים"
          subtitle="ציון עמידה ב-SLA"
          loading={loading}
          className="lg:col-span-2"
          minHeight={320}
        >
          {data && (
            <EChart option={branchBarOption(data.branchRanking)} height={300} />
          )}
        </ChartCard>
      </section>

      {/* Intelligence row */}
      {data && (
        <section className="grid grid-cols-1 gap-4 xl:grid-cols-5">
          <div className="xl:col-span-3">
            <AIInsights insights={data.insights} />
          </div>
          <div className="xl:col-span-2">
            <SLAAlerts alerts={data.slaAlerts} />
          </div>
        </section>
      )}

      {/* Employees ranking */}
      {data && (
        <section>
          <EmployeesTable rows={data.employeePerformance} />
        </section>
      )}

      {/* Recent tasks */}
      <section>
        <ChartCard
          index={6}
          title="משימות אחרונות"
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
    </div>
  );
}
