import type { DashboardData } from "@/types/domain";
import { generateDashboardData } from "@/mocks/seed";

const SIMULATED_LATENCY_MS = 350;

function delay<T>(value: T, ms = SIMULATED_LATENCY_MS): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

export interface MondayService {
  getDashboard(boardId?: string): Promise<DashboardData>;
}

class MockMondayService implements MondayService {
  async getDashboard(boardId = "ops"): Promise<DashboardData> {
    const seed = boardId
      .split("")
      .reduce((acc, ch) => acc + ch.charCodeAt(0), 42);
    return delay(generateDashboardData(seed));
  }
}

export const mondayService: MondayService = new MockMondayService();
