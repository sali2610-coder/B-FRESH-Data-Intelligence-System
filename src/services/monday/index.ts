import "server-only";

import type { BranchProfile, DashboardData } from "@/types/domain";
import type {
  MondayBoardMeta,
  MondayBoardSummary,
  NormalizedTicket,
} from "@/lib/monday/types";
import type { IntelligenceSnapshot } from "@/services/intelligence/types";
import { buildSnapshot } from "@/services/intelligence/aggregator";
import { renderDashboardData } from "@/services/intelligence/renderer";
import { buildMockSnapshot } from "@/services/intelligence/mockBuilder";
import { generateBriefing } from "@/services/intelligence/briefing";
import type { ExecutiveBriefing } from "@/services/intelligence/types";
import { intelligenceCache, CACHE_TAGS } from "@/lib/cache";
import { getConnectionStatus, type ConnectionStatus } from "./mode";
import {
  mockGetBoardMeta,
  mockGetBranchProfile,
  mockListBoards,
} from "./mock";
import {
  liveGetBoardMeta,
  liveGetBranchProfile,
  liveGetTicketBatches,
  liveGetTickets,
  liveListBoards,
} from "./live";

async function resolved(): Promise<ConnectionStatus> {
  return getConnectionStatus();
}

const SNAPSHOT_TTL_MS = 60_000;

async function buildLiveSnapshot(): Promise<IntelligenceSnapshot> {
  const batches = await liveGetTicketBatches();
  return buildSnapshot(batches, "live");
}

async function getSnapshot(source: "mock" | "live"): Promise<IntelligenceSnapshot> {
  const key = `snapshot:${source}`;
  return intelligenceCache.getOrSet(
    key,
    async () => (source === "live" ? buildLiveSnapshot() : buildMockSnapshot()),
    { ttlMs: SNAPSHOT_TTL_MS, tags: [CACHE_TAGS.snapshot] },
  );
}

export interface MondayService {
  getStatus(): Promise<ConnectionStatus>;
  getDashboard(): Promise<DashboardData>;
  getBranchProfile(branchId: string): Promise<BranchProfile>;
  listBoards(): Promise<MondayBoardSummary[]>;
  getBoardMeta(boardId: string): Promise<MondayBoardMeta | null>;
  getTickets(boardIds?: string[]): Promise<NormalizedTicket[]>;
  getSnapshot(): Promise<IntelligenceSnapshot>;
  getBriefing(): Promise<ExecutiveBriefing>;
}

class DispatchService implements MondayService {
  async getStatus() {
    return resolved();
  }

  async getDashboard(): Promise<DashboardData> {
    const status = await resolved();
    try {
      const snapshot = await getSnapshot(status.source);
      return renderDashboardData(snapshot);
    } catch {
      // Last-resort fallback — never break the UI.
      const snap = await getSnapshot("mock");
      return renderDashboardData(snap);
    }
  }

  async getSnapshot(): Promise<IntelligenceSnapshot> {
    const status = await resolved();
    try {
      return await getSnapshot(status.source);
    } catch {
      return getSnapshot("mock");
    }
  }

  async getBriefing(): Promise<ExecutiveBriefing> {
    return generateBriefing(await this.getSnapshot());
  }

  async getBranchProfile(branchId: string): Promise<BranchProfile> {
    const status = await resolved();
    if (status.source === "live") {
      try {
        return await liveGetBranchProfile(branchId);
      } catch {
        return mockGetBranchProfile(branchId);
      }
    }
    return mockGetBranchProfile(branchId);
  }

  async listBoards(): Promise<MondayBoardSummary[]> {
    const status = await resolved();
    if (status.source === "live") {
      try {
        return await liveListBoards();
      } catch {
        return mockListBoards();
      }
    }
    return mockListBoards();
  }

  async getBoardMeta(boardId: string): Promise<MondayBoardMeta | null> {
    const status = await resolved();
    if (status.source === "live") {
      try {
        return await liveGetBoardMeta(boardId);
      } catch {
        return mockGetBoardMeta(boardId);
      }
    }
    return mockGetBoardMeta(boardId);
  }

  async getTickets(boardIds?: string[]): Promise<NormalizedTicket[]> {
    const status = await resolved();
    if (status.source === "live") {
      return liveGetTickets(boardIds);
    }
    return [];
  }
}

export const mondayService: MondayService = new DispatchService();

// Manual cache invalidator (route handlers can call this on POST refresh).
export function invalidateSnapshot(): number {
  return intelligenceCache.invalidate(CACHE_TAGS.snapshot);
}
