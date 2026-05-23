import type { BranchProfile, DashboardData } from "@/types/domain";
import { generateDashboardData } from "@/mocks/seed";
import { generateBranchProfile } from "@/mocks/branchProfile";

const SIMULATED_LATENCY_MS = 350;

function delay<T>(value: T, ms = SIMULATED_LATENCY_MS): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

export interface MondayService {
  getDashboard(boardId?: string): Promise<DashboardData>;
  getBranchProfile(branchId: string, boardId?: string): Promise<BranchProfile>;
}

class MockMondayService implements MondayService {
  async getDashboard(boardId = "ops"): Promise<DashboardData> {
    const seed = boardId
      .split("")
      .reduce((acc, ch) => acc + ch.charCodeAt(0), 42);
    return delay(generateDashboardData(seed));
  }

  async getBranchProfile(
    branchId: string,
    boardId = "ops",
  ): Promise<BranchProfile> {
    const seed = boardId
      .split("")
      .reduce((acc, ch) => acc + ch.charCodeAt(0), 42);
    const data = generateDashboardData(seed);
    const profile = generateBranchProfile(data, branchId);
    if (!profile) {
      throw new Error(`Branch ${branchId} not found`);
    }
    return delay(profile);
  }
}

export const mondayService: MondayService = new MockMondayService();
