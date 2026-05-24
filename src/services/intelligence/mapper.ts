import "server-only";

import type { MondayBoardConfig } from "@/config/mondayBoards";
import type { NormalizedTicket } from "@/lib/monday/types";
import {
  mondayProvenance,
  type Auditable,
  type ComplaintEntity,
  type FranchiseLeadEntity,
  type InspectionEntity,
  type MaintenanceEntity,
  type MarketingCampaignEntity,
  type RecruitmentLeadEntity,
  type SLAState,
  type TicketPriority,
  type TicketStatus,
} from "@/domain";
import {
  mapPriority,
  mapSlaState,
  mapStatus as defaultMapStatus,
} from "@/lib/monday/normalize";

/* ─── Status normalization driven by board rules ─── */
function statusFromConfig(
  raw: string | null,
  board: MondayBoardConfig,
): TicketStatus {
  const rules = board.statusNormalization;
  if (raw && rules) {
    const norm = raw.trim().toLowerCase();
    if (rules.done?.some((s) => norm.includes(s.toLowerCase()))) return "done";
    if (
      rules.in_progress?.some((s) => norm.includes(s.toLowerCase()))
    )
      return "in_progress";
    if (rules.blocked?.some((s) => norm.includes(s.toLowerCase())))
      return "blocked";
    if (rules.open?.some((s) => norm.includes(s.toLowerCase()))) return "open";
  }
  return defaultMapStatus(raw);
}

/* ─── SLA derivation — combines board column + slaRules ─── */
function deriveSlaState(
  ticket: NormalizedTicket,
  status: TicketStatus,
  board: MondayBoardConfig,
): SLAState {
  // 1. Explicit column wins.
  const fromCol = mapSlaState(ticket.slaStatus);
  if (fromCol !== "ok") return fromCol;
  // 2. Otherwise compute against slaRules.
  const rules = board.slaRules;
  if (!rules?.resolutionBudgetMinutes || !ticket.createdAt) return "ok";
  if (status === "done") return "ok";
  const ageMin =
    (Date.now() - new Date(ticket.createdAt).getTime()) / 60_000;
  const budget = rules.resolutionBudgetMinutes;
  const breachAt = budget * (rules.breachMultiplier ?? 1);
  if (ageMin >= breachAt) return "breached";
  if (ageMin >= budget * 0.8) return "at_risk";
  return "ok";
}

function provenance(t: NormalizedTicket, b: MondayBoardConfig) {
  return mondayProvenance(b.id, b.name, t.id);
}

function baseTicketFields(
  t: NormalizedTicket,
  b: MondayBoardConfig,
): {
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
} {
  const status = statusFromConfig(t.status, b);
  return {
    id: t.id,
    title: t.itemName || `#${t.id}`,
    status,
    priority: mapPriority(t.priority),
    slaState: deriveSlaState(t, status, b),
    branchId: branchIdFromTicket(t),
    assigneeId: t.owner ? employeeIdFromName(t.owner.split(",")[0].trim()) : null,
    createdAt: t.createdAt,
    updatedAt: t.updatedAt,
    dueAt: t.dueDate,
    resolvedAt: status === "done" ? t.updatedAt : null,
    handlingMinutes:
      status === "done"
        ? Math.max(
            0,
            Math.round(
              (new Date(t.updatedAt).getTime() -
                new Date(t.createdAt).getTime()) /
                60_000,
            ),
          )
        : null,
  };
}

export function branchIdFromTicket(t: NormalizedTicket): string {
  if (!t.branch) return "b-unassigned";
  return `b-${slug(t.branch)}`;
}

export function employeeIdFromName(name: string): string {
  return `e-${slug(name)}`;
}

function slug(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9א-ת]+/gi, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
}

/* ─── Per-entityType mappers ─── */

function toComplaint(
  t: NormalizedTicket,
  b: MondayBoardConfig,
): ComplaintEntity {
  return {
    type: "complaint",
    ...baseTicketFields(t, b),
    category: t.category,
    subCategory: t.subCategory,
    source: t.source,
    sentiment: null,
    provenance: provenance(t, b),
  };
}

function toMaintenance(
  t: NormalizedTicket,
  b: MondayBoardConfig,
): MaintenanceEntity {
  const supplier = t.rawColumnValues[b.columns.supplier ?? ""]?.text ?? null;
  const equipment = t.rawColumnValues[b.columns.equipment ?? ""]?.text ?? null;
  const cost = b.columns.cost
    ? parseFloat(t.rawColumnValues[b.columns.cost]?.text ?? "")
    : NaN;
  return {
    type: "maintenance",
    ...baseTicketFields(t, b),
    supplier,
    equipment,
    cost: Number.isFinite(cost) ? cost : null,
    provenance: provenance(t, b),
  };
}

function toInspection(
  t: NormalizedTicket,
  b: MondayBoardConfig,
): InspectionEntity {
  const scoreCol = b.columns.score
    ? parseFloat(t.rawColumnValues[b.columns.score]?.text ?? "")
    : NaN;
  return {
    type: "inspection",
    id: t.id,
    branchId: branchIdFromTicket(t),
    score: Number.isFinite(scoreCol) ? scoreCol : 80,
    findings: 0,
    inspector: t.owner,
    occurredAt: t.createdAt,
    provenance: provenance(t, b),
  };
}

