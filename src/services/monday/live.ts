import "server-only";

import type { BranchProfile, DashboardData } from "@/types/domain";
import { generateBranchProfile } from "@/mocks/branchProfile";
import { mondayRequest } from "@/lib/monday/client";
import {
  BOARD_ITEMS_QUERY,
  BOARD_META_QUERY,
  BOARDS_LIST_QUERY,
} from "@/lib/monday/queries";
import type {
  MondayBoardMeta,
  MondayBoardSummary,
  MondayItem,
  MondayItemsPage,
  NormalizedTicket,
} from "@/lib/monday/types";
import { normalizeItem } from "@/lib/monday/normalize";
import { getEnabledBoards } from "@/config/mondayBoards";
import { buildDashboardFromTickets } from "./analytics";
import { MondayApiError } from "@/lib/monday/errors";

const MAX_PAGES_PER_BOARD = 10; // hard upper bound to keep things sane
const PAGE_SIZE = 100;

type BoardItemsResponse = {
  boards: { items_page: MondayItemsPage }[];
};

async function fetchAllItems(boardId: string): Promise<MondayItem[]> {
  const items: MondayItem[] = [];
  let cursor: string | null = null;
  for (let p = 0; p < MAX_PAGES_PER_BOARD; p++) {
    const data: BoardItemsResponse = await mondayRequest<BoardItemsResponse>(
      BOARD_ITEMS_QUERY,
      {
        variables: { boardId: [boardId], cursor, limit: PAGE_SIZE },
      },
    );
    const page = data.boards?.[0]?.items_page;
    if (!page) break;
    items.push(...page.items);
    if (!page.cursor) break;
    cursor = page.cursor;
  }
  return items;
}

export async function liveListBoards(): Promise<MondayBoardSummary[]> {
  const data = await mondayRequest<{ boards: MondayBoardSummary[] }>(
    BOARDS_LIST_QUERY,
    { variables: { limit: 100 } },
  );
  return data.boards ?? [];
}

export async function liveGetBoardMeta(
  boardId: string,
): Promise<MondayBoardMeta | null> {
  const data = await mondayRequest<{ boards: MondayBoardMeta[] }>(
    BOARD_META_QUERY,
    { variables: { boardId: [boardId] } },
  );
  return data.boards?.[0] ?? null;
}

/**
 * Returns board meta + a few sample items so an operator can
 * eyeball the column IDs to map. Used by the inspection route.
 */
export type BoardInspection = {
  meta: MondayBoardMeta;
  sampleItems: {
    id: string;
    name: string;
    group: string | null;
    columns: {
      id: string;
      title: string;
      type: string;
      text: string | null;
      value: string | null;
    }[];
  }[];
};

export async function liveGetBoardInspection(
  boardId: string,
  sampleLimit = 5,
): Promise<BoardInspection | null> {
  const [meta, itemsData] = await Promise.all([
    liveGetBoardMeta(boardId),
    mondayRequest<BoardItemsResponse>(BOARD_ITEMS_QUERY, {
      variables: { boardId: [boardId], cursor: null, limit: sampleLimit },
    }),
  ]);
  if (!meta) return null;
  const colMeta = new Map(
    meta.columns.map((c) => [c.id, { title: c.title, type: c.type }]),
  );
  const items = itemsData.boards?.[0]?.items_page?.items ?? [];
  return {
    meta,
    sampleItems: items.map((it) => ({
      id: it.id,
      name: it.name,
      group: it.group?.title ?? null,
      columns: it.column_values.map((c) => {
        const m = colMeta.get(c.id);
        return {
          id: c.id,
          title: m?.title ?? c.id,
          type: m?.type ?? c.type,
          text: c.text,
          value: c.value,
        };
      }),
    })),
  };
}

export async function liveGetTickets(
  boardIds?: string[],
): Promise<NormalizedTicket[]> {
  const batches = await liveGetTicketBatches(boardIds);
  return batches.flatMap((b) => b.tickets);
}

export type LiveBatch = {
  board: import("@/config/mondayBoards").MondayBoardConfig;
  tickets: NormalizedTicket[];
};

export async function liveGetTicketBatches(
  boardIds?: string[],
): Promise<LiveBatch[]> {
  const all = getEnabledBoards();
  const target = boardIds && boardIds.length
    ? all.filter((b) => boardIds.includes(b.id))
    : all;

  if (target.length === 0) {
    throw new MondayApiError(
      "config",
      "No Monday boards configured. Add them in src/config/mondayBoards.ts",
    );
  }

  const out: LiveBatch[] = [];
  for (const board of target) {
    const items = await fetchAllItems(board.id);
    const normalized = items.map((it) => normalizeItem(it, board));
    out.push({ board, tickets: normalized });
  }
  return out;
}

export async function liveGetDashboard(): Promise<DashboardData> {
  const tickets = await liveGetTickets();
  return buildDashboardFromTickets(tickets);
}

/**
 * Branch profile in live mode. Because the existing UI expects a rich
 * BranchProfile shape (including maintenance / inspections / staffing /
 * timeline), and those depend on additional boards not yet wired, we
 * compose the live KPIs with synthetic detail panels. Once dedicated
 * boards exist, swap the synthetic parts here.
 */
export async function liveGetBranchProfile(
  branchId: string,
): Promise<BranchProfile> {
  const dashboard = await liveGetDashboard();
  const profile = generateBranchProfile(dashboard, branchId);
  if (!profile) {
    throw new MondayApiError(
      "config",
      `Branch ${branchId} not found in live dashboard data`,
    );
  }
  return profile;
}
