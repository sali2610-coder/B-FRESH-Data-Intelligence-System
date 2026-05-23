import { NextResponse } from "next/server";
import { invalidateSnapshot } from "@/services/monday";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** Force-invalidates the cached snapshot. Triggers a fresh build on next GET. */
export async function POST() {
  const removed = invalidateSnapshot();
  return NextResponse.json({ ok: true, removed });
}
