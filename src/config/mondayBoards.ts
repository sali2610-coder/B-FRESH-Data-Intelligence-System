/**
 * B-FRESH Monday board mapping.
 * Tells the intelligence platform which Monday boards to read, which
 * domain entity each board represents, and how each column maps to
 * normalized fields. No secrets — only IDs + rules. Safe to commit.
 *
 * HOW TO FILL THIS OUT — see docs/MONDAY_API_SETUP.md
 */

import type { EntityType } from "@/domain";

/** Internal entity types that Monday boards can map to. */
export type BoardEntityType = Extract<
  EntityType,
  | "complaint"
  | "maintenance"
  | "inspection"
  | "marketing_campaign"
  | "recruitment_lead"
  | "franchise_lead"
>;

export type BoardDepartment =
  | "customer-service"
  | "maintenance"
  | "marketing"
  | "recruitment"
  | "franchise"
  | "inspections"
  | "operations"
  | "other";

export type BoardColumnMap = {
  status?: string;
  priority?: string;
  branch?: string;
  region?: string;
  owner?: string;
  dueDate?: string;
  category?: string;
  subCategory?: string;
  source?: string;
  sla?: string;
  phone?: string;
  supplier?: string;
  equipment?: string;
  cost?: string;
  stage?: string; // for recruitment / franchise pipelines
  score?: string; // for inspections
  startAt?: string; // for campaigns
  endAt?: string;
};

/** Per-board status label aliases — for non-standard Hebrew/English labels. */
export type StatusNormalizationRules = {
  open?: string[];
  in_progress?: string[];
  blocked?: string[];
  done?: string[];
};

/** Per-board SLA thresholds in minutes. */
export type SLARules = {
  /** Time from open → first agent touch. */
  responseBudgetMinutes?: number;
  /** Time from open → done. */
  resolutionBudgetMinutes?: number;
  /** Multiplier on the budget after which "breached" is asserted. */
  breachMultiplier?: number;
};

export type MondayBoardConfig = {
  id: string;
  name: string;
  department: BoardDepartment;
  /** Which domain entity each row on this board represents. */
  entityType: BoardEntityType;
  description?: string;
  columns: BoardColumnMap;
  statusNormalization?: StatusNormalizationRules;
  slaRules?: SLARules;
  /** If false the board is registered but not consumed (useful for staging). */
  enabled?: boolean;
};

/**
 * Empty by default — fill once the Monday account is connected.
 *
 * Example:
 * {
 *   id: "1234567890",
 *   name: "תלונות לקוחות",
 *   department: "customer-service",
 *   entityType: "complaint",
 *   columns: {
 *     status:   "status",
 *     priority: "priority8",
 *     branch:   "branch5",
 *     owner:    "people",
 *     dueDate:  "date4",
 *     category: "dropdown1",
 *     source:   "source",
 *   },
 *   statusNormalization: {
 *     done:        ["הושלם", "נסגר", "בוצע"],
 *     in_progress: ["בטיפול", "במעקב"],
 *     blocked:     ["חסום", "ממתין לספק"],
 *   },
 *   slaRules: {
 *     responseBudgetMinutes: 30,
 *     resolutionBudgetMinutes: 480,
 *     breachMultiplier: 1.0,
 *   },
 *   enabled: true,
 * }
 */
export const MONDAY_BOARDS: MondayBoardConfig[] = [];

export function getEnabledBoards(): MondayBoardConfig[] {
  return MONDAY_BOARDS.filter((b) => b.enabled !== false);
}

export function getBoardsByDepartment(
  dept: BoardDepartment,
): MondayBoardConfig[] {
  return getEnabledBoards().filter((b) => b.department === dept);
}

export function getBoardsByEntityType(
  entityType: BoardEntityType,
): MondayBoardConfig[] {
  return getEnabledBoards().filter((b) => b.entityType === entityType);
}

export function getBoardById(boardId: string): MondayBoardConfig | undefined {
  return MONDAY_BOARDS.find((b) => b.id === boardId);
}
