import { NextResponse } from "next/server";
import { mondayService } from "@/services/monday";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Returns the central IntelligenceSnapshot — the platform's source of truth.
 * AI consumers (LLM copilot, downstream analytics, reporting) should pull
 * this exclusively. Never assemble entities from raw Monday rows.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slim = searchParams.get("slim") === "1";
  try {
    const snapshot = await mondayService.getSnapshot();
    if (slim) {
      // Drop raw entities for compact AI prompts.
      const {
        complaints: _c,
        maintenance: _m,
        inspections: _i,
        recruitmentLeads: _r,
        franchiseLeads: _f,
        marketingCampaigns: _mk,
        ...rest
      } = snapshot;
      void _c;
      void _m;
      void _i;
      void _r;
      void _f;
      void _mk;
      return NextResponse.json(rest, {
        headers: { "x-bfresh-source": snapshot.mode },
      });
    }
    return NextResponse.json(snapshot, {
      headers: { "x-bfresh-source": snapshot.mode },
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Snapshot failed" },
      { status: 500 },
    );
  }
}
