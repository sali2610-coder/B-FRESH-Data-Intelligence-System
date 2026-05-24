import "server-only";

import type {
  ActivityEvent,
  ActivityKind,
  ActivitySeverity,
  AIInsight,
  Branch,
  BranchHealth,
  DashboardData,
  Employee,
  EmployeePerformance,
  SLAAlert,
  Task,
  TaskStatus,
  TimeSeriesPoint,
} from "@/types/domain";
import type { IntelligenceSnapshot } from "./types";

/**
 * Adapt the central IntelligenceSnapshot to the legacy DashboardData shape
 * the existing UI components consume. UI doesn't know about the domain
 * layer yet — this keeps the migration safe.
 */
export function renderDashboardData(
  snapshot: IntelligenceSnapshot,
): DashboardData {
  const ticketLike = [...snapshot.complaints, ...snapshot.maintenance];

  // ── Tasks (UI-friendly) ──
  const tasks: Task[] = ticketLike.map((t) => ({
    id: t.id,
    title: t.title,
    status: t.status,
    priority: t.priority,
    slaState: t.slaState,
    branchId: t.branchId,
    assigneeId: t.assigneeId ?? "",
    createdAt: t.createdAt,
    dueAt: t.dueAt ?? t.createdAt,
    resolvedAt: t.resolvedAt ?? undefined,
    handlingMinutes: t.handlingMinutes ?? undefined,
    mondayItemId: Number(t.id) || 0,
  }));

  // ── KPIs ──
  const openTasks = tasks.filter((t) => t.status !== "done").length;
  const slaBreaches = snapshot.slaEvents.length;
  const done = tasks.filter((t) => t.status === "done");
  const avgHandling = done.length
    ? Math.round(
        done.reduce((s, t) => s + (t.handlingMinutes ?? 0), 0) / done.length,
      )
    : 0;
  const todayKey = new Date().toISOString().slice(0, 10);
  const completedToday = tasks.filter(
    (t) => t.resolvedAt?.slice(0, 10) === todayKey,
  ).length;

  // ── Branch ranking (by sla %) ──
  const branchRanking = snapshot.branchHealth
    .map((b) => ({
      branchId: b.branchId,
      name: b.branchName,
      score: b.components.sla,
    }))
    .sort((a, b) => b.score - a.score);

  // ── Employee performance ──
  const employeePerformance: EmployeePerformance[] = snapshot.employees.map(
    (e) => {
      const eTickets = ticketLike.filter((t) => t.assigneeId === e.id);
      const eDone = eTickets.filter((t) => t.status === "done");
      const open = eTickets.length - eDone.length;
      const okSla = eTickets.filter((t) => t.slaState === "ok").length;
      const avg = eDone.length
        ? Math.round(
            eDone.reduce((s, t) => s + (t.handlingMinutes ?? 0), 0) /
              eDone.length,
          )
        : 0;
      return {
        employeeId: e.id,
        name: e.name,
        role: e.role,
        branchName:
          snapshot.branches.find((b) => b.id === e.branchId)?.name ?? "—",
        avatarColor: e.avatarColor ?? "#12a9e8",
        open,
        done: eDone.length,
        avgHandlingMinutes: avg,
        slaScore: eTickets.length
          ? Math.round((okSla / eTickets.length) * 100)
          : 0,
        trend: 0,
      };
    },
  );

  const topEmp = [...employeePerformance].sort((a, b) => b.done - a.done)[0];

  // ── 30-day time series ──
  const now = new Date();
  const tasksOverTime: TimeSeriesPoint[] = [];
  const slaCompliance: TimeSeriesPoint[] = [];
  for (let d = 29; d >= 0; d--) {
    const day = new Date(now.getTime() - d * 86400000);
    const key = day.toISOString().slice(0, 10);
    const dayTickets = tasks.filter((t) => t.createdAt.slice(0, 10) === key);
    tasksOverTime.push({ date: key, value: dayTickets.length });
    const ok = dayTickets.filter((t) => t.slaState === "ok").length;
    slaCompliance.push({
      date: key,
      value: dayTickets.length
        ? Math.round((ok / dayTickets.length) * 1000) / 10
        : 0,
    });
  }

  // ── Status distribution ──
  const statuses: TaskStatus[] = ["open", "in_progress", "blocked", "done"];
  const statusDistribution = statuses.map((s) => ({
    status: s,
    count: tasks.filter((t) => t.status === s).length,
  }));

  // ── Response heatmap ──
  const responseHeatmap: { weekday: number; hour: number; value: number }[] = [];
  for (let w = 0; w < 7; w++) {
    for (let h = 7; h < 23; h++) {
      const slice = tasks.filter((t) => {
        const d = new Date(t.createdAt);
        return d.getDay() === w && d.getHours() === h;
      });
      const avg = slice.length
        ? Math.round(
            slice.reduce((s, t) => s + (t.handlingMinutes ?? 0), 0) /
              slice.length,
          )
        : 0;
      responseHeatmap.push({ weekday: w, hour: h, value: avg });
    }
  }

  // ── Funnel ──
  const funnel = [
    { stage: "פניות נכנסות", value: tasks.length },
    { stage: "שויכו", value: tasks.filter((t) => t.assigneeId).length },
    { stage: "בטיפול", value: tasks.filter((t) => t.status !== "open").length },
    { stage: "נסגרו", value: done.length },
    {
      stage: "בתוך SLA",
      value: done.filter((t) => t.slaState === "ok").length,
    },
  ];

  // ── SLA alerts ──
  const slaAlerts: SLAAlert[] = snapshot.slaEvents.slice(0, 12).map((s) => ({
    id: s.id,
    taskTitle:
      ticketLike.find((t) => t.id === s.ticketId)?.title ?? `#${s.ticketId}`,
    branchName:
      snapshot.branches.find((b) => b.id === s.branchId)?.name ?? "—",
    assigneeName:
      snapshot.employees.find(
        (e) =>
          e.id ===
          ticketLike.find((t) => t.id === s.ticketId)?.assigneeId,
      )?.name ?? "—",
    severity: s.severity === "low" ? "low" : s.severity === "medium" ? "medium" : s.severity === "high" ? "high" : "high",
    minutesOverdue: s.minutesOverdue,
    occurredAt: s.occurredAt,
  }));

  // ── Activity feed (derived from latest tickets + alerts) ──
  const recent = [...ticketLike]
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
    .slice(0, 24);
  const activity: ActivityEvent[] = recent.map((t) => {
    const branchName =
      snapshot.branches.find((b) => b.id === t.branchId)?.name ?? "—";
    const ownerName =
      snapshot.employees.find((e) => e.id === t.assigneeId)?.name ?? "—";
    if (t.slaState === "breached") {
      return event(
        t.id,
        "sla_breach",
        "critical",
        "חריגת SLA",
        t.title,
        branchName,
        ownerName,
        t.dueAt ?? t.updatedAt,
        { label: "טפל" },
      );
    }
    if (t.status === "done") {
      return event(
        t.id,
        "complaint_closed",
        "low",
        "פניה נסגרה",
        t.title,
        branchName,
        ownerName,
        t.resolvedAt ?? t.updatedAt,
      );
    }
    return event(
      t.id,
      t.type === "maintenance" ? "maintenance_call" : "complaint_opened",
      t.priority === "critical" || t.priority === "high" ? "high" : "medium",
      t.type === "maintenance" ? "קריאת אחזקה" : "פניה חדשה",
      t.title,
      branchName,
      ownerName,
      t.createdAt,
    );
  });

  // ── Branch health (snapshot → UI BranchHealth) ──
  const branchHealth: BranchHealth[] = snapshot.branchHealth.map((h) => ({
    branchId: h.branchId,
    branchName: h.branchName,
    region: h.region,
    manager: h.manager ?? "—",
    score: h.score,
    previousScore: h.previousScore,
    trend: h.trend,
    movement: h.movement,
    status: h.status,
    components: h.components,
    alerts: h.alerts,
  }));

  // ── UI branches + employees ──
  const branches: Branch[] = snapshot.branches.map((b) => ({
    id: b.id,
    name: b.name,
    region: b.region,
    manager: b.managerName ?? "—",
  }));
  const employees: Employee[] = snapshot.employees.map((e) => ({
    id: e.id,
    name: e.name,
    role: e.role,
    branchId: e.branchId,
    avatarColor: e.avatarColor ?? "#12a9e8",
  }));

  // ── Insights (snapshot → UI AIInsight) ──
  const insights: AIInsight[] = snapshot.insights.map((i) => ({
    id: i.id,
    kind: i.kind,
    title: i.title,
    detail: i.detail,
    metric: i.metric,
    confidence: i.confidence,
    importance: i.importance,
    recommendation: i.recommendation,
  }));

  return {
    kpis: {
      openTasks,
      slaBreaches,
      avgHandlingMinutes: avgHandling,
      completedToday,
      topBranch: branchRanking[0]
        ? {
            id: branchRanking[0].branchId,
            name: branchRanking[0].name,
            score: branchRanking[0].score,
          }
        : { id: "", name: "—", score: 0 },
      topEmployee: topEmp
        ? { id: topEmp.employeeId, name: topEmp.name, score: topEmp.done }
        : { id: "", name: "—", score: 0 },
      trendOpenTasks: tasksOverTime.slice(-14),
    },
    tasksOverTime,
    slaCompliance,
    statusDistribution,
    responseHeatmap,
    funnel,
    branchRanking,
    recentTasks: [...tasks].sort((a, b) =>
      a.createdAt < b.createdAt ? 1 : -1,
    ).slice(0, 50),
    branches,
    employees,
    employeePerformance,
    slaAlerts,
    insights,
    branchHealth,
    activity,
    networkScore: snapshot.networkScore,
    networkScoreTrend: snapshot.networkScoreTrend,
    complaintMetrics: snapshot.complaintMetrics
      ? {
          total: snapshot.complaintMetrics.total,
          open: snapshot.complaintMetrics.open,
          closed: snapshot.complaintMetrics.closed,
          blocked: snapshot.complaintMetrics.blocked,
          inProgress: snapshot.complaintMetrics.inProgress,
          slaRisk: snapshot.complaintMetrics.slaRisk,
          overdue: snapshot.complaintMetrics.overdue,
          byOwner: snapshot.complaintMetrics.byOwner,
          byStatus: snapshot.complaintMetrics.byStatus,
          bySecondaryStatus: snapshot.complaintMetrics.bySecondaryStatus,
          trend30d: snapshot.complaintMetrics.trend30d,
        }
      : undefined,
  };
}

function event(
  id: string,
  kind: ActivityKind,
  severity: ActivitySeverity,
  title: string,
  detail: string,
  branchName: string,
  ownerName: string,
  occurredAt: string,
  action?: { label: string },
): ActivityEvent {
  return {
    id: `act-${id}`,
    kind,
    severity,
    title,
    detail,
    branchName,
    ownerName,
    occurredAt,
    action,
  };
}
