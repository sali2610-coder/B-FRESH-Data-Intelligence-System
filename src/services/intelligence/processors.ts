import "server-only";

import { computeHealthScore, statusFromScore } from "@/lib/health";
import {
  derivedProvenance,
  type AlertEntity,
  type BranchEntity,
  type ComplaintEntity,
  type EmployeeEntity,
  type InsightEntity,
  type InspectionEntity,
  type MaintenanceEntity,
  type Region,
  type SLAEventEntity,
  type TicketLikeEntity,
} from "@/domain";
import type {
  BranchHealthEntry,
  ComplaintMetrics,
  ComplaintSpike,
  EmployeeOverload,
  EscalationEvent,
  RecurringFailure,
  RegionalTrend,
  StaffingShortage,
} from "./types";

const HEBREW_DAYS = ["א'", "ב'", "ג'", "ד'", "ה'", "ו'", "שבת"];

/* ─── SLA processor ─── */
export function detectSLAEvents(
  tickets: TicketLikeEntity[],
): SLAEventEntity[] {
  const now = Date.now();
  return tickets
    .filter((t) => t.slaState === "breached")
    .map((t) => {
      const due = t.dueAt ? new Date(t.dueAt).getTime() : now;
      const overdue = Math.max(0, Math.round((now - due) / 60_000));
      const severity =
        overdue > 480
          ? "critical"
          : overdue > 240
            ? "high"
            : overdue > 60
              ? "medium"
              : "low";
      return {
        type: "sla_event",
        id: `sla-${t.type}-${t.id}`,
        ticketId: t.id,
        ticketType: t.type,
        branchId: t.branchId,
        severity,
        minutesOverdue: overdue,
        occurredAt: t.dueAt ?? t.createdAt,
        provenance: derivedProvenance("sla.detectBreaches", [
          { entityType: t.type, ids: [t.id] },
        ]),
      } satisfies SLAEventEntity;
    });
}

/* ─── Complaint spikes processor ─── */
export function detectComplaintSpikes(
  branches: BranchEntity[],
  complaints: ComplaintEntity[],
  windowDays = 7,
): ComplaintSpike[] {
  const now = Date.now();
  const windowMs = windowDays * 86400000;
  const out: ComplaintSpike[] = [];
  for (const b of branches) {
    const all = complaints.filter((c) => c.branchId === b.id);
    if (all.length < 8) continue;
    const recent = all.filter(
      (c) => now - new Date(c.createdAt).getTime() <= windowMs,
    );
    const earlier = all.filter(
      (c) => now - new Date(c.createdAt).getTime() > windowMs,
    );
    const recentDaily = recent.length / windowDays;
    const earlierDaily = earlier.length / Math.max(1, 23); // 23 day baseline (30 - 7)
    if (earlierDaily === 0 && recentDaily === 0) continue;
    const delta = earlierDaily
      ? ((recentDaily - earlierDaily) / earlierDaily) * 100
      : 100;
    if (delta < 25) continue;
    out.push({
      branchId: b.id,
      branchName: b.name,
      windowDays,
      baselineDaily: Number(earlierDaily.toFixed(2)),
      recentDaily: Number(recentDaily.toFixed(2)),
      delta: Math.round(delta),
      severity: delta > 80 ? "high" : delta > 50 ? "medium" : "low",
    });
  }
  return out.sort((a, b) => b.delta - a.delta);
}

/* ─── Recurring failure processor ─── */
const NORM_RE = /[^֐-׿a-zA-Z0-9]+/g;
function signature(title: string): string {
  return title.replace(NORM_RE, " ").trim().slice(0, 64);
}

export function detectRecurringFailures(
  branches: BranchEntity[],
  maintenance: MaintenanceEntity[],
  windowDays = 30,
  minOccurrences = 3,
): RecurringFailure[] {
  const now = Date.now();
  const windowMs = windowDays * 86400000;
  const out: RecurringFailure[] = [];
  for (const b of branches) {
    const items = maintenance.filter(
      (m) =>
        m.branchId === b.id &&
        now - new Date(m.createdAt).getTime() <= windowMs,
    );
    const buckets = new Map<string, MaintenanceEntity[]>();
    for (const it of items) {
      const sig = signature(it.equipment ?? it.title);
      const arr = buckets.get(sig) ?? [];
      arr.push(it);
      buckets.set(sig, arr);
    }
    for (const [sig, arr] of buckets) {
      if (arr.length < minOccurrences) continue;
      out.push({
        branchId: b.id,
        branchName: b.name,
        signature: sig,
        occurrences: arr.length,
        windowDays,
        lastOccurredAt: arr
          .map((x) => x.createdAt)
          .sort()
          .slice(-1)[0],
      });
    }
  }
  return out.sort((a, b) => b.occurrences - a.occurrences);
}