function toMarketingCampaign(
  t: NormalizedTicket,
  b: MondayBoardConfig,
): MarketingCampaignEntity {
  return {
    type: "marketing_campaign",
    id: t.id,
    name: t.itemName,
    status: statusFromConfig(t.status, b),
    startAt:
      (b.columns.startAt && t.rawColumnValues[b.columns.startAt]?.text) ||
      t.createdAt,
    endAt:
      (b.columns.endAt && t.rawColumnValues[b.columns.endAt]?.text) || null,
    branchIds: t.branch ? [branchIdFromTicket(t)] : [],
    impressions: null,
    redemptions: null,
    provenance: provenance(t, b),
  };
}

function mapPipelineStage(
  raw: string | null,
): RecruitmentLeadEntity["stage"] {
  if (!raw) return "new";
  const v = raw.toLowerCase();
  if (/hired|נקלט/.test(v)) return "hired";
  if (/reject|נדחה/.test(v)) return "rejected";
  if (/offer|הצעה/.test(v)) return "offer";
  if (/interview|ראיון/.test(v)) return "interview";
  if (/screen|סינון/.test(v)) return "screen";
  return "new";
}

function toRecruitmentLead(
  t: NormalizedTicket,
  b: MondayBoardConfig,
): RecruitmentLeadEntity {
  const stageRaw = b.columns.stage
    ? t.rawColumnValues[b.columns.stage]?.text ?? null
    : t.status;
  return {
    type: "recruitment_lead",
    id: t.id,
    candidateName: t.itemName,
    role: t.category ?? "—",
    branchId: t.branch ? branchIdFromTicket(t) : null,
    stage: mapPipelineStage(stageRaw),
    source: t.source,
    createdAt: t.createdAt,
    updatedAt: t.updatedAt,
    provenance: provenance(t, b),
  };
}

function mapFranchiseStage(
  raw: string | null,
): FranchiseLeadEntity["stage"] {
  if (!raw) return "new";
  const v = raw.toLowerCase();
  if (/sign|חתום|חתימה/.test(v)) return "signed";
  if (/reject|נדחה/.test(v)) return "rejected";
  if (/negoti|משא/.test(v)) return "negotiation";
  if (/meet|פגישה/.test(v)) return "meeting";
  if (/qualif|מתאים/.test(v)) return "qualified";
  return "new";
}

function toFranchiseLead(
  t: NormalizedTicket,
  b: MondayBoardConfig,
): FranchiseLeadEntity {
  const stageRaw = b.columns.stage
    ? t.rawColumnValues[b.columns.stage]?.text ?? null
    : t.status;
  const region = t.region?.toLowerCase().includes("north")
    ? "north"
    : t.region?.toLowerCase().includes("south")
      ? "south"
      : t.region
        ? "center"
        : null;
  return {
    type: "franchise_lead",
    id: t.id,
    candidateName: t.itemName,
    stage: mapFranchiseStage(stageRaw),
    source: t.source,
    region,
    createdAt: t.createdAt,
    updatedAt: t.updatedAt,
    provenance: provenance(t, b),
  };
}

/* ─── Dispatcher ─── */

export type MappedEntity =
  | ComplaintEntity
  | MaintenanceEntity
  | InspectionEntity
  | MarketingCampaignEntity
  | RecruitmentLeadEntity
  | FranchiseLeadEntity;

export function mapToEntity(
  ticket: NormalizedTicket,
  board: MondayBoardConfig,
): MappedEntity {
  switch (board.entityType) {
    case "complaint":
    case "ticket":
      // 'ticket' is treated as a generic ComplaintEntity for now —
      // same domain shape, different semantic origin.
      return toComplaint(ticket, board);
    case "maintenance":
      return toMaintenance(ticket, board);
    case "inspection":
      return toInspection(ticket, board);
    case "marketing_campaign":
      return toMarketingCampaign(ticket, board);
    case "recruitment_lead":
      return toRecruitmentLead(ticket, board);
    case "franchise_lead":
      return toFranchiseLead(ticket, board);
  }
}

/** Derive a BranchEntity stub from raw ticket fields when no dedicated branch
 *  board exists. Auditable via the source ticket. */
export function deriveBranchFromTicket(
  t: NormalizedTicket,
  b: MondayBoardConfig,
): Auditable & {
  type: "branch";
  id: string;
  name: string;
  region: "north" | "center" | "south";
  managerName: string | null;
} {
  const region = t.region?.toLowerCase().includes("north")
    ? "north"
    : t.region?.toLowerCase().includes("south")
      ? "south"
      : "center";
  return {
    type: "branch",
    id: branchIdFromTicket(t),
    name: t.branch ?? "לא משויך",
    region,
    managerName: t.owner ?? null,
    provenance: provenance(t, b),
  };
}

/** Derive an EmployeeEntity from owner field. */
export function deriveEmployee(
  name: string,
  branchId: string,
  provenanceTicket: { boardId: string; boardName: string; itemId: string },
): Auditable & {
  type: "employee";
  id: string;
  name: string;
  role: string;
  branchId: string;
  avatarColor: string;
} {
  return {
    type: "employee",
    id: employeeIdFromName(name),
    name,
    role: "צוות תפעולי",
    branchId,
    avatarColor: avatarColor(name),
    provenance: mondayProvenance(
      provenanceTicket.boardId,
      provenanceTicket.boardName,
      provenanceTicket.itemId,
    ),
  };
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
