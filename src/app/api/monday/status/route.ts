import { NextResponse } from "next/server";
import { mondayService } from "@/services/monday";
import { maskToken } from "@/lib/env";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const force = searchParams.get("force") === "1";
  const status = await (force
    ? (await import("@/services/monday/mode")).getConnectionStatus({ force: true })
    : mondayService.getStatus());

  return NextResponse.json({
    source: status.source,
    label: status.label,
    mode: status.configuredMode,
    hasToken: status.hasToken,
    hasBoards: status.hasBoards,
    accountName: status.accountName ?? null,
    tokenMasked: status.hasToken ? maskToken() : null,
    error: status.error ?? null,
    lastChecked: status.lastChecked,
  });
}
