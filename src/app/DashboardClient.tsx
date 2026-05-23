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

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-extrabold tracking-tight md:text-3xl">
          מרכז הבקרה התפעולי
        </h1>
        <p className="text-muted-foreground text-sm">
          תמונת מצב חיה של רשת B-FRESH — משימות, SLA, סניפים ועובדים בזמן אמת.
        </p>
      </header>

      {data && (
        <GlobalFilters branches={data.branches} employees={data.employees} />
      )}

      <section className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        <KpiCard
          index={0}
          label="משימות פתוחות"
          value={loading ? "—" : fmtNumber(data.kpis.openTasks)}
          icon={Activity}
          accent="blue"
          loading={loading}
          trend={{ value: 4.2, positive: false }}
        />
        <KpiCard
          index={1}
          label="חריגות SLA"
          value={loading ? "—" : fmtNumber(data.kpis.slaBreaches)}
          icon={AlertOctagon}
          accent="rose"
          loading={loading}
          trend={{ value: 12, positive: false }}
        />
        <KpiCard
          index={2}
          label="זמן טיפול ממוצע"
          value={loading ? "—" : fmtDuration(data.kpis.avgHandlingMinutes)}
          icon={Timer}
          accent="amber"
          loading={loading}
          trend={{ value: 8.1, positive: true }}
        />
        <KpiCard
          index={3}
          label="הושלמו היום"
          value={loading ? "—" : fmtNumber(data.kpis.completedToday)}
          icon={CheckCircle2}
          accent="green"
          loading={loading}
          trend={{ value: 18, positive: true }}
        />
        <KpiCard
          index={4}
          label="סניף מוביל"
          value={loading ? "—" : data.kpis.topBranch.name}
          hint={loading ? undefined : `ציון SLA · ${data.kpis.topBranch.score}%`}
          icon={Crown}
          accent="violet"
          loading={loading}
        />
        <KpiCard
          index={5}
          label="עובד מצטיין"
          value={loading ? "—" : data.kpis.topEmployee.name}
          hint={
            loading
              ? undefined
              : `${fmtNumber(data.kpis.topEmployee.score)} משימות הושלמו`
          }
          icon={Star}
          accent="cyan"
          loading={loading}
        />
      </section>

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
        >
          {data && (
            <EChart option={heatmapOption(data.responseHeatmap)} height={280} />
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
        >
          {data && (
            <EChart option={branchBarOption(data.branchRanking)} height={300} />
          )}
        </ChartCard>
      </section>

      {data && (
        <section className="grid grid-cols-1 gap-4 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <AIInsights insights={data.insights} />
          </div>
          <div className="lg:col-span-2">
            <SLAAlerts alerts={data.slaAlerts} />
          </div>
        </section>
      )}

      {data && (
        <section>
          <EmployeesTable rows={data.employeePerformance} />
        </section>
      )}

      <section>
        <ChartCard
          index={6}
          title="משימות אחרונות"
          subtitle="לחץ על שורה לפרטים"
          loading={loading}
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
