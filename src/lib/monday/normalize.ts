import "server-only";

import type { BoardColumnMap, MondayBoardConfig } from "@/config/mondayBoards";
import type { MondayColumnValue, MondayItem, NormalizedTicket } from "./types";

/**
 * Monday column values come back as { text, value } where `value` is a JSON
 * string. This pulls the displayed label out reliably across the most common
 * column types we expect to see on B-FRESH boards.
 */
export function readColumnText(col: MondayColumnValue | undefined): string | null {
  if (!col) return null;
  if (col.text && col.text.trim().length > 0) return col.text.trim();
  if (!col.value) return null;
  try {
    const parsed = JSON.parse(col.value);
    if (typeof parsed === "string") return parsed;
    if (parsed && typeof parsed === "object") {
      // status / dropdown
      if ("label" in parsed && typeof parsed.label === "string")
        return parsed.label;
      if ("text" in parsed && typeof parsed.text === "string") return parsed.text;
      if ("date" in parsed && typeof parsed.date === "string") return parsed.date;
      // people column
      if ("personsAndTeams" in parsed && Array.isArray(parsed.personsAndTeams)) {
        const names = parsed.personsAndTeams
          .map((p: { name?: string }) => p?.name)
          .filter(Boolean);
        if (names.length) return names.join(", ");
      }
    }
  } catch {
    // not JSON — fall through
  }
  return null;
}

export function readColumnDate(
  col: MondayColumnValue | undefined,
): string | null {
  if (!col) return null;
  if (!col.value) return readColumnText(col);
  try {
    const parsed = JSON.parse(col.value) as { date?: string; time?: string };
    if (parsed?.date) {
      return parsed.time ? `${parsed.date}T${parsed.time}` : parsed.date;
    }
  } catch {
    /* ignore */
  }
  return readColumnText(col);
}

function indexColumns(
  item: MondayItem,
): Record<string, MondayColumnValue> {
  const out: Record<string, MondayColumnValue> = {};
  for (const c of item.column_values) out[c.id] = c;
  return out;
}

export function normalizeItem(
  item: MondayItem,
  board: MondayBoardConfig,
): NormalizedTicket {
  const idx = indexColumns(item);
  const c: BoardColumnMap = board.columns;
  return {
    id: item.id,
    boardId: board.id,
    boardName: board.name,
    itemName: item.name,
    group: item.group?.title ?? null,
    status: c.status ? readColumnText(idx[c.status]) : null,
    priority: c.priority ? readColumnText(idx[c.priority]) : null,
    branch: c.branch ? readColumnText(idx[c.branch]) : null,
    region: c.region ? readColumnText(idx[c.region]) : null,
    owner: c.owner ? readColumnText(idx[c.owner]) : null,
    createdAt: item.created_at,
    updatedAt: item.updated_at,
    dueDate: c.dueDate ? readColumnDate(idx[c.dueDate]) : null,
    slaStatus: c.sla ? readColumnText(idx[c.sla]) : null,
    category: c.category ? readColumnText(idx[c.category]) : null,
    subCategory: c.subCategory ? readColumnText(idx[c.subCategory]) : null,
    source: c.source ? readColumnText(idx[c.source]) : null,
    rawColumnValues: idx,
  };
}

/* ─── Status mapping helpers ─── */

const DONE_LABELS = /done|הושלם|נסגר|טופל/i;
const BLOCKED_LABELS = /block|חסום|תקוע/i;
const IN_PROGRESS_LABELS = /progress|בטיפול|עובד|in.work/i;

export function mapStatus(
  raw: string | null,
): "open" | "in_progress" | "blocked" | "done" {
  if (!raw) return "open";
  if (DONE_LABELS.test(raw)) return "done";
  if (BLOCKED_LABELS.test(raw)) return "blocked";
  if (IN_PROGRESS_LABELS.test(raw)) return "in_progress";
  return "open";
}

const CRITICAL_LABELS = /critical|דחוף|crit/i;
const HIGH_LABELS = /high|גבוה/i;
const LOW_LABELS = /low|נמוך/i;

export function mapPriority(
  raw: string | null,
): "low" | "medium" | "high" | "critical" {
  if (!raw) return "medium";
  if (CRITICAL_LABELS.test(raw)) return "critical";
  if (HIGH_LABELS.test(raw)) return "high";
  if (LOW_LABELS.test(raw)) return "low";
  return "medium";
}

const SLA_BREACHED = /breach|חריג|overdue/i;
const SLA_AT_RISK = /risk|warn|התראה/i;

export function mapSlaState(
  raw: string | null,
): "ok" | "at_risk" | "breached" {
  if (!raw) return "ok";
  if (SLA_BREACHED.test(raw)) return "breached";
  if (SLA_AT_RISK.test(raw)) return "at_risk";
  return "ok";
}