/* ─── Staffing shortage processor ─── */
export function detectStaffingShortages(
  branches: BranchEntity[],
  employees: EmployeeEntity[],
  tickets: TicketLikeEntity[],
): StaffingShortage[] {
  const out: StaffingShortage[] = [];
  for (const b of branches) {
    const empCount = employees.filter((e) => e.branchId === b.id).length;
    const openTickets = tickets.filter(
      (t) => t.branchId === b.id && t.status !== "done",
    ).length;
    if (empCount === 0 && openTickets === 0) continue;
    const ratio = empCount > 0 ? openTickets / empCount : openTickets;
    if (ratio < 3) continue;
    out.push({
      branchId: b.id,
      branchName: b.name,
      openTicketsPerEmployee: Number(ratio.toFixed(1)),
      severity: ratio > 8 ? "high" : ratio > 5 ? "medium" : "low",
    });
  }
  return out.sort(
    (a, b) => b.openTicketsPerEmployee - a.openTicketsPerEmployee,
  );
}

/* ─── Employee overload processor ─── */
export function detectEmployeeOverload(
  employees: EmployeeEntity[],
  tickets: TicketLikeEntity[],
): EmployeeOverload[] {
  const out: EmployeeOverload[] = [];
  for (const e of employees) {
    const eTickets = tickets.filter((t) => t.assigneeId === e.id);
    const open = eTickets.filter((t) => t.status !== "done").length;
    const breached = eTickets.filter((t) => t.slaState === "breached").length;
    if (open < 8 && breached < 3) continue;
    out.push({
      employeeId: e.id,
      name: e.name,
      branchId: e.branchId,
      openTickets: open,
      breachedTickets: breached,
      severity:
        breached >= 5 || open >= 20
          ? "high"
          : breached >= 3 || open >= 12
            ? "medium"
            : "low",
    });
  }
  return out.sort((a, b) => b.openTickets - a.openTickets);
}

/* ─── Regional trends processor ─── */
export function computeRegionalTrends(
  branches: BranchEntity[],
  branchHealth: BranchHealthEntry[],
): RegionalTrend[] {
  const regions: Region[] = ["north", "center", "south"];
  return regions
    .map((region) => {
      const inRegion = branchHealth.filter((h) => h.region === region);
      if (inRegion.length === 0) return null;
      const avgHealth = Math.round(
        inRegion.reduce((s, h) => s + h.score, 0) / inRegion.length,
      );
      const slaCompliance = Math.round(
        inRegion.reduce((s, h) => s + h.components.sla, 0) / inRegion.length,
      );
      const trend = Math.round(
        inRegion.reduce((s, h) => s + h.trend, 0) / inRegion.length,
      );
      return {
        region,
        branchCount: branches.filter((b) => b.region === region).length,
        avgHealth,
        slaCompliance,
        trend,
      } satisfies RegionalTrend;
    })
    .filter((x): x is RegionalTrend => x !== null)
    .sort((a, b) => b.avgHealth - a.avgHealth);
}

/* ─── Escalation processor ─── */
export function detectEscalations(
  tickets: TicketLikeEntity[],
): EscalationEvent[] {
  return tickets
    .filter((t) => t.slaState === "breached" || t.priority === "critical")
    .slice(0, 12)
    .map((t) => ({
      ticketId: t.id,
      branchId: t.branchId,
      fromState: t.priority === "critical" ? "high" : "at_risk",
      toState: t.slaState === "breached" ? "breached" : "critical",
      occurredAt: t.dueAt ?? t.updatedAt,
      severity: t.priority === "critical" ? "critical" : "high",
    }));
}

