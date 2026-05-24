import { NextResponse } from "next/server";
import { mondayService } from "@/services/monday";
import { liveGetBoardInspection } from "@/services/monday/live";
import { getBoardById } from "@/config/mondayBoards";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Diagnostic endpoint for column mapping.
 *
 *   GET /api/monday/board/<boardId>           — meta + 5 sample items (default)
 *   GET /api/monday/board/<boardId>?meta=1    — meta only (no items)
 *   GET /api/monday/board/<boardId>?samples=N — meta + N samples (max 25)
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ boardId: string }> },
) {
  const { boardId } = await params;
  const { searchParams } = new URL(request.url);
  const metaOnly = searchParams.get("meta") === "1";
  const samplesParam = Number(searchParams.get("samples") ?? "5");
  const limit = Math.min(25, Math.max(1, Number.isFinite(samplesParam) ? samplesParam : 5));

  const status = await mondayService.getStatus();
  const registered = getBoardById(boardId);

  try {
    if (status.source !== "live" || metaOnly) {
      const meta = await mondayService.getBoardMeta(boardId);
      if (!meta) {
        return NextResponse.json({ error: "board_not_found" }, { status: 404 });
      }
      return NextResponse.json({
        boardId,
        source: status.source,
        registered: registered
          ? {
              name: registered.name,
              department: registered.department,
              entityType: registered.entityType,
              enabled: registered.enabled !== false,
              currentColumns: registered.columns,
            }
          : null,
        meta,
      });
    }

    const inspection = await liveGetBoardInspection(boardId, limit);
    if (!inspection) {
      return NextResponse.json({ error: "board_not_found" }, { status: 404 });
    }
    return NextResponse.json({
      boardId,
      source: status.source,
      registered: registered
        ? {
            name: registered.name,
            department: registered.department,
            entityType: registered.entityType,
            enabled: registered.enabled !== false,
            currentColumns: registered.columns,
          }
        : null,
      board: {
        id: inspection.meta.id,
        name: inspection.meta.name,
        description: inspection.meta.description,
        items_count: inspection.meta.items_count,
      },
      groups: inspection.meta.groups,
      columns: inspection.meta.columns.map((c) => ({
        id: c.id,
        title: c.title,
        type: c.type,
      })),
      sampleItems: inspection.sampleItems,
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Unknown error" },
      { status: 502 },
    );
  }
}
