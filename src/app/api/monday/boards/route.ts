import { NextResponse } from "next/server";
import { mondayService } from "@/services/monday";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    const boards = await mondayService.listBoards();
    const status = await mondayService.getStatus();
    return NextResponse.json({
      source: status.source,
      boards,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json(
      { source: "error", boards: [], error: message },
      { status: 502 },
    );
  }
}
