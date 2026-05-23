import "server-only";

import type { MondayBoardConfig } from "@/config/mondayBoards";
import type { NormalizedTicket } from "@/lib/monday/types";

/**
 * A SourceAdapter ingests data from one external system (Monday, WhatsApp,
 * Forms, SAP, POS, HR, delivery, BI exports, …) and returns it as
 * NormalizedTicket batches that the intelligence aggregator can consume
 * uniformly.
 *
 * Every source — current or future — implements this interface. The
 * platform never branches on source-type in the intelligence layer; it
 * just iterates registered adapters.
 */

export type SourceKind =
  | "monday"
  | "whatsapp"
  | "forms"
  | "pos"
  | "sap"
  | "hr"
  | "delivery"
  | "bi_export";

export type SourceHealth =
  | { ok: true; lastSyncAt: string; itemCount?: number }
  | { ok: false; reason: string; lastSyncAt?: string };

export type SourceBatch = {
  /** Adapter-provided board config so the intelligence layer knows the
   *  entityType + column mapping + slaRules to apply. For non-Monday
   *  sources, adapter synthesises an equivalent config. */
  board: MondayBoardConfig;
  tickets: NormalizedTicket[];
};

export type SourceAdapter = {
  readonly kind: SourceKind;
  readonly name: string;
  /** Whether the adapter is enabled in this environment. */
  isEnabled(): boolean;
  /** Quick health probe — runs on /api/intelligence/sources. */
  health(): Promise<SourceHealth>;
  /** Returns ticket batches keyed by board/entity-type. */
  fetchBatches(): Promise<SourceBatch[]>;
};
