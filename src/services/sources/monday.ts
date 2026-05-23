import "server-only";

import { getEnabledBoards } from "@/config/mondayBoards";
import { hasToken } from "@/lib/env";
import { liveGetTicketBatches } from "@/services/monday/live";
import type { SourceAdapter, SourceBatch, SourceHealth } from "./types";

/**
 * Monday.com source adapter. Wraps the existing live fetcher so the
 * intelligence aggregator treats Monday like any other source.
 */
export const mondayAdapter: SourceAdapter = {
  kind: "monday",
  name: "Monday.com",
  isEnabled() {
    return hasToken() && getEnabledBoards().length > 0;
  },
  async health(): Promise<SourceHealth> {
    if (!hasToken()) {
      return { ok: false, reason: "no token configured" };
    }
    if (getEnabledBoards().length === 0) {
      return { ok: false, reason: "no boards configured" };
    }
    return { ok: true, lastSyncAt: new Date().toISOString() };
  },
  async fetchBatches(): Promise<SourceBatch[]> {
    if (!this.isEnabled()) return [];
    const batches = await liveGetTicketBatches();
    return batches.map((b) => ({ board: b.board, tickets: b.tickets }));
  },
};
