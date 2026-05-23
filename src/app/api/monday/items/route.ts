import { NextResponse } from "next/server";
import { mondayService } from "@/services/monday";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const boardIds = searchParams
    .getAll("boardId")
    .filter((v): v is string => !!v);
  try {
    const items = await mondayService.getTickets(
      boardIds.length ? boardIds : undefined,
    );
    const status = await mondayService.getStatus();
    return NextResponse.json({
      source: status.source,
      count: items.length,
      items,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json(
      { source: "error", count: 0, items: [], error: message },
      { status: 502 },
    );
  }
}
