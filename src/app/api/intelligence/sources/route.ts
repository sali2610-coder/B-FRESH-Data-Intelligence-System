import { NextResponse } from "next/server";
import { mondayService } from "@/services/monday";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** Reports health of every registered SourceAdapter — Monday + stubs. */
export async function GET() {
  const sources = await mondayService.getSources();
  return NextResponse.json({
    sources,
    enabledCount: sources.filter((s) => s.enabled).length,
    totalCount: sources.length,
  });
}