/* ─── Branch health processor ─── */
export function computeBranchHealth(args: {
  branches: BranchEntity[];
  complaints: ComplaintEntity[];
  maintenance: MaintenanceEntity[];
  inspections: InspectionEntity[];
  employees: EmployeeEntity[];
  recurringFailures: RecurringFailure[];
  staffingShortages: StaffingShortage[];
}): BranchHealthEntry[] {
  const {
    branches,
    complaints,
    maintenance,
    inspections,
    employees,
    recurringFailures,
    staffingShortages,
  } = args;
  const raw = branches.map((b) => {
    const bComplaints = complaints.filter((c) => c.branchId === b.id);
    const bMaint = maintenance.filter((m) => m.branchId === b.id);
    const bTickets = [...bComplaints, ...bMaint];
    const okSla = bTickets.filter((t) => t.slaState === "ok").length;
    const breached = bTickets.filter((t) => t.slaState === "breached").length;
    const done = bTickets.filter((t) => t.status === "done").length;
    const open = bTickets.length - done;
    const sla = bTickets.length
      ? Math.round((okSla / bTickets.length) * 100)
      : 90;
    const complaintsScore = Math.max(
      0,
      100 - Math.round((breached / Math.max(bTickets.length, 1)) * 220),
    );
    const inspScores = inspections
      .filter((i) => i.branchId === b.id)
      .map((i) => i.score);
    const inspection = inspScores.length
      ? Math.round(inspScores.reduce((s, x) => s + x, 0) / inspScores.length)
      : 80;
    const maintenanceScore = bMaint.length
      ? Math.max(40, 100 - bMaint.filter((m) => m.status !== "done").length * 5)
      : 85;
    const empCount = employees.filter((e) => e.branchId === b.id).length;
    const staffing = empCount === 0
      ? 60
      : Math.max(50, 100 - Math.round((open / empCount) * 6));
    const sentiment = 80;
    const aging = open > 0 ? Math.max(40, 100 - open * 1.2) : 95;
    const components = {
      sla,
      complaints: complaintsScore,
      inspection,
      maintenance: maintenanceScore,
      staffing,
      sentiment,
      aging,
    };
    const score = computeHealthScore(components);
    return {
      branchId: b.id,
      branchName: b.name,
      region: b.region,
      manager: b.managerName,
      score,
      previousScore: score,
      trend: 0,
      status: statusFromScore(score),
      components,
      alerts: {
        recurringIssue: recurringFailures.some((r) => r.branchId === b.id),
        slaRisk: bTickets.some(
          (t) => t.slaState === "at_risk" && t.status !== "done",
        ),
        inspectionOverdue: inspScores.length === 0,
        staffingShortage: staffingShortages.some((s) => s.branchId === b.id),
      },
    };
  });
  return raw.map((b) => ({ ...b, movement: 0 }));
}

/* ─── Alert synthesizer — converts derived metrics into AlertEntity ─── */
export function synthesizeAlerts(args: {
  spikes: ComplaintSpike[];
  recurring: RecurringFailure[];
  staffing: StaffingShortage[];
  overload: EmployeeOverload[];
  branchHealth: BranchHealthEntry[];
}): AlertEntity[] {
  const out: AlertEntity[] = [];
  for (const s of args.spikes) {
    out.push({
      type: "alert",
      id: `alert-spike-${s.branchId}`,
      kind: "complaint_spike",
      severity: s.severity === "high" ? "critical" : "high",
      title: `קפיצה בנפח תלונות · ${s.branchName}`,
      detail: `+${s.delta}% מעל הממוצע ב-${s.windowDays} ימים אחרונים`,
      branchId: s.branchId,
      region: null,
      occurredAt: new Date().toISOString(),
      provenance: derivedProvenance("processors.detectComplaintSpikes", [
        { entityType: "complaint", ids: [] },
      ]),
    });
  }
  for (const r of args.recurring) {
    out.push({
      type: "alert",
      id: `alert-recurring-${r.branchId}-${r.signature.slice(0, 8)}`,
      kind: "recurring_failure",
      severity: r.occurrences >= 5 ? "high" : "medium",
      title: `תקלה חוזרת · ${r.branchName}`,
      detail: `${r.signature} — ${r.occurrences} פעמים ב-${r.windowDays} ימים`,
      branchId: r.branchId,
      region: null,
      occurredAt: r.lastOccurredAt,
      provenance: derivedProvenance("processors.detectRecurringFailures", []),
    });
  }
  for (const s of args.staffing) {
    out.push({
      type: "alert",
      id: `alert-staffing-${s.branchId}`,
      kind: "staffing_shortage",
      severity: s.severity === "high" ? "high" : "medium",
      title: `מחסור באיוש · ${s.branchName}`,
      detail: `${s.openTicketsPerEmployee} פניות פתוחות לעובד`,
      branchId: s.branchId,
      region: null,
      occurredAt: new Date().toISOString(),
      provenance: derivedProvenance("processors.detectStaffingShortages", []),
    });
  }
  for (const h of args.branchHealth.filter((b) => b.status === "critical")) {
    out.push({
      type: "alert",
      id: `alert-collapse-${h.branchId}`,
      kind: "sla_collapse",
      severity: "critical",
      title: `קריסת SLA · ${h.branchName}`,
      detail: `ציון בריאות ${h.score} · נדרשת התערבות מיידית`,
      branchId: h.branchId,
      region: h.region,
      occurredAt: new Date().toISOString(),
      provenance: derivedProvenance("processors.computeBranchHealth", []),
    });
  }
  return out;
}

