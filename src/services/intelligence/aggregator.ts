import "server-only";

import type { MondayBoardConfig } from "@/config/mondayBoards";
import { MAPPING_VERSION, type BranchEntity, type ComplaintEntity, type EmployeeEntity, type FranchiseLeadEntity, type InspectionEntity, type MaintenanceEntity, type MarketingCampaignEntity, type RecruitmentLeadEntity } from "@/domain";
import type { NormalizedTicket } from "@/lib/monday/types";
import { deriveBranchFromTicket, deriveEmployee, mapToEntity } from "./mapper";
import {
  computeBranchHealth,
  computeComplaintMetrics,
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

export type TicketBatch = {
  board: MondayBoardConfig;
  tickets: NormalizedTicket[];
};

/**
 * Build the central IntelligenceSnapshot from per-board ticket batches.
 * This is the single source of truth — UI / AI / briefings all read from
 * the snapshot, never from raw Monday rows.
 */
export function buildSnapshot(
  batches: TicketBatch[],
  mode: "live" | "mock" = "live",
): IntelligenceSnapshot {
  const complaints: ComplaintEntity[] = [];
  const maintenance: MaintenanceEntity[] = [];
  const inspections: InspectionEntity[] = [];
  const marketingCampaigns: MarketingCampaignEntity[] = [];
  const recruitmentLeads: RecruitmentLeadEntity[] = [];
  const franchiseLeads: FranchiseLeadEntity[] = [];

  // ── Map every ticket to its typed entity ──
  for (const { board, tickets } of batches) {
    for (const t of tickets) {
      const e = mapToEntity(t, board);
      switch (e.type) {
        case "complaint":
          complaints.push(e);
          break;
        case "maintenance":
          maintenance.push(e);
          break;
        case "inspection":
          inspections.push(e);
          break;
        case "marketing_campaign":
          marketingCampaigns.push(e);
          break;
        case "recruitment_lead":
          recruitmentLeads.push(e);
          break;
        case "franchise_lead":
          franchiseLeads.push(e);
          break;
      }
    }
  }

  // ── Derive branches + employees from ticket data (no dedicated board yet) ──
  const branchMap = new Map<string, BranchEntity>();
  const employeeMap = new Map<string, EmployeeEntity>();
  for (const { board, tickets } of batches) {
    for (const t of tickets) {
      if (t.branch && !branchMap.has(`b-${t.branch}`)) {
        const b = deriveBranchFromTicket(t, board);
        if (!branchMap.has(b.id)) branchMap.set(b.id, b);
      }
      if (t.owner) {
        const names = t.owner.split(/,\s*/).filter(Boolean);
        for (const name of names) {
          const branchId = `b-${t.branch ?? "unassigned"}`
            .toLowerCase()
            .replace(/[^a-z0-9א-ת]+/gi, "-");
          const e = deriveEmployee(name.trim(), branchId, {
            boardId: board.id,
            boardName: board.name,
            itemId: t.id,
          });
          if (!employeeMap.has(e.id)) employeeMap.set(e.id, e);
        }
      }
    }
  }
  const branches = [...branchMap.values()];
  const employees = [...employeeMap.values()];

  // ── Processors over typed entities ──
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
  const networkScore = branchHealth.length
    ? Math.round(
        branchHealth.reduce((s, b) => s + b.score, 0) / branchHealth.length,
      )
    : 0;

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
    mode,
    branches,
    employees,
    complaints,
    maintenance,
    inspections,
    marketingCampaigns,
    recruitmentLeads,
    franchiseLeads,
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
    complaintMetrics: computeComplaintMetrics(complaints),
    networkScore,
    networkScoreTrend: 0,
    audit: {
      fetchedAt: new Date().toISOString(),
      mappingVersion: MAPPING_VERSION,
      sourceBoards: batches.map((b) => ({
        id: b.board.id,
        name: b.board.name,
        entityType: b.board.entityType,
        itemCount: b.tickets.length,
      })),
      totals: {
        branches: branches.length,
        employees: employees.length,
        complaints: complaints.length,
        maintenance: maintenance.length,
        inspections: inspections.length,
        recruitment_leads: recruitmentLeads.length,
        franchise_leads: franchiseLeads.length,
        marketing_campaigns: marketingCampaigns.length,
        alerts: alerts.length,
        insights: insights.length,
      },
      mode,
    },
  };
}
