import { NextResponse } from "next/server";
import { mondayService } from "@/services/monday";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    const narratives = await mondayService.getNarratives();
    return NextResponse.json({ narratives, generatedAt: new Date().toISOString() });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Narratives failed" },
      { status: 500 },
    );
  }
}
