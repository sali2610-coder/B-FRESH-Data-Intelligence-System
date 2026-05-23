import type {
  AIInsight,
  Branch,
  DashboardData,
  Employee,
  EmployeePerformance,
  SLAAlert,
  Task,
  TaskStatus,
} from "@/types/domain";

const BRANCHES: Branch[] = [
  { id: "b-tlv", name: "תל אביב מרכז", region: "center", manager: "אורי לוי" },
  { id: "b-hfa", name: "חיפה כרמל", region: "north", manager: "מאיה רוזן" },
  { id: "b-jer", name: "ירושלים גרמן", region: "center", manager: "דנה כהן" },
  { id: "b-brs", name: "באר שבע", region: "south", manager: "יוסי בן דוד" },
  { id: "b-rmt", name: "רמת גן", region: "center", manager: "ליאור פרץ" },
  { id: "b-net", name: "נתניה", region: "center", manager: "שירה אבני" },
];

const EMPLOYEES: Employee[] = [
  { id: "e-001", name: "נועה ברק", role: "מנהלת משמרת", branchId: "b-tlv", avatarColor: "#2563eb" },
  { id: "e-002", name: "איתי כץ", role: "נציג שירות", branchId: "b-tlv", avatarColor: "#16a34a" },
  { id: "e-003", name: "שני אזולאי", role: "אחראית תפעול", branchId: "b-hfa", avatarColor: "#db2777" },
  { id: "e-004", name: "עומר חזן", role: "טכנאי שטח", branchId: "b-hfa", avatarColor: "#7c3aed" },
  { id: "e-005", name: "מאי הררי", role: "מנהלת סניף", branchId: "b-jer", avatarColor: "#ea580c" },
  { id: "e-006", name: "רוני נחום", role: "נציג שירות", branchId: "b-brs", avatarColor: "#0891b2" },
  { id: "e-007", name: "אדם מזרחי", role: "מנהל אזור", branchId: "b-rmt", avatarColor: "#65a30d" },
  { id: "e-008", name: "ליאן צור", role: "אחראית בקרה", branchId: "b-net", avatarColor: "#9333ea" },
];

function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const STATUSES: TaskStatus[] = ["open", "in_progress", "blocked", "done"];
const TITLES = [
  "תקלה במקרר תצוגה",
  "חוסר במלאי סלטים",
  "תלונת לקוח על זמן הגשה",
  "ניקיון כללי לפני סגירה",
  "החלפת תפריט שבועי",
  "כשל במערכת הקופה",
  "תיאום משלוח עם ספק",
  "חידוש רישיון עסק",
  "בדיקת איכות מוצרים",
  "תקלת תקשורת בעמדה",
  "ביקורת בריאות",
  "פנייה לדרושים",
];

