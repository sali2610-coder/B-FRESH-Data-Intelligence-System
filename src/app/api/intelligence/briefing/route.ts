import { NextResponse } from "next/server";
import { mondayService } from "@/services/monday";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** Executive briefing — compact, AI-friendly summary of the snapshot. */
export async function GET() {
  try {
    const briefing = await mondayService.getBriefing();
    return NextResponse.json(briefing, {
      headers: { "x-bfresh-source": briefing.mode },
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Briefing failed" },
      { status: 500 },
    );
  }
}
