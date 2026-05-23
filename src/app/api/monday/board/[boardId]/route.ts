import { NextResponse } from "next/server";
import { mondayService } from "@/services/monday";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ boardId: string }> },
) {
  const { boardId } = await params;
  try {
    const meta = await mondayService.getBoardMeta(boardId);
    if (!meta) {
      return NextResponse.json({ error: "board_not_found" }, { status: 404 });
    }
    return NextResponse.json(meta);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
