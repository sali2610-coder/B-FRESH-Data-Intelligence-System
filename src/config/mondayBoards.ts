/**
 * B-FRESH Monday board mapping.
 * Tell the system which Monday boards to read and how to interpret
 * the columns on each board.
 *
 * HOW TO FILL THIS OUT
 * ─────────────────────────────────────────────────────────────
 * 1. Open the target board in Monday.com
 * 2. URL → ".../boards/<BOARD_ID>" → use BOARD_ID as `id` below
 * 3. For each column, hover the column header → "..." → "Column id"
 *    (copy that exact id into the `columns` block)
 * 4. Set the `department` so the dashboard knows which cockpit it feeds
 * 5. Save & restart `pnpm dev`
 *
 * Set BFRESH_DATA_MODE=live or auto (with token) to start consuming
 * these boards. Otherwise mock data is used.
 *
 * SECURITY: this file contains NO secrets. Only board IDs + column ids.
 * Safe to commit.
 */

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
};

export type MondayBoardConfig = {
  id: string;
  name: string;
  department: BoardDepartment;
  /** Optional human-readable description for diagnostics. */
  description?: string;
  /** Map of internal field → Monday column id. */
  columns: BoardColumnMap;
  /** If true, board is consumed; flip to false to disable without removing. */
  enabled?: boolean;
};

/**
 * Empty by default. Add real boards once Monday account is connected.
 *
 * Example:
 * {
 *   id: "1234567890",
 *   name: "תלונות לקוחות",
 *   department: "customer-service",
 *   columns: {
 *     status:   "status",
 *     priority: "priority8",
 *     branch:   "branch5",
 *     owner:    "people",
 *     dueDate:  "date4",
 *     category: "dropdown1",
 *     region:   "region",
 *     sla:      "sla",
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

export function getBoardById(boardId: string): MondayBoardConfig | undefined {
  return MONDAY_BOARDS.find((b) => b.id === boardId);
}
