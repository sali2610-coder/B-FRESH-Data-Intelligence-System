import "server-only";

import type { BranchProfile, DashboardData } from "@/types/domain";
import type { MondayBoardMeta, MondayBoardSummary, NormalizedTicket } from "@/lib/monday/types";
import { getConnectionStatus, type ConnectionStatus } from "./mode";
import {
  mockGetBoardMeta,
  mockGetBranchProfile,
  mockGetDashboard,
  mockListBoards,
} from "./mock";
import {
  liveGetBoardMeta,
  liveGetBranchProfile,
  liveGetDashboard,
  liveGetTickets,
  liveListBoards,
} from "./live";

/**
 * Resolves which backend to use for this request based on env mode
 * (mock | live | auto) and Monday connectivity. Falls back to mock on
 * any live failure so the UI never breaks.
 */
async function resolved(): Promise<ConnectionStatus> {
  return getConnectionStatus();
}

export interface MondayService {
  getStatus(): Promise<ConnectionStatus>;
  getDashboard(): Promise<DashboardData>;
  getBranchProfile(branchId: string): Promise<BranchProfile>;
  listBoards(): Promise<MondayBoardSummary[]>;
  getBoardMeta(boardId: string): Promise<MondayBoardMeta | null>;
  getTickets(boardIds?: string[]): Promise<NormalizedTicket[]>;
}

class DispatchService implements MondayService {
  async getStatus() {
    return resolved();
  }

  async getDashboard(): Promise<DashboardData> {
    const status = await resolved();
    if (status.source === "live") {
      try {
        return await liveGetDashboard();
      } catch {
        return mockGetDashboard();
      }
    }
    return mockGetDashboard();
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
    // Mock tickets are not exposed as raw normalized rows.
    return [];
  }
}

export const mondayService: MondayService = new DispatchService();
