import type { BranchHealth, BranchStatus } from "@/types/domain";
import { STATUS_LABEL, STATUS_TONE } from "./health";

/**
 * Defensive accessors. Live Monday data is incomplete by definition —
 * boards may be missing branch / region / score / status. UI must
 * never crash on undefined; it must render an empty / fallback state.
 */

export function safeArray<T>(value: T[] | null | undefined): T[] {
  return Array.isArray(value) ? value : [];
}

const UNKNOWN_STATUS: BranchStatus = "stable";

/**
 * Returns a guaranteed BranchStatus even when the branch object or its
 * status field is missing. Falls back to "stable" so existing UI maps
 * never throw on STATUS_TONE[undefined].
 */
export function getBranchStatus(
  branch: Partial<BranchHealth> | null | undefined,
): BranchStatus {
  const s = branch?.status;
  if (s === "excellent" || s === "stable" || s === "attention" || s === "critical") {
    return s;
  }
  return UNKNOWN_STATUS;
}

export function getStatusTone(status: BranchStatus | string | null | undefined) {
  const key = (status as BranchStatus) ?? UNKNOWN_STATUS;
  return STATUS_TONE[key] ?? STATUS_TONE[UNKNOWN_STATUS];
}

export function getStatusLabel(
  status: BranchStatus | string | null | undefined,
): string {
  const key = (status as BranchStatus) ?? UNKNOWN_STATUS;
  return STATUS_LABEL[key] ?? STATUS_LABEL[UNKNOWN_STATUS];
}

/** Defensive number — returns 0 for null/undefined/NaN. */
export function safeNumber(n: number | null | undefined): number {
  if (typeof n === "number" && Number.isFinite(n)) return n;
  return 0;
}

/** Defensive string — returns fallback for empty/null/undefined. */
export function safeText(
  s: string | null | undefined,
  fallback = "—",
): string {
  if (s && s.trim().length > 0) return s;
  return fallback;
}