export function generateDashboardData(seed = 42): DashboardData {
  const rand = mulberry32(seed);
  const now = new Date();
  const tasks: Task[] = [];

  for (let i = 0; i < 220; i++) {
    const branch = BRANCHES[Math.floor(rand() * BRANCHES.length)];
    const eligibleEmps = EMPLOYEES.filter((e) => e.branchId === branch.id);
    const assignee =
      eligibleEmps[Math.floor(rand() * eligibleEmps.length)] ?? EMPLOYEES[0];
    const status = STATUSES[Math.floor(rand() * STATUSES.length)];
    const createdAt = new Date(
      now.getTime() - Math.floor(rand() * 30) * 86400000 - Math.floor(rand() * 86400000),
    );
    const dueAt = new Date(createdAt.getTime() + (4 + rand() * 96) * 3600000);
    const resolved = status === "done";
    const handlingMinutes = resolved ? Math.round(15 + rand() * 600) : undefined;
    const r = rand();
    const slaState = r < 0.7 ? "ok" : r < 0.88 ? "at_risk" : "breached";
    const pr = rand();
    const priority =
      pr < 0.5 ? "medium" : pr < 0.8 ? "high" : pr < 0.95 ? "low" : "critical";

    tasks.push({
      id: `t-${1000 + i}`,
      title: TITLES[Math.floor(rand() * TITLES.length)],
      status,
      priority,
      slaState,
      branchId: branch.id,
      assigneeId: assignee.id,
      createdAt: createdAt.toISOString(),
      dueAt: dueAt.toISOString(),
      resolvedAt: resolved
        ? new Date(createdAt.getTime() + (handlingMinutes ?? 60) * 60000).toISOString()
        : undefined,
      handlingMinutes,
      mondayItemId: 9000000 + i,
    });
  }

  const openTasks = tasks.filter((t) => t.status !== "done").length;
  const slaBreaches = tasks.filter((t) => t.slaState === "breached").length;
  const doneTasks = tasks.filter((t) => t.status === "done");
  const avgHandling =
    doneTasks.reduce((s, t) => s + (t.handlingMinutes ?? 0), 0) /
    Math.max(doneTasks.length, 1);
  const todayKey = now.toISOString().slice(0, 10);
  const completedToday = tasks.filter(
    (t) => t.resolvedAt?.slice(0, 10) === todayKey,
  ).length;

  const branchScores = BRANCHES.map((b) => {
    const bTasks = tasks.filter((t) => t.branchId === b.id);
    const ok = bTasks.filter((t) => t.slaState === "ok").length;
    const score = bTasks.length ? Math.round((ok / bTasks.length) * 100) : 0;
    return { branchId: b.id, name: b.name, score };
  }).sort((a, b) => b.score - a.score);

  const empScores = EMPLOYEES.map((e) => {
    const eTasks = tasks.filter((t) => t.assigneeId === e.id);
    const done = eTasks.filter((t) => t.status === "done").length;
    return { id: e.id, name: e.name, score: done };
  }).sort((a, b) => b.score - a.score);

  const tasksOverTime: { date: string; value: number }[] = [];
  const slaCompliance: { date: string; value: number }[] = [];
  for (let d = 29; d >= 0; d--) {
    const day = new Date(now.getTime() - d * 86400000);
    const key = day.toISOString().slice(0, 10);
    const dayTasks = tasks.filter((t) => t.createdAt.slice(0, 10) === key);
    tasksOverTime.push({ date: key, value: dayTasks.length });
    const okCount = dayTasks.filter((t) => t.slaState === "ok").length;
    slaCompliance.push({
      date: key,
      value: dayTasks.length
        ? Math.round((okCount / dayTasks.length) * 1000) / 10
        : 90 + Math.round(rand() * 8),
    });
  }

  const statusDistribution = STATUSES.map((s) => ({
    status: s,
    count: tasks.filter((t) => t.status === s).length,
  }));

  const responseHeatmap: { weekday: number; hour: number; value: number }[] = [];
  for (let w = 0; w < 7; w++) {
    for (let h = 7; h < 23; h++) {
      const peak = h >= 12 && h <= 14 ? 1.4 : h >= 18 && h <= 21 ? 1.7 : 1;
      const weekend = w === 5 ? 0.5 : w === 6 ? 1.2 : 1;
      responseHeatmap.push({
        weekday: w,
        hour: h,
        value: Math.round((20 + rand() * 35) * peak * weekend),
      });
    }
  }

  const funnel = [
    { stage: "פניות נכנסות", value: tasks.length },
    { stage: "שויכו", value: tasks.filter((t) => t.assigneeId).length },
    { stage: "בטיפול", value: tasks.filter((t) => t.status !== "open").length },
    { stage: "נסגרו", value: doneTasks.length },
    { stage: "בתוך SLA", value: doneTasks.filter((t) => t.slaState === "ok").length },
  ];

  const recentTasks = [...tasks]
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
    .slice(0, 50);

  const branchById = Object.fromEntries(BRANCHES.map((b) => [b.id, b]));

  const employeePerformance: EmployeePerformance[] = EMPLOYEES.map((e) => {
    const eTasks = tasks.filter((t) => t.assigneeId === e.id);
    const done = eTasks.filter((t) => t.status === "done");
    const open = eTasks.filter((t) => t.status !== "done").length;
    const okSla = eTasks.filter((t) => t.slaState === "ok").length;
    const avg =
      done.reduce((s, t) => s + (t.handlingMinutes ?? 0), 0) /
      Math.max(done.length, 1);
    return {
      employeeId: e.id,
      name: e.name,
      role: e.role,
      branchName: branchById[e.branchId]?.name ?? "—",
      avatarColor: e.avatarColor,
      open,
      done: done.length,
      avgHandlingMinutes: Math.round(avg),
      slaScore: eTasks.length ? Math.round((okSla / eTasks.length) * 100) : 0,
      trend: Math.round((rand() - 0.4) * 30),
    };
  }).sort((a, b) => b.done - a.done);

  const breached = tasks.filter((t) => t.slaState === "breached").slice(0, 8);
  const slaAlerts: SLAAlert[] = breached.map((t, idx) => {
    const overdue = Math.round(60 + rand() * 720);
    const sev: SLAAlert["severity"] =
      overdue > 480 ? "high" : overdue > 180 ? "medium" : "low";
    const emp = EMPLOYEES.find((e) => e.id === t.assigneeId);
    return {
      id: `alert-${idx}-${t.id}`,
      taskTitle: t.title,
      branchName: branchById[t.branchId]?.name ?? "—",
      assigneeName: emp?.name ?? "—",
      severity: sev,
      minutesOverdue: overdue,
      occurredAt: t.dueAt,
    };
  });

  const lastTotal = tasksOverTime.slice(-7).reduce((s, p) => s + p.value, 0);
  const prevTotal = tasksOverTime.slice(-14, -7).reduce((s, p) => s + p.value, 0);
  const weekDelta = prevTotal
    ? Math.round(((lastTotal - prevTotal) / prevTotal) * 100)
    : 0;
  const lastSla = slaCompliance.slice(-7);
  const avgSla =
    lastSla.reduce((s, p) => s + p.value, 0) / Math.max(lastSla.length, 1);
  const topEmp = employeePerformance[0];
  const peakHour = responseHeatmap.reduce(
    (acc, p) => (p.value > acc.value ? p : acc),
    responseHeatmap[0],
  );
  const HEBREW_DAYS = ["א'", "ב'", "ג'", "ד'", "ה'", "ו'", "שבת"];

  const insights: AIInsight[] = [
    {
      id: "ins-1",
      kind: weekDelta < 0 ? "positive" : "warning",
      title:
        weekDelta < 0
          ? `שיפור בנפח השבוע · ${Math.abs(weekDelta)}% פחות פניות`
          : `עלייה בנפח השבוע · ${weekDelta}% יותר פניות`,
      detail:
        weekDelta < 0
          ? "ירידה במספר הפניות הנכנסות לעומת השבוע הקודם — סימן חיובי לעומסים."
          : "מומלץ לבחון תוספת כוח אדם או שינוי בתורנויות לשעות עומס.",
      metric: `${lastTotal} פניות · 7 ימים`,
    },
    {
      id: "ins-2",
      kind: avgSla >= 85 ? "positive" : avgSla >= 70 ? "info" : "warning",
      title: `עמידת SLA ממוצעת · ${avgSla.toFixed(1)}%`,
      detail:
        avgSla >= 85
          ? "הרשת עומדת ביעדי שירות מצוינים השבוע."
          : "מומלץ להגדיל מענה בשעות 18:00-21:00 כדי לשפר עמידה ב-SLA.",
    },
    {
      id: "ins-3",
      kind: "info",
      title: `${topEmp.name} מוביל את הרשת`,
      detail: `${topEmp.done} משימות הושלמו (${topEmp.branchName}). ביצועיו גבוהים ב-${Math.max(
        12,
        Math.abs(topEmp.trend),
      )}% מהממוצע.`,
    },
    {
      id: "ins-4",
      kind: "warning",
      title: `שעת עומס מזוהה · ${HEBREW_DAYS[peakHour.weekday]} · ${peakHour.hour}:00`,
      detail:
        "ריכוז גבוה של זמני תגובה ארוכים. שקול הוספת נציג נוסף בחלון הזמן הזה.",
      metric: `${peakHour.value} דקות תגובה ממוצעות`,
    },
    {
      id: "ins-5",
      kind: branchScores[0].score >= 85 ? "positive" : "info",
      title: `${branchScores[0].name} · סניף מוביל ברשת`,
      detail: `ציון עמידה ב-SLA ${branchScores[0].score}% — ${branchScores[branchScores.length - 1].score}% בסניף הנמוך ביותר. פער של ${branchScores[0].score - branchScores[branchScores.length - 1].score} נק'.`,
    },
  ];

  return {
    kpis: {
      openTasks,
      slaBreaches,
      avgHandlingMinutes: Math.round(avgHandling),
      completedToday,
      topBranch: {
        id: branchScores[0].branchId,
        name: branchScores[0].name,
        score: branchScores[0].score,
      },
      topEmployee: empScores[0],
      trendOpenTasks: tasksOverTime.slice(-14),
    },
    tasksOverTime,
    slaCompliance,
    statusDistribution,
    responseHeatmap,
    funnel,
    branchRanking: branchScores,
    recentTasks,
    branches: BRANCHES,
    employees: EMPLOYEES,
    employeePerformance,
    slaAlerts,
    insights,
  };
}

export const BRANCHES_MOCK = BRANCHES;
export const EMPLOYEES_MOCK = EMPLOYEES;
