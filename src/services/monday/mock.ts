import "server-only";

import type { BranchProfile, DashboardData } from "@/types/domain";
import { generateDashboardData } from "@/mocks/seed";
import { generateBranchProfile } from "@/mocks/branchProfile";
import type { MondayBoardMeta, MondayBoardSummary } from "@/lib/monday/types";

const SIMULATED_LATENCY_MS = 350;

function delay<T>(value: T, ms = SIMULATED_LATENCY_MS): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

function boardSeed(boardId: string) {
  return boardId.split("").reduce((acc, ch) => acc + ch.charCodeAt(0), 42);
}

export async function mockGetDashboard(boardId = "ops"): Promise<DashboardData> {
  return delay(generateDashboardData(boardSeed(boardId)));
}

export async function mockGetBranchProfile(
  branchId: string,
  boardId = "ops",
): Promise<BranchProfile> {
  const data = generateDashboardData(boardSeed(boardId));
  const profile = generateBranchProfile(data, branchId);
  if (!profile) throw new Error(`Branch ${branchId} not found in mock data`);
  return delay(profile);
}

export async function mockListBoards(): Promise<MondayBoardSummary[]> {
  return delay([
    {
      id: "mock-ops",
      name: "תפעול ראשי · דמה",
      board_kind: "public",
      state: "active",
      items_count: 240,
      workspace: { id: "mock-ws", name: "B-FRESH · Demo" },
    },
    {
      id: "mock-cs",
      name: "תלונות לקוחות · דמה",
      board_kind: "public",
      state: "active",
      items_count: 86,
      workspace: { id: "mock-ws", name: "B-FRESH · Demo" },
    },
  ]);
}

export async function mockGetBoardMeta(
  boardId: string,
): Promise<MondayBoardMeta | null> {
  const boards = await mockListBoards();
  const b = boards.find((x) => x.id === boardId);
  if (!b) return null;
  return delay({
    id: b.id,
    name: b.name,
    description: "Mock board — synthetic data",
    state: b.state,
    items_count: b.items_count,
    groups: [
      { id: "open", title: "פתוח", color: "#12a9e8" },
      { id: "wip", title: "בטיפול", color: "#ffb454" },
      { id: "done", title: "הושלם", color: "#3ed598" },
    ],
    columns: [
      { id: "status", title: "סטטוס", type: "status", settings_str: "" },
      { id: "priority", title: "עדיפות", type: "color", settings_str: "" },
      { id: "branch", title: "סניף", type: "text", settings_str: "" },
      { id: "owner", title: "אחראי", type: "people", settings_str: "" },
      { id: "dueDate", title: "יעד", type: "date", settings_str: "" },
    ],
  });
}