/* ─── Insight generator — rule-based, AI-ready shape ─── */
export function generateInsights(args: {
  branchHealth: BranchHealthEntry[];
  regionalTrends: RegionalTrend[];
  recurring: RecurringFailure[];
  spikes: ComplaintSpike[];
  overload: EmployeeOverload[];
  networkScore: number;
  complaints: ComplaintEntity[];
}): InsightEntity[] {
  const out: InsightEntity[] = [];

  // Network-level SLA
  const sla = args.branchHealth.length
    ? Math.round(
        args.branchHealth.reduce((s, b) => s + b.components.sla, 0) /
          args.branchHealth.length,
      )
    : 0;
  out.push({
    type: "insight",
    id: "ins-network-sla",
    kind: sla >= 85 ? "positive" : sla >= 70 ? "info" : "warning",
    importance: sla < 70 ? "high" : "medium",
    confidence: 0.9,
    title: `עמידת SLA רשתית · ${sla}%`,
    detail:
      sla >= 85
        ? "הרשת עומדת ביעדי השירות באופן עקבי."
        : "ירידה זוהתה — מומלץ להגדיל מענה בשעות העומס.",
    recommendation:
      sla >= 85 ? "המשך מעקב" : "תזמן תורנות נוספת בחלון 18:00-21:00",
    metric: `${args.branchHealth.length} סניפים`,
    affectedBranches: args.branchHealth
      .filter((b) => b.components.sla < 75)
      .map((b) => b.branchId),
    provenance: derivedProvenance("processors.generateInsights", [
      { entityType: "branch", ids: args.branchHealth.map((b) => b.branchId) },
    ]),
  });

  // Top branch
  const top = [...args.branchHealth].sort((a, b) => b.score - a.score)[0];
  if (top) {
    out.push({
      type: "insight",
      id: "ins-top-branch",
      kind: "info",
      importance: "medium",
      confidence: 0.93,
      title: `${top.branchName} מוביל ברשת`,
      detail: `ציון בריאות ${top.score}`,
      recommendation: "העתק נהלים לסניפים נמוכים",
      affectedBranches: [top.branchId],
      provenance: derivedProvenance("processors.generateInsights", [
        { entityType: "branch", ids: [top.branchId] },
      ]),
    });
  }

  // Recurring failures
  if (args.recurring.length > 0) {
    const top = args.recurring[0];
    out.push({
      type: "insight",
      id: "ins-recurring",
      kind: "warning",
      importance: "high",
      confidence: 0.85,
      title: `תקלה חוזרת זוהתה · ${top.branchName}`,
      detail: `${top.signature} חזרה ${top.occurrences} פעמים ב-${top.windowDays} ימים`,
      recommendation: "החלף ציוד או הזמן ביקורת ספק",
      affectedBranches: [top.branchId],
      provenance: derivedProvenance("processors.detectRecurringFailures", []),
    });
  }

  // Spikes
  if (args.spikes.length > 0) {
    const top = args.spikes[0];
    out.push({
      type: "insight",
      id: "ins-spike",
      kind: "warning",
      importance: top.severity === "high" ? "high" : "medium",
      confidence: 0.82,
      title: `קפיצה בנפח תלונות · ${top.branchName}`,
      detail: `+${top.delta}% מהממוצע`,
      recommendation: "בדוק שינוי תפעולי בסניף ב-7 הימים האחרונים",
      affectedBranches: [top.branchId],
      provenance: derivedProvenance("processors.detectComplaintSpikes", []),
    });
  }

  // Peak hour heuristic (still derived from complaints createdAt)
  if (args.complaints.length > 0) {
    const buckets = new Array(7).fill(0).map(() => new Array(24).fill(0));
    for (const c of args.complaints) {
      const d = new Date(c.createdAt);
      buckets[d.getDay()][d.getHours()]++;
    }
    let max = { w: 0, h: 12, v: 0 };
    for (let w = 0; w < 7; w++)
      for (let h = 7; h < 23; h++) {
        if (buckets[w][h] > max.v) max = { w, h, v: buckets[w][h] };
      }
    if (max.v > 0) {
      out.push({
        type: "insight",
        id: "ins-peak",
        kind: "warning",
        importance: "high",
        confidence: 0.78,
        title: `שעת עומס · ${HEBREW_DAYS[max.w]} · ${max.h}:00`,
        detail: `${max.v} פניות בחלון זמן זה ברבעון האחרון`,
        recommendation: "תזמן תורנות נוספת בחלון הזה",
        metric: `${max.v} פניות`,
        provenance: derivedProvenance("processors.generateInsights.peakHour", [
          { entityType: "complaint", ids: [] },
        ]),
      });
    }
  }

  return out;
}

