import type {
  BranchProfile,
  BranchTimelineItem,
  DashboardData,
} from "@/types/domain";

const CATEGORIES = [
  "שירות בעמדה",
  "איכות מוצר",
  "זמני המתנה",
  "תקלה בעמדת תשלום",
  "חיובים",
  "מועדון לקוחות",
  "החזרים",
  "בקשת מידע",
];

const SUPPLIERS = [
  "קולקס שירות",
  "מקררי הצפון",
  "מחשוב בקופה",
  "תחזוקת מבנים בע״מ",
  "אלקטרו פלוס",
];

const TIMELINE_TITLES = {
  complaint_opened: "תלונה חדשה התקבלה",
  complaint_closed: "תלונה נסגרה בהצלחה",
  sla_breach: "חריגה ב-SLA",
  maintenance_call: "קריאת שירות נפתחה",
  technician_delay: "טכנאי באיחור",
  branch_outage: "תקלת תקשורת",
  marketing_launch: "השקת קמפיין",
  recruitment_spike: "זינוק במועמדויות",
  franchise_lead: "ליד זכיינות",
  inspection_completed: "ביקורת תקופתית",
  inspection: "ביקורת תקופתית",
  note: "הערת מנהל",
} as const;

function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function generateBranchProfile(
  data: DashboardData,
  branchId: string,
): BranchProfile | null {
  const branch = data.branches.find((b) => b.id === branchId);
  if (!branch) return null;

  const health = data.branchHealth.find((h) => h.branchId === branchId);
  if (!health) return null;

  const tickets = data.recentTasks.filter((t) => t.branchId === branchId);
  const seed = branchId
    .split("")
    .reduce((a, c) => a + c.charCodeAt(0), 17);
  const rand = mulberry32(seed);

  // ticket + sla trends over 30 days (reuse network trend shape, scale by branch)
  const factor = 0.7 + rand() * 0.6;
  const ticketTrend = data.tasksOverTime.map((p) => ({
    date: p.date,
    value: Math.max(0, Math.round(p.value * factor * 0.18)),
  }));
  const slaBase = health.score >= 80 ? 88 : health.score >= 65 ? 78 : 64;
  const slaTrend = data.slaCompliance.map((p, i) => ({
    date: p.date,
    value: Math.max(
      45,
      Math.min(
        99,
        slaBase + Math.sin(i / 4) * 4 + (rand() - 0.5) * 8,
      ),
    ),
  }));

  const complaintsByCategory = CATEGORIES.slice(
    0,
    5 + Math.floor(rand() * 3),
  ).map((category) => ({
    category,
    count: Math.round(2 + rand() * 12),
  }));

  const maintenanceHistory = Array.from({
    length: 5 + Math.floor(rand() * 4),
  }).map((_, i) => {
    const occurred = new Date(
      Date.now() - (i * 5 + Math.floor(rand() * 4)) * 86400000,
    );
    return {
      id: `m-${branchId}-${i}`,
      title:
        i % 3 === 0
          ? "תקלה במקרר תצוגה"
          : i % 3 === 1
            ? "כשל בקופה"
            : "תחזוקת מערכת מיזוג",
      supplier: SUPPLIERS[Math.floor(rand() * SUPPLIERS.length)],
      occurredAt: occurred.toISOString(),
      resolvedAt: new Date(
        occurred.getTime() + (3 + rand() * 24) * 3600000,
      ).toISOString(),
      cost: Math.round(450 + rand() * 2600),
    };
  });

  const inspections = Array.from({ length: 4 }).map((_, i) => ({
    id: `ins-${branchId}-${i}`,
    date: new Date(Date.now() - (i + 1) * 30 * 86400000).toISOString(),
    score: Math.round(72 + rand() * 26),
    findings: Math.floor(rand() * 6),
    inspector: ["דנה אבני", "אורי לוי", "שירה כהן"][Math.floor(rand() * 3)],
  }));

  const staffing = {
    headcount: 12 + Math.floor(rand() * 6),
    target: 18,
    openReqs: Math.max(0, 4 - Math.floor(rand() * 5)),
    avgTenureMonths: Math.round((12 + rand() * 30) * 10) / 10,
  };

  const csat = {
    score: Math.round((3.8 + rand() * 1.1) * 10) / 10,
    trend: slaTrend.map((p) => ({
      date: p.date,
      value: Math.round((3.6 + (p.value / 100) * 1.2) * 10) / 10,
    })),
  };

  // Build timeline from branch tickets + inspections + maintenance
  const timeline: BranchTimelineItem[] = [];
  tickets.slice(0, 8).forEach((t) =>
    timeline.push({
      id: `tl-t-${t.id}`,
      kind:
        t.slaState === "breached"
          ? "sla_breach"
          : t.status === "done"
            ? "complaint_closed"
            : "complaint_opened",
      title:
        t.slaState === "breached"
          ? `חריגת SLA · ${t.title}`
          : t.status === "done"
            ? `נסגר · ${t.title}`
            : `פניה חדשה · ${t.title}`,
      detail: `#${t.mondayItemId}`,
      occurredAt: t.createdAt,
      severity:
        t.slaState === "breached"
          ? "critical"
          : t.status === "done"
            ? "low"
            : "medium",
    }),
  );
  maintenanceHistory.slice(0, 3).forEach((m) =>
    timeline.push({
      id: `tl-m-${m.id}`,
      kind: "maintenance_call",
      title: m.title,
      detail: m.supplier,
      occurredAt: m.occurredAt,
      severity: "medium",
    }),
  );
  inspections.slice(0, 2).forEach((ins) =>
    timeline.push({
      id: `tl-i-${ins.id}`,
      kind: "inspection",
      title: `${TIMELINE_TITLES.inspection} · ציון ${ins.score}`,
      detail: `${ins.findings} ממצאים · ${ins.inspector}`,
      occurredAt: ins.date,
      severity: ins.score >= 85 ? "low" : "medium",
    }),
  );
  timeline.sort((a, b) => (a.occurredAt < b.occurredAt ? 1 : -1));

  const recommendations = data.insights.slice(0, 3).map((ins, i) => ({
    ...ins,
    id: `rec-${branchId}-${i}`,
  }));

  const similar = [...data.branchHealth]
    .filter((b) => b.region === branch.region && b.branchId !== branchId)
    .sort((a, b) => Math.abs(a.score - health.score) - Math.abs(b.score - health.score))
    .slice(0, 3);

  return {
    branch,
    health,
    manager: {
      name: branch.manager,
      phone: "*9001",
      email: `${branch.id}@b-fresh.local`,
    },
    tickets,
    ticketTrend,
    slaTrend,
    complaintsByCategory,
    maintenanceHistory,
    inspections,
    staffing,
    csat,
    timeline,
    recommendations,
    similarBranches: similar,
  };
}
