import type { Auditable } from "./provenance";

/**
 * Central normalized data model for the B-FRESH operational platform.
 * All future data sources (Monday boards, future APIs, manual imports)
 * must normalize into these entities. UI consumes only these — never
 * raw source rows.
 */

export type EntityType =
  | "branch"
  | "employee"
  | "complaint"
  | "maintenance"
  | "inspection"
  | "marketing_campaign"
  | "recruitment_lead"
  | "franchise_lead"
  | "sla_event"
  | "alert"
  | "insight";

export type Region = "north" | "center" | "south";

/* ─── Reference types (lightweight links between entities) ─── */
export type BranchRef = { id: string; name: string; region: Region };
export type EmployeeRef = { id: string; name: string };

/* ─── Core entities ─── */
export type BranchEntity = Auditable & {
  type: "branch";
  id: string;
  name: string;
  region: Region;
  managerName: string | null;
  franchisee?: string | null;
  /* Multi-country / hierarchy — optional for backwards compatibility */
  country?: string; // ISO country code (default "IL")
  areaId?: string | null;
  areaManager?: string | null;
  timezone?: string; // IANA
  locale?: string; // BCP-47
  /* Time-awareness — populated by intelligence layer */
  lastUpdated?: string;
};

export type EmployeeEntity = Auditable & {
  type: "employee";
  id: string;
  name: string;
  role: string;
  branchId: string;
  avatarColor?: string;
};

export type TicketStatus = "open" | "in_progress" | "blocked" | "done";
export type TicketPriority = "low" | "medium" | "high" | "critical";
export type SLAState = "ok" | "at_risk" | "breached";

/** Shared shape for any ticket-like entity (complaint, maintenance, etc). */
export type BaseTicketFields = {
  id: string;
  title: string;
  status: TicketStatus;
  priority: TicketPriority;
  slaState: SLAState;
  branchId: string;
  assigneeId: string | null;
  createdAt: string;
  updatedAt: string;
  dueAt: string | null;
  resolvedAt: string | null;
  handlingMinutes: number | null;
};

export type ComplaintEntity = Auditable &
  BaseTicketFields & {
    type: "complaint";
    category: string | null;
    subCategory: string | null;
    source: string | null; // whatsapp / web / phone / etc.
    sentiment?: "positive" | "neutral" | "negative" | null;
  };

export type MaintenanceEntity = Auditable &
  BaseTicketFields & {
    type: "maintenance";
    supplier: string | null;
    equipment: string | null;
    cost?: number | null;
  };

export type InspectionEntity = Auditable & {
  type: "inspection";
  id: string;
  branchId: string;
  score: number; // 0..100
  findings: number;
  inspector: string | null;
  occurredAt: string;
  notes?: string | null;
};

export type MarketingCampaignEntity = Auditable & {
  type: "marketing_campaign";
  id: string;
  name: string;
  status: TicketStatus;
  startAt: string;
  endAt: string | null;
  branchIds: string[];
  impressions?: number | null;
  redemptions?: number | null;
};

export type RecruitmentLeadEntity = Auditable & {
  type: "recruitment_lead";
  id: string;
  candidateName: string;
  role: string;
  branchId: string | null;
  stage: "new" | "screen" | "interview" | "offer" | "hired" | "rejected";
  source: string | null;
  createdAt: string;
  updatedAt: string;
};

export type FranchiseLeadEntity = Auditable & {
  type: "franchise_lead";
  id: string;
  candidateName: string;
  stage:
    | "new"
    | "qualified"
    | "meeting"
    | "negotiation"
    | "signed"
    | "rejected";
  source: string | null;
  region: Region | null;
  createdAt: string;
  updatedAt: string;
};

/* ─── Derived entities (computed by the intelligence engine) ─── */

export type SLAEventEntity = Auditable & {
  type: "sla_event";
  id: string;
  ticketId: string;
  ticketType: "complaint" | "maintenance";
  branchId: string;
  severity: "critical" | "high" | "medium" | "low";
  minutesOverdue: number;
  occurredAt: string;
};

export type AlertEntity = Auditable & {
  type: "alert";
  id: string;
  kind:
    | "sla_collapse"
    | "complaint_spike"
    | "recurring_failure"
    | "staffing_shortage"
    | "branch_outage"
    | "regional_decline";
  severity: "critical" | "high" | "medium" | "low";
  title: string;
  detail: string;
  branchId: string | null;
  region: Region | null;
  occurredAt: string;
  resolved?: boolean;
};

export type InsightEntity = Auditable & {
  type: "insight";
  id: string;
  kind: "positive" | "warning" | "info";
  importance: "high" | "medium" | "low";
  confidence: number; // 0..1
  title: string;
  detail: string;
  metric?: string;
  recommendation?: string;
  evidence?: { entityType: EntityType; ids: string[] }[];
  affectedBranches?: string[];
};

/* ─── Discriminated union of every domain entity ─── */
export type DomainEntity =
  | BranchEntity
  | EmployeeEntity
  | ComplaintEntity
  | MaintenanceEntity
  | InspectionEntity
  | MarketingCampaignEntity
  | RecruitmentLeadEntity
  | FranchiseLeadEntity
  | SLAEventEntity
  | AlertEntity
  | InsightEntity;

/* Convenience union for any ticket-like entity */
export type TicketLikeEntity = ComplaintEntity | MaintenanceEntity;

export function isTicketLike(e: DomainEntity): e is TicketLikeEntity {
  return e.type === "complaint" || e.type === "maintenance";
}
