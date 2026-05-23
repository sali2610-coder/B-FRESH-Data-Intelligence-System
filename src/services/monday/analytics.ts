import "server-only";

import { computeHealthScore, statusFromScore } from "@/lib/health";
import type {
  ActivityEvent,
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
import {
  mapPriority,
  mapSlaState,
  mapStatus,
} from "@/lib/monday/normalize";
import type { NormalizedTicket } from "@/lib/monday/types";

const HEBREW_DAYS = ["א'", "ב'", "ג'", "ד'", "ה'", "ו'", "שבת"] as const;

function isoDay(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function minutesBetween(a: string | null, b: string | null): number | undefined {
  if (!a || !b) return undefined;
  const ta = new Date(a).getTime();
  const tb = new Date(b).getTime();
  if (Number.isNaN(ta) || Number.isNaN(tb)) return undefined;
  return Math.max(0, Math.round((tb - ta) / 60_000));
}

function pickRegion(raw: string | null): Branch["region"] {
  if (!raw) return "center";
  const v = raw.toLowerCase();
  if (/north|צפון/.test(v)) return "north";
  if (/south|דרום/.test(v)) return "south";
  return "center";
}

function uniqueByKey<T>(items: T[], key: (t: T) => string): T[] {
  const seen = new Set<string>();
  const out: T[] = [];
  for (const it of items) {
    const k = key(it);
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(it);
  }
  return out;
}

/**
 * Convert normalized Monday tickets into the full DashboardData shape the
 * existing frontend expects. Numbers are calculated server-side here so the
 * UI receives ready-to-render data.
 */
export function buildDashboardFromTickets(
  tickets: NormalizedTicket[],
  now: Date = new Date(),
): DashboardData {
  // ── Branches (derive from data, deduped by name) ──
  const branchNames = uniqueByKey(
    tickets
      .map((t) => t.branch)
      .filter((b): b is string => !!b)
      .map((name) => name.trim()),
    (n) => n,
  );
  const branches: Branch[] = branchNames.map((name, i) => ({
    id: `b-${slug(name) || i}`,
    name,
    region: pickRegion(
      tickets.find((t) => t.branch === name)?.region ?? null,
    ),
    manager: tickets.find((t) => t.branch === name)?.owner ?? "לא משויך",
  }));
  const branchByName = new Map(branches.map((b) => [b.name, b]));

  // ── Employees (derive from data, deduped by name) ──
  const ownerNames = uniqueByKey(
    tickets
      .map((t) => t.owner)
      .filter((o): o is string => !!o)
      .flatMap((o) => o.split(/,\s*/))
      .filter(Boolean),
    (n) => n,
  );
  const employees: Employee[] = ownerNames.map((name, i) => ({
    id: `e-${slug(name) || i}`,
    name,
    role: "צוות תפעולי",
    branchId:
      branches.find((b) =>
        tickets.some(
          (t) => t.owner?.includes(name) && t.branch === b.name,
        ),
      )?.id ?? branches[0]?.id ?? "b-0",
    avatarColor: avatarColor(name),
  }));
  const employeeByName = new Map(employees.map((e) => [e.name, e]));

  // ── Tasks (convert normalized → internal Task type) ──
  const tasks: Task[] = tickets.map((tk, i) => {
    const status: TaskStatus = mapStatus(tk.status);
    const sla = mapSlaState(tk.slaStatus);
    const priority = mapPriority(tk.priority);
    const branch = tk.branch ? branchByName.get(tk.branch) : undefined;
    const owner = tk.owner
      ? employeeByName.get(tk.owner.split(",")[0].trim())
      : undefined;
    const handling =
      status === "done"
        ? minutesBetween(tk.createdAt, tk.updatedAt)
        : undefined;
    return {
      id: tk.id,
      title: tk.itemName || `#${tk.id}`,
      status,
      priority,
      slaState: sla,
      branchId: branch?.id ?? branches[0]?.id ?? "b-0",
      assigneeId: owner?.id ?? employees[0]?.id ?? "e-0",
      createdAt: tk.createdAt,
      dueAt: tk.dueDate ?? tk.createdAt,
      resolvedAt: status === "done" ? tk.updatedAt : undefined,
      handlingMinutes: handling,
      mondayItemId: Number(tk.id) || 9000000 + i,
    };
  });

  // ── KPIs ──
  const openTasks = tasks.filter((t) => t.status !== "done").length;
  const slaBreaches = tasks.filter((t) => t.slaState === "breached").length;
  const doneTasks = tasks.filter((t) => t.status === "done");
  const avgHandling = doneTasks.length
    ? doneTasks.reduce((s, t) => s + (t.handlingMinutes ?? 0), 0) /
      doneTasks.length
    : 0;
  const todayKey = isoDay(now);
  const completedToday = tasks.filter(
    (t) => t.resolvedAt?.slice(0, 10) === todayKey,
  ).length;

  // ── Branch scoreboard ──
  const branchScores = branches
    .map((b) => {
      const bTasks = tasks.filter((t) => t.branchId === b.id);
      const ok = bTasks.filter((t) => t.slaState === "ok").length;
      const score = bTasks.length ? Math.round((ok / bTasks.length) * 100) : 0;
      return { branchId: b.id, name: b.name, score };
    })
    .sort((a, b) => b.score - a.score);

  // ── Employee scoreboard ──
  const empScores = employees
    .map((e) => {
      const eTasks = tasks.filter((t) => t.assigneeId === e.id);
      const done = eTasks.filter((t) => t.status === "done").length;
      return { id: e.id, name: e.name, score: done };
    })
    .sort((a, b) => b.score - a.score);

  // ── Time series (30 days) ──
  const tasksOverTime: TimeSeriesPoint[] = [];
  const slaCompliance: TimeSeriesPoint[] = [];
  for (let d = 29; d >= 0; d--) {
    const day = new Date(now.getTime() - d * 86400000);
    const key = isoDay(day);
    const dayTasks = tasks.filter((t) => t.createdAt.slice(0, 10) === key);
    tasksOverTime.push({ date: key, value: dayTasks.length });
    const okCount = dayTasks.filter((t) => t.slaState === "ok").length;
    slaCompliance.push({
      date: key,
      value: dayTasks.length
        ? Math.round((okCount / dayTasks.length) * 1000) / 10
        : 0,
    });
  }

  // ── Status distribution ──
  const STATUSES: TaskStatus[] = ["open", "in_progress", "blocked", "done"];
  const statusDistribution = STATUSES.map((s) => ({
    status: s,
    count: tasks.filter((t) => t.status === s).length,
  }));

  // ── Response heatmap (weekday × hour) ──
  const responseHeatmap: { weekday: number; hour: number; value: number }[] = [];
  for (let w = 0; w < 7; w++) {
    for (let h = 7; h < 23; h++) {
      const slice = tasks.filter((t) => {
        const d = new Date(t.createdAt);
        return d.getDay() === w && d.getHours() === h;
      });
      const avg = slice.length
        ? slice.reduce((s, t) => s + (t.handlingMinutes ?? 0), 0) / slice.length
        : 0;
      responseHeatmap.push({ weekday: w, hour: h, value: Math.round(avg) });
    }
  }

  // ── Funnel ──
  const funnel = [
    { stage: "פניות נכנסות", value: tasks.length },
    { stage: "שויכו", value: tasks.filter((t) => t.assigneeId).length },
    { stage: "בטיפול", value: tasks.filter((t) => t.status !== "open").length },
    { stage: "נסגרו", value: doneTasks.length },
    {
      stage: "בתוך SLA",
      value: doneTasks.filter((t) => t.slaState === "ok").length,
    },
  ];

  // ── Recent tasks ──
  const recentTasks = [...tasks]
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
    .slice(0, 50);

  // ── Employee performance ──
  const branchById = new Map(branches.map((b) => [b.id, b]));
  const employeePerformance: EmployeePerformance[] = employees
    .map((e) => {
      const eTasks = tasks.filter((t) => t.assigneeId === e.id);
      const done = eTasks.filter((t) => t.status === "done");
      const open = eTasks.length - done.length;
      const okSla = eTasks.filter((t) => t.slaState === "ok").length;
      const avg =
        done.reduce((s, t) => s + (t.handlingMinutes ?? 0), 0) /
        Math.max(done.length, 1);
      return {
        employeeId: e.id,
        name: e.name,
        role: e.role,
        branchName: branchById.get(e.branchId)?.name ?? "—",
        avatarColor: e.avatarColor,
        open,
        done: done.length,
        avgHandlingMinutes: Math.round(avg),
        slaScore: eTasks.length ? Math.round((okSla / eTasks.length) * 100) : 0,
        trend: 0,
      };
    })
    .sort((a, b) => b.done - a.done);

  // ── SLA alerts ──
  const breached = tasks
    .filter((t) => t.slaState === "breached")
    .slice(0, 12);
  const slaAlerts: SLAAlert[] = breached.map((t, i) => {
    const overdue = minutesBetween(t.dueAt, new Date().toISOString()) ?? 60;
    return {
      id: `alert-${i}-${t.id}`,
      taskTitle: t.title,
      branchName: branchById.get(t.branchId)?.name ?? "—",
      assigneeName:
        employees.find((e) => e.id === t.assigneeId)?.name ?? "—",
      severity: overdue > 480 ? "high" : overdue > 180 ? "medium" : "low",
      minutesOverdue: overdue,
      occurredAt: t.dueAt,
    };
  });

  // ── Branch health ──
  const branchHealthRaw = branches.map((b) => {
    const bTasks = tasks.filter((t) => t.branchId === b.id);
    const okSla = bTasks.filter((t) => t.slaState === "ok").length;
    const breachedHere = bTasks.filter((t) => t.slaState === "breached").length;
    const done = bTasks.filter((t) => t.status === "done").length;
    const open = bTasks.length - done;
    const sla = bTasks.length
      ? Math.round((okSla / bTasks.length) * 100)
      : 92;
    const complaintsScore = Math.max(
      0,
      100 - Math.round((breachedHere / Math.max(bTasks.length, 1)) * 220),
    );
    // Inspection / maintenance / staffing / sentiment unknown from items alone.
    // Default to neutral 78 until those boards are wired up.
    const components = {
      sla,
      complaints: complaintsScore,
      inspection: 78,
      maintenance: 78,
      staffing: 78,
      sentiment: 78,
      aging: open > 0 ? Math.max(40, 100 - open * 1.2) : 95,
    };
    const score = computeHealthScore(components);
    return {
      branchId: b.id,
      branchName: b.name,
      region: b.region,
      manager: b.manager,
      score,
      previousScore: score,
      trend: 0,
      status: statusFromScore(score),
      components,
      alerts: {
        recurringIssue: false,
        slaRisk: bTasks.some(
          (t) => t.slaState === "at_risk" && t.status !== "done",
        ),
        inspectionOverdue: false,
        staffingShortage: false,
      },
    };
  });

  const rankNow = [...branchHealthRaw]
    .sort((a, b) => b.score - a.score)
    .map((b, i) => [b.branchId, i + 1] as const);
  const curRankMap = Object.fromEntries(rankNow);
  const branchHealth: BranchHealth[] = branchHealthRaw.map((b) => ({
    ...b,
    movement: (curRankMap[b.branchId] ?? 0) - (curRankMap[b.branchId] ?? 0),
  }));

  const networkScore = branchHealth.length
    ? Math.round(
        branchHealth.reduce((s, b) => s + b.score, 0) / branchHealth.length,
      )
    : 0;

  // ── Activity feed (derived from recent tickets) ──
  const activity: ActivityEvent[] = recentTasks.slice(0, 24).map((t) => {
    const branchName = branchById.get(t.branchId)?.name ?? "—";
    const ownerName =
      employees.find((e) => e.id === t.assigneeId)?.name ?? "—";
    if (t.slaState === "breached") {
      return {
        id: `act-${t.id}`,
        kind: "sla_breach",
        severity: "critical",
        title: "חריגת SLA",
        detail: t.title,
        branchId: t.branchId,
        branchName,
        ownerName,
        occurredAt: t.dueAt,
        action: { label: "טפל" },
      };
    }
    if (t.status === "done") {
      return {
        id: `act-${t.id}`,
        kind: "complaint_closed",
        severity: "low",
        title: "פניה נסגרה",
        detail: t.title,
        branchId: t.branchId,
        branchName,
        ownerName,
        occurredAt: t.resolvedAt ?? t.dueAt,
      };
    }
    return {
      id: `act-${t.id}`,
      kind: "complaint_opened",
      severity:
        t.priority === "critical" || t.priority === "high" ? "high" : "medium",
      title: "פניה חדשה",
      detail: t.title,
      branchId: t.branchId,
      branchName,
      ownerName,
      occurredAt: t.createdAt,
    };
  });

  // ── Insights (rule-based) ──
  const insights: AIInsight[] = buildInsights({
    branchScores,
    employeePerformance,
    slaCompliance,
    responseHeatmap,
    networkScore,
  });

  return {
    kpis: {
      openTasks,
      slaBreaches,
      avgHandlingMinutes: Math.round(avgHandling),
      completedToday,
      topBranch: {
        id: branchScores[0]?.branchId ?? "",
        name: branchScores[0]?.name ?? "—",
        score: branchScores[0]?.score ?? 0,
      },
      topEmployee: empScores[0] ?? { id: "", name: "—", score: 0 },
      trendOpenTasks: tasksOverTime.slice(-14),
    },
    tasksOverTime,
    slaCompliance,
    statusDistribution,
    responseHeatmap,
    funnel,
    branchRanking: branchScores,
    recentTasks,
    branches,
    employees,
    employeePerformance,
    slaAlerts,
    insights,
    branchHealth,
    activity,
    networkScore,
    networkScoreTrend: 0,
  };
}

function buildInsights(args: {
  branchScores: { branchId: string; name: string; score: number }[];
  employeePerformance: EmployeePerformance[];
  slaCompliance: TimeSeriesPoint[];
  responseHeatmap: { weekday: number; hour: number; value: number }[];
  networkScore: number;
}): AIInsight[] {
  const insights: AIInsight[] = [];
  const lastSla = args.slaCompliance.slice(-7);
  const avgSla =
    lastSla.reduce((s, p) => s + p.value, 0) / Math.max(lastSla.length, 1);
  insights.push({
    id: "ins-sla",
    kind: avgSla >= 85 ? "positive" : avgSla >= 70 ? "info" : "warning",
    importance: avgSla < 70 ? "high" : "medium",
    confidence: 0.88,
    title: `עמידת SLA ממוצעת · ${avgSla.toFixed(1)}%`,
    detail:
      avgSla >= 85
        ? "הרשת עומדת ביעדי שירות מצוינים השבוע."
        : "מומלץ להגדיל מענה בשעות העומס לשיפור עמידת SLA.",
    recommendation:
      avgSla >= 85
        ? "המשך לעקוב — אין צורך בפעולה"
        : "פתח התרעה אוטומטית לכל משימה שמתקרבת ל-90% מהזמן המוקצב",
  });
  const peak = args.responseHeatmap.reduce(
    (acc, p) => (p.value > acc.value ? p : acc),
    args.responseHeatmap[0] ?? { weekday: 0, hour: 12, value: 0 },
  );
  if (peak.value > 0) {
    insights.push({
      id: "ins-peak",
      kind: "warning",
      importance: "high",
      confidence: 0.81,
      title: `שעת עומס · ${HEBREW_DAYS[peak.weekday]} · ${peak.hour}:00`,
      detail: "ריכוז גבוה של זמני תגובה ארוכים בחלון הזמן הזה.",
      metric: `${peak.value} דקות תגובה ממוצעות`,
      recommendation: "תזמן תורנות נוספת בחלון הזה למשך 14 ימים",
    });
  }
  if (args.employeePerformance[0]) {
    const top = args.employeePerformance[0];
    insights.push({
      id: "ins-top-emp",
      kind: "info",
      importance: "low",
      confidence: 0.95,
      title: `${top.name} מוביל את הרשת`,
      detail: `${top.done} משימות הושלמו ב-${top.branchName}.`,
      recommendation: "שקול חונכות לעובדים חדשים בסניף",
    });
  }
  if (args.branchScores[0] && args.branchScores.length > 1) {
    const top = args.branchScores[0];
    const bottom = args.branchScores[args.branchScores.length - 1];
    insights.push({
      id: "ins-branch-gap",
      kind: "info",
      importance: "medium",
      confidence: 0.9,
      title: `${top.name} · סניף מוביל`,
      detail: `פער של ${top.score - bottom.score} נק' מהסניף הנמוך ביותר (${bottom.name}).`,
      recommendation: "העתק נהלים מהסניף המוביל לסניפים נמוכים",
    });
  }
  return insights;
}

function slug(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9א-ת]+/gi, "-")
    .replace(/^-+|-+$/g, "");
}

const AVATAR_COLORS = [
  "#12a9e8",
  "#3ed598",
  "#ffb454",
  "#7c6cff",
  "#ff7a6b",
  "#6fd3ff",
  "#0a8bc4",
  "#0f9b6c",
];

function avatarColor(name: string): string {
  let h = 0;
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
}
