import { NextResponse } from "next/server";
import { mondayService } from "@/services/monday";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const boardId = searchParams.get("boardId") ?? "ops";
  const data = await mondayService.getDashboard(boardId);
  return NextResponse.json(data);
}