/* ─── Complaint metrics processor ─── */
export function computeComplaintMetrics(
  complaints: ComplaintEntity[],
  now: Date = new Date(),
): ComplaintMetrics {
  const total = complaints.length;
  const open = complaints.filter((c) => c.status !== "done").length;
  const closed = complaints.filter((c) => c.status === "done").length;
  const blocked = complaints.filter((c) => c.status === "blocked").length;
  const inProgress = complaints.filter((c) => c.status === "in_progress").length;
  const slaRisk = complaints.filter(
    (c) => c.slaState === "at_risk" && c.status !== "done",
  ).length;
  const overdue = complaints.filter((c) => c.slaState === "breached").length;

  const ownerMap = new Map<string, { open: number; overdue: number; total: number }>();
  for (const c of complaints) {
    const key = c.assigneeId ?? "unassigned";
    const cur = ownerMap.get(key) ?? { open: 0, overdue: 0, total: 0 };
    cur.total++;
    if (c.status !== "done") cur.open++;
    if (c.slaState === "breached") cur.overdue++;
    ownerMap.set(key, cur);
  }
  const byOwner = [...ownerMap.entries()]
    .map(([owner, v]) => ({ owner, ...v }))
    .sort((a, b) => b.total - a.total);

  const dayBuckets = new Map<string, number>();
  for (const c of complaints) {
    const key = c.createdAt.slice(0, 10);
    dayBuckets.set(key, (dayBuckets.get(key) ?? 0) + 1);
  }

  const byDate = [...dayBuckets.entries()]
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => (a.date < b.date ? -1 : 1));

  const trend30d: { date: string; count: number }[] = [];
  for (let d = 29; d >= 0; d--) {
    const day = new Date(now.getTime() - d * 86400000);
    const key = day.toISOString().slice(0, 10);
    trend30d.push({ date: key, count: dayBuckets.get(key) ?? 0 });
  }

  const statusMap = new Map<string, number>();
  for (const c of complaints) {
    statusMap.set(c.status, (statusMap.get(c.status) ?? 0) + 1);
  }
  const byStatus = [...statusMap.entries()].map(([status, count]) => ({
    status,
    count,
  }));

  const secondaryMap = new Map<string, number>();
  for (const c of complaints) {
    const k = c.secondaryStatus ?? "—";
    secondaryMap.set(k, (secondaryMap.get(k) ?? 0) + 1);
  }
  const bySecondaryStatus = [...secondaryMap.entries()]
    .map(([status, count]) => ({ status, count }))
    .sort((a, b) => b.count - a.count);

  return {
    total,
    open,
    closed,
    blocked,
    inProgress,
    slaRisk,
    overdue,
    byOwner,
    byDate,
    byStatus,
    bySecondaryStatus,
    trend30d,
  };
}

