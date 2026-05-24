import "server-only";

import type { BranchProfile, DashboardData } from "@/types/domain";
import type {
  MondayBoardMeta,
  MondayBoardSummary,
  NormalizedTicket,
} from "@/lib/monday/types";
import type {
  ExecutiveBriefing,
  IntelligenceSnapshot,
} from "@/services/intelligence/types";
import { buildSnapshot } from "@/services/intelligence/aggregator";
import { renderDashboardData } from "@/services/intelligence/renderer";
import { buildMockSnapshot } from "@/services/intelligence/mockBuilder";
import { generateBriefing } from "@/services/intelligence/briefing";
import {
  snapshotMemory,
  type SnapshotSummary,
} from "@/services/intelligence/memory";
import {
  generateNarratives,
  type Narrative,
} from "@/services/intelligence/narrative";
import { diffSnapshots, type SnapshotDiff } from "@/services/intelligence/diff";
import {
  fetchAllBatches,
  reportSources,
  type SourcesReport,
} from "@/services/sources/registry";
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
  liveGetTickets,
  liveListBoards,
} from "./live";

async function resolved(): Promise<ConnectionStatus> {
  return getConnectionStatus();
}

const SNAPSHOT_TTL_MS = 60_000;

async function buildLiveSnapshot(): Promise<IntelligenceSnapshot> {
  const batches = await fetchAllBatches();
  return buildSnapshot(
    batches.map((b) => ({ board: b.board, tickets: b.tickets })),
    "live",
  );
}

async function getSnapshot(
  source: "mock" | "live",
): Promise<IntelligenceSnapshot> {
  const key = `snapshot:${source}`;
  const snap = await intelligenceCache.getOrSet(
    key,
    async () => (source === "live" ? buildLiveSnapshot() : buildMockSnapshot()),
    { ttlMs: SNAPSHOT_TTL_MS, tags: [CACHE_TAGS.snapshot] },
  );
  const latest = snapshotMemory.latest();
  if (!latest || latest.summary.generatedAt !== snap.generatedAt) {
    snapshotMemory.record(snap);
  }
  return snap;
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
  getNarratives(): Promise<Narrative[]>;
  getDiff(): Promise<SnapshotDiff | null>;
  getHistory(): Promise<SnapshotSummary[]>;
  getSources(): Promise<SourcesReport[]>;
}

class DispatchService implements MondayService {
  async getStatus() {
    return resolved();
  }

  async getDashboard(): Promise<DashboardData> {
    const status = await resolved();
    if (status.source === "live") {
      // STRICT: live mode does NOT silently fall back to mock.
      // Real data (possibly empty) is returned, or the error
      // surfaces to the UI as an error state.
      const snapshot = await getSnapshot("live");
      return renderDashboardData(snapshot);
    }
    const snap = await getSnapshot("mock");
    return renderDashboardData(snap);
  }

  async getSnapshot(): Promise<IntelligenceSnapshot> {
    const status = await resolved();
    if (status.source === "live") {
      return getSnapshot("live");
    }
    return getSnapshot("mock");
  }

  async getBriefing(): Promise<ExecutiveBriefing> {
    return generateBriefing(await this.getSnapshot());
  }

  async getNarratives(): Promise<Narrative[]> {
    const current = await this.getSnapshot();
    const prev = snapshotMemory.previous()?.full;
    const diff = prev ? diffSnapshots(prev, current) : undefined;
    return generateNarratives(current, diff);
  }

  async getDiff(): Promise<SnapshotDiff | null> {
    const current = await this.getSnapshot();
    const prev = snapshotMemory.previous()?.full;
    return prev ? diffSnapshots(prev, current) : null;
  }

  async getHistory(): Promise<SnapshotSummary[]> {
    // Cheap: avoid forcing a snapshot fetch just to read memory.
    return snapshotMemory.listSummaries();
  }

  async getSources(): Promise<SourcesReport[]> {
    return reportSources();
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

export function invalidateSnapshot(): number {
  return intelligenceCache.invalidate(CACHE_TAGS.snapshot);
}
