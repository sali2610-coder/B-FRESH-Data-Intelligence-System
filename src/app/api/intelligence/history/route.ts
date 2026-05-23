import { NextResponse } from "next/server";
import { mondayService } from "@/services/monday";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  // Touch snapshot first so the buffer has at least one entry.
  await mondayService.getSnapshot();
  const history = await mondayService.getHistory();
  const diff = await mondayService.getDiff();
  return NextResponse.json({ history, diff });
}
