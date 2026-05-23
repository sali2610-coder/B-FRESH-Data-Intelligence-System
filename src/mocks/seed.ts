import type {
  ActivityEvent,
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
} from "@/types/domain";
import {
  computeHealthScore,
  statusFromScore,
} from "@/lib/health";

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

  // ─── Enterprise realism profile ───
  // Bias one branch to be overloaded (real-world: one branch dragging the network)
  const OVERLOADED_BRANCH = "b-brs"; // באר שבע — high volume, low SLA
  const INACTIVE_BRANCH = "b-net";   // נתניה — quiet, suspiciously few new tickets
  const RECURRING_TITLE = "תקלה במקרר תצוגה"; // recurring equipment failure
  const RECURRING_BRANCH = OVERLOADED_BRANCH;

  function pickBranch(i: number) {
    const r = rand();
    // 32% of tasks go to overloaded branch
    if (r < 0.32) return BRANCHES.find((b) => b.id === OVERLOADED_BRANCH)!;
    // 2% to inactive branch (only old tickets — drift below)
    if (r < 0.34) return BRANCHES.find((b) => b.id === INACTIVE_BRANCH)!;
    // rest distributed across remaining 4 branches
    const remaining = BRANCHES.filter(
      (b) => b.id !== OVERLOADED_BRANCH && b.id !== INACTIVE_BRANCH,
    );
    return remaining[i % remaining.length];
  }

  function pickAge(branchId: string): number {
    // Inactive branch: only old tasks (>=10 days)
    if (branchId === INACTIVE_BRANCH) return 10 + Math.floor(rand() * 20);
    // 25% of normal tasks are recent (last 2 days) — complaint spike
    if (rand() < 0.25) return Math.floor(rand() * 2);
    return Math.floor(rand() * 30);
  }

  for (let i = 0; i < 240; i++) {
    const branch = pickBranch(i);
    const eligibleEmps = EMPLOYEES.filter((e) => e.branchId === branch.id);
    const assignee =
      eligibleEmps[Math.floor(rand() * eligibleEmps.length)] ?? EMPLOYEES[0];

    const daysAgo = pickAge(branch.id);
    const createdAt = new Date(
      now.getTime() - daysAgo * 86400000 - Math.floor(rand() * 86400000),
    );
    const dow = createdAt.getDay(); // 0=Sun..6=Sat

    // Status distribution skewed by branch health
    const statusRoll = rand();
    let status: TaskStatus;
    if (branch.id === OVERLOADED_BRANCH) {
      status =
        statusRoll < 0.45
          ? "open"
          : statusRoll < 0.7
            ? "in_progress"
            : statusRoll < 0.78
              ? "blocked"
              : "done";
    } else {
      status =
        statusRoll < 0.18
          ? "open"
          : statusRoll < 0.4
            ? "in_progress"
            : statusRoll < 0.48
              ? "blocked"
              : "done";
    }

    const dueAt = new Date(createdAt.getTime() + (4 + rand() * 96) * 3600000);
    const resolved = status === "done";
    const handlingMinutes = resolved
      ? Math.round(
          (branch.id === OVERLOADED_BRANCH ? 60 : 15) + rand() * 600,
        )
      : undefined;

    // SLA state: overloaded branch breaches more; weekends (Fri=5, Sat=6) breach more
    const slaRoll = rand();
    const breachBoost =
      (branch.id === OVERLOADED_BRANCH ? 0.18 : 0) +
      (dow === 5 || dow === 6 ? 0.1 : 0) +
      // Recent 2-day breach spike
      (daysAgo <= 1 ? 0.08 : 0);
    const slaState =
      slaRoll < 0.62 - breachBoost
        ? "ok"
        : slaRoll < 0.82 - breachBoost / 2
          ? "at_risk"
          : "breached";

    // Recurring failure: 30% of overloaded branch tasks get the same equipment title
    const isRecurring =
      branch.id === RECURRING_BRANCH && rand() < 0.3;
    const title = isRecurring
      ? RECURRING_TITLE
      : TITLES[Math.floor(rand() * TITLES.length)];

    const pr = rand();
    const priority =
      pr < 0.45 ? "medium" : pr < 0.78 ? "high" : pr < 0.93 ? "low" : "critical";

    tasks.push({
      id: `t-${1000 + i}`,
      title,
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
    const dow = day.getDay();
    const key = day.toISOString().slice(0, 10);
    const dayTasks = tasks.filter((t) => t.createdAt.slice(0, 10) === key);
    // Weekend anomaly: Fri/Sat see ~12% fewer tickets but lower SLA compliance
    const weekendPenalty = dow === 5 || dow === 6 ? -6 : 0;
    tasksOverTime.push({ date: key, value: dayTasks.length });
    const okCount = dayTasks.filter((t) => t.slaState === "ok").length;
    slaCompliance.push({
      date: key,
      value: dayTasks.length
        ? Math.max(
            55,
            Math.round((okCount / dayTasks.length) * 1000) / 10 + weekendPenalty,
          )
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

  // ───────── Branch Health Engine ─────────
  const branchHealthRaw = BRANCHES.map((b) => {
    const bTasks = tasks.filter((t) => t.branchId === b.id);
    const okSla = bTasks.filter((t) => t.slaState === "ok").length;
    const breached = bTasks.filter((t) => t.slaState === "breached").length;
    const done = bTasks.filter((t) => t.status === "done").length;
    const open = bTasks.length - done;
    const recurring = bTasks.length > 0 ? rand() < 0.35 : false;

    const sla = bTasks.length
      ? Math.round((okSla / bTasks.length) * 100)
      : 92;
    const complaintsScore = Math.max(
      0,
      100 - Math.round((breached / Math.max(bTasks.length, 1)) * 220),
    );
    const inspection = Math.round(72 + rand() * 26);
    const maintenance = Math.round(70 + rand() * 28);
    const staffing = Math.round(65 + rand() * 30);
    const sentiment = Math.round(70 + rand() * 28);
    const aging = open > 0 ? Math.max(40, 100 - open * 1.2) : 95;

    const components = {
      sla,
      complaints: complaintsScore,
      inspection,
      maintenance,
      staffing,
      sentiment,
      aging,
    };

    const score = computeHealthScore(components);
    const previousScore = Math.max(
      20,
      Math.min(100, score + Math.round((rand() - 0.5) * 14)),
    );
    const trend = previousScore
      ? Math.round(((score - previousScore) / previousScore) * 1000) / 10
      : 0;

    return {
      branchId: b.id,
      branchName: b.name,
      region: b.region,
      manager: b.manager,
      score,
      previousScore,
      trend,
      status: statusFromScore(score),
      components,
      alerts: {
        recurringIssue: recurring,
        slaRisk: bTasks.some(
          (t) => t.slaState === "at_risk" && t.status !== "done",
        ),
        inspectionOverdue: inspection < 78 && rand() < 0.5,
        staffingShortage: staffing < 75 && rand() < 0.5,
      },
    };
  });

  // Sort by current score → derive rank movement vs previous
  const currentRank = [...branchHealthRaw]
    .sort((a, b) => b.score - a.score)
    .map((b, i) => [b.branchId, i + 1] as const);
  const previousRank = [...branchHealthRaw]
    .sort((a, b) => b.previousScore - a.previousScore)
    .map((b, i) => [b.branchId, i + 1] as const);
  const curRankMap = Object.fromEntries(currentRank);
  const prevRankMap = Object.fromEntries(previousRank);

  const branchHealth: BranchHealth[] = branchHealthRaw.map((b) => ({
    ...b,
    movement: (prevRankMap[b.branchId] ?? 0) - (curRankMap[b.branchId] ?? 0),
  }));

  const networkScore = Math.round(
    branchHealth.reduce((s, b) => s + b.score, 0) /
      Math.max(branchHealth.length, 1),
  );
  const networkPrev = Math.round(
    branchHealth.reduce((s, b) => s + b.previousScore, 0) /
      Math.max(branchHealth.length, 1),
  );
  const networkScoreTrend = networkPrev
    ? Math.round(((networkScore - networkPrev) / networkPrev) * 1000) / 10
    : 0;

  // ───────── Activity Feed ─────────
  const ACTIVITY_TEMPLATES: {
    kind: ActivityEvent["kind"];
    title: string;
    severity: ActivitySeverity;
    detail?: string;
  }[] = [
    {
      kind: "sla_breach",
      title: "חריגת SLA חמורה",
      severity: "critical",
      detail: "המשימה עברה את חלון הזמן המותר",
    },
    {
      kind: "complaint_opened",
      title: "תלונת לקוח חדשה",
      severity: "high",
      detail: "פנייה דחופה דרך וואטסאפ",
    },
    {
      kind: "maintenance_call",
      title: "קריאת שירות פתוחה",
      severity: "medium",
      detail: "ספק יצא לטיפול",
    },
    {
      kind: "technician_delay",
      title: "טכנאי באיחור",
      severity: "high",
      detail: "השהיה של 45 דקות מעבר ליעד",
    },
    {
      kind: "branch_outage",
      title: "סניף לא מקוון",
      severity: "critical",
      detail: "תקלת תקשורת זוהתה",
    },
    {
      kind: "marketing_launch",
      title: "השקת קמפיין",
      severity: "info",
      detail: "קופון חדש נשלח לחברי מועדון",
    },
    {
      kind: "recruitment_spike",
      title: "זינוק במועמדויות",
      severity: "info",
      detail: "5 מועמדים חדשים ב-24 שעות",
    },
    {
      kind: "franchise_lead",
      title: "ליד זכיינות חדש",
      severity: "info",
      detail: "פגישת היכרות תוזמנה",
    },
    {
      kind: "inspection_completed",
      title: "ביקורת הושלמה",
      severity: "low",
      detail: "ציון 92 · 2 הערות פעולה",
    },
    {
      kind: "complaint_closed",
      title: "תלונה נסגרה",
      severity: "low",
      detail: "פתרון תוך 2 שעות · CSAT 4.6",
    },
  ];

  const activity: ActivityEvent[] = Array.from({ length: 28 }).map((_, i) => {
    const tpl = ACTIVITY_TEMPLATES[
      Math.floor(rand() * ACTIVITY_TEMPLATES.length)
    ];
    const branch = BRANCHES[Math.floor(rand() * BRANCHES.length)];
    const emp = EMPLOYEES[Math.floor(rand() * EMPLOYEES.length)];
    const minutesAgo = Math.round(i * 6 + rand() * 12);
    return {
      id: `act-${i}-${tpl.kind}`,
      kind: tpl.kind,
      severity: tpl.severity,
      title: tpl.title,
      detail: tpl.detail,
      branchId: branch.id,
      branchName: branch.name,
      ownerName: emp.name,
      occurredAt: new Date(now.getTime() - minutesAgo * 60_000).toISOString(),
      action:
        tpl.severity === "critical" || tpl.severity === "high"
          ? { label: "טפל" }
          : tpl.kind === "franchise_lead"
            ? { label: "פתח ליד" }
            : undefined,
    };
  });

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
      importance: Math.abs(weekDelta) > 15 ? "high" : "medium",
      confidence: 0.92,
      title:
        weekDelta < 0
          ? `שיפור בנפח השבוע · ${Math.abs(weekDelta)}% פחות פניות`
          : `עלייה בנפח השבוע · ${weekDelta}% יותר פניות`,
      detail:
        weekDelta < 0
          ? "ירידה במספר הפניות הנכנסות לעומת השבוע הקודם — סימן חיובי לעומסים."
          : "מומלץ לבחון תוספת כוח אדם או שינוי בתורנויות לשעות עומס.",
      recommendation:
        weekDelta < 0
          ? "שמור על קצב הסגירות הנוכחי וצמצם תורנות מיותרת"
          : "הוסף נציג אחד לחלון 18:00-21:00",
      metric: `${lastTotal} פניות · 7 ימים`,
    },
    {
      id: "ins-2",
      kind: avgSla >= 85 ? "positive" : avgSla >= 70 ? "info" : "warning",
      importance: avgSla < 70 ? "high" : "medium",
      confidence: 0.88,
      title: `עמידת SLA ממוצעת · ${avgSla.toFixed(1)}%`,
      detail:
        avgSla >= 85
          ? "הרשת עומדת ביעדי שירות מצוינים השבוע."
          : "מומלץ להגדיל מענה בשעות 18:00-21:00 כדי לשפר עמידה ב-SLA.",
      recommendation:
        avgSla >= 85
          ? "המשך לעקוב — אין צורך בפעולה"
          : "פתח התרעה אוטומטית לכל משימה שמתקרבת ל-90% מהזמן המוקצב",
    },
    {
      id: "ins-3",
      kind: "info",
      importance: "low",
      confidence: 0.95,
      title: `${topEmp.name} מוביל את הרשת`,
      detail: `${topEmp.done} משימות הושלמו (${topEmp.branchName}). ביצועיו גבוהים ב-${Math.max(
        12,
        Math.abs(topEmp.trend),
      )}% מהממוצע.`,
      recommendation: "שקול מתן חונכות לעובדים חדשים בסניף",
    },
    {
      id: "ins-4",
      kind: "warning",
      importance: "high",
      confidence: 0.81,
      title: `שעת עומס מזוהה · ${HEBREW_DAYS[peakHour.weekday]} · ${peakHour.hour}:00`,
      detail:
        "ריכוז גבוה של זמני תגובה ארוכים. שקול הוספת נציג נוסף בחלון הזמן הזה.",
      recommendation: "תזמן תורנות נוספת בחלון הזמן הזה למשך 14 ימים",
      metric: `${peakHour.value} דקות תגובה ממוצעות`,
    },
    {
      id: "ins-5",
      kind: branchScores[0].score >= 85 ? "positive" : "info",
      importance: "medium",
      confidence: 0.9,
      title: `${branchScores[0].name} · סניף מוביל ברשת`,
      detail: `ציון עמידה ב-SLA ${branchScores[0].score}% — ${branchScores[branchScores.length - 1].score}% בסניף הנמוך ביותר. פער של ${branchScores[0].score - branchScores[branchScores.length - 1].score} נק'.`,
      recommendation: "העתק נהלים מהסניף המוביל לסניפים נמוכים יותר",
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
    branchHealth,
    activity,
    networkScore,
    networkScoreTrend,
  };
}

export const BRANCHES_MOCK = BRANCHES;
export const EMPLOYEES_MOCK = EMPLOYEES;
