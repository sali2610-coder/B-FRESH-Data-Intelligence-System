import "server-only";

import { generateDashboardData } from "@/mocks/seed";
import {
  MAPPING_VERSION,
  derivedProvenance,
  mockProvenance,
  type BranchEntity,
  type ComplaintEntity,
  type EmployeeEntity,
  type InspectionEntity,
  type MaintenanceEntity,
} from "@/domain";
import {
  computeBranchHealth,
  computeRegionalTrends,
  detectComplaintSpikes,
  detectEmployeeOverload,
  detectEscalations,
  detectRecurringFailures,
  detectSLAEvents,
  detectStaffingShortages,
  generateInsights,
  synthesizeAlerts,
} from "./processors";
import type { IntelligenceSnapshot } from "./types";

const SEED_LABEL = "ops";

/**
 * Wraps the legacy mock seed in the IntelligenceSnapshot shape so the
 * mock pipeline uses the exact same processors, briefings and AI
 * endpoints as the live pipeline. No "two truths" — one schema, one
 * intelligence engine, two sources.
 */
export function buildMockSnapshot(seed: string = SEED_LABEL): IntelligenceSnapshot {
  const data = generateDashboardData(
    seed.split("").reduce((acc, ch) => acc + ch.charCodeAt(0), 42),
  );
  const prov = mockProvenance(seed);

  const branches: BranchEntity[] = data.branches.map((b) => ({
    type: "branch",
    id: b.id,
    name: b.name,
    region: b.region,
    managerName: b.manager,
    provenance: prov,
  }));

  const employees: EmployeeEntity[] = data.employees.map((e) => ({
    type: "employee",
    id: e.id,
    name: e.name,
    role: e.role,
    branchId: e.branchId,
    avatarColor: e.avatarColor,
    provenance: prov,
  }));

  // Mock dataset has only generic tasks → treat them all as complaints.
  // Maintenance is implicit (could be re-classified later via title keywords).
  const complaints: ComplaintEntity[] = data.recentTasks.map((t) => ({
    type: "complaint",
    id: t.id,
    title: t.title,
    status: t.status,
    priority: t.priority,
    slaState: t.slaState,
    branchId: t.branchId,
    assigneeId: t.assigneeId,
    createdAt: t.createdAt,
    updatedAt: t.dueAt,
    dueAt: t.dueAt,
    resolvedAt: t.resolvedAt ?? null,
    handlingMinutes: t.handlingMinutes ?? null,
    category: null,
    subCategory: null,
    source: null,
    sentiment: null,
    provenance: prov,
  }));

  // Pull "maintenance" tasks out by keyword to give the processors something
  // to chew on with the existing mock realism (overloaded branch recurring failure).
  const maintenance: MaintenanceEntity[] = complaints
    .filter((c) => /מקרר|תקלה|תחזוק|כשל/.test(c.title))
    .map((c) => ({
      ...c,
      type: "maintenance",
      supplier: null,
      equipment: c.title,
      cost: null,
    }));

  // Synthesise a few inspections per branch based on branchHealth.inspection.
  const inspections: InspectionEntity[] = data.branchHealth.map((b) => ({
    type: "inspection",
    id: `ins-${b.branchId}`,
    branchId: b.branchId,
    score: b.components.inspection,
    findings: 0,
    inspector: b.manager,
    occurredAt: new Date().toISOString(),
    provenance: derivedProvenance("mockBuilder.inspections", [
      { entityType: "branch", ids: [b.branchId] },
    ]),
  }));

  // Run the SAME processors over the mock entities — single intelligence
  // engine for both sources.
  const ticketLike = [...complaints, ...maintenance];
  const slaEvents = detectSLAEvents(ticketLike);
  const complaintSpikes = detectComplaintSpikes(branches, complaints);
  const recurringFailures = detectRecurringFailures(branches, maintenance);
  const staffingShortages = detectStaffingShortages(
    branches,
    employees,
    ticketLike,
  );
  const employeeOverload = detectEmployeeOverload(employees, ticketLike);
  const escalations = detectEscalations(ticketLike);
  const branchHealth = computeBranchHealth({
    branches,
    complaints,
    maintenance,
    inspections,
    employees,
    recurringFailures,
    staffingShortages,
  });
  const regionalTrends = computeRegionalTrends(branches, branchHealth);
  const networkScore = data.networkScore;

  const alerts = synthesizeAlerts({
    spikes: complaintSpikes,
    recurring: recurringFailures,
    staffing: staffingShortages,
    overload: employeeOverload,
    branchHealth,
  });
  const insights = generateInsights({
    branchHealth,
    regionalTrends,
    recurring: recurringFailures,
    spikes: complaintSpikes,
    overload: employeeOverload,
    networkScore,
    complaints,
  });

  return {
    generatedAt: new Date().toISOString(),
    mode: "mock",
    branches,
    employees,
    complaints,
    maintenance,
    inspections,
    marketingCampaigns: [],
    recruitmentLeads: [],
    franchiseLeads: [],
    slaEvents,
    alerts,
    insights,
    branchHealth,
    complaintSpikes,
    recurringFailures,
    staffingShortages,
    employeeOverload,
    regionalTrends,
    escalations,
    networkScore,
    networkScoreTrend: data.networkScoreTrend,
    audit: {
      fetchedAt: new Date().toISOString(),
      mappingVersion: MAPPING_VERSION,
      sourceBoards: [
        {
          id: "mock",
          name: "Mock dataset",
          entityType: "complaint",
          itemCount: complaints.length,
        },
      ],
      totals: {
        branches: branches.length,
        employees: employees.length,
        complaints: complaints.length,
        maintenance: maintenance.length,
        inspections: inspections.length,
        recruitment_leads: 0,
        franchise_leads: 0,
        marketing_campaigns: 0,
        alerts: alerts.length,
        insights: insights.length,
      },
      mode: "mock",
    },
  };
}
