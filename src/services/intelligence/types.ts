import type {
  AlertEntity,
  BranchEntity,
  ComplaintEntity,
  EmployeeEntity,
  FranchiseLeadEntity,
  InsightEntity,
  InspectionEntity,
  MaintenanceEntity,
  MarketingCampaignEntity,
  RecruitmentLeadEntity,
  Region,
  SLAEventEntity,
} from "@/domain";

/* ─── Derived metrics emitted by processors ─── */

export type ComplaintSpike = {
  branchId: string;
  branchName: string;
  windowDays: number;
  baselineDaily: number;
  recentDaily: number;
  delta: number; // percent
  severity: "high" | "medium" | "low";
};

export type RecurringFailure = {
  branchId: string;
  branchName: string;
  signature: string; // canonical equipment/title key
  occurrences: number;
  windowDays: number;
  lastOccurredAt: string;
};

export type StaffingShortage = {
  branchId: string;
  branchName: string;
  openTicketsPerEmployee: number;
  severity: "high" | "medium" | "low";
};

export type EmployeeOverload = {
  employeeId: string;
  name: string;
  branchId: string;
  openTickets: number;
  breachedTickets: number;
  severity: "high" | "medium" | "low";
};

export type RegionalTrend = {
  region: Region;
  branchCount: number;
  avgHealth: number;
  slaCompliance: number;
  trend: number; // % vs prior period
};

export type BranchHealthEntry = {
  branchId: string;
  branchName: string;
  region: Region;
  manager: string | null;
  score: number;
  previousScore: number;
  trend: number;
  movement: number;
  status: "excellent" | "stable" | "attention" | "critical";
  components: {
    sla: number;
    complaints: number;
    inspection: number;
    maintenance: number;
    staffing: number;
    sentiment: number;
    aging: number;
  };
  alerts: {
    recurringIssue: boolean;
    slaRisk: boolean;
    inspectionOverdue: boolean;
    staffingShortage: boolean;
  };
};

export type EscalationEvent = {
  ticketId: string;
  branchId: string;
  fromState: string;
  toState: string;
  occurredAt: string;
  severity: "critical" | "high" | "medium" | "low";
};

/** Aggregated complaint metrics — computed from ComplaintEntity[]. */
export type ComplaintMetrics = {
  total: number;
  open: number;
  closed: number;
  blocked: number;
  inProgress: number;
  slaRisk: number; // at_risk count (still open)
  overdue: number; // breached count
  byOwner: {
    owner: string;
    total: number;
    open: number;
    overdue: number;
  }[];
  byDate: { date: string; count: number }[]; // 30d
  byStatus: { status: string; count: number }[];
  bySecondaryStatus: { status: string; count: number }[];
  trend30d: { date: string; count: number }[];
};

/* ─── Audit metadata for the snapshot ─── */
export type SnapshotAudit = {
  fetchedAt: string;
  mappingVersion: string;
  sourceBoards: {
    id: string;
    name: string;
    entityType: string;
    itemCount: number;
  }[];
  totals: Record<string, number>;
  mode: "mock" | "live";
};

/** Top-level IntelligenceSnapshot — the platform's source of truth. */
export type IntelligenceSnapshot = {
  generatedAt: string;
  mode: "mock" | "live";

  // Raw entities
  branches: BranchEntity[];
  employees: EmployeeEntity[];
  complaints: ComplaintEntity[];
  maintenance: MaintenanceEntity[];
  inspections: InspectionEntity[];
  marketingCampaigns: MarketingCampaignEntity[];
  recruitmentLeads: RecruitmentLeadEntity[];
  franchiseLeads: FranchiseLeadEntity[];

  // Derived
  slaEvents: SLAEventEntity[];
  alerts: AlertEntity[];
  insights: InsightEntity[];
  branchHealth: BranchHealthEntry[];
  complaintSpikes: ComplaintSpike[];
  recurringFailures: RecurringFailure[];
  staffingShortages: StaffingShortage[];
  employeeOverload: EmployeeOverload[];
  regionalTrends: RegionalTrend[];
  escalations: EscalationEvent[];

  // Per-entity-type metrics
  complaintMetrics: ComplaintMetrics;

  // Network-level KPIs
  networkScore: number;
  networkScoreTrend: number;

  audit: SnapshotAudit;
};

/** Compact executive briefing — AI-friendly. */
export type ExecutiveBriefing = {
  generatedAt: string;
  mode: "mock" | "live";
  headline: string;
  networkScore: number;
  trend: number;
  whatBurning: string[];
  whatImproved: string[];
  whereAttention: string[];
  strongestRegion: { region: Region; avgHealth: number } | null;
  weakestRegion: { region: Region; avgHealth: number } | null;
  topPriorityActions: {
    title: string;
    detail: string;
    expectedImpact?: string;
  }[];
};
