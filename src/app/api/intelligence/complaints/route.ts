import { NextResponse } from "next/server";
import { mondayService } from "@/services/monday";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Returns just the complaints array from the snapshot, optional filters.
 *
 *   ?status=open|in_progress|blocked|done
 *   ?slaState=ok|at_risk|breached
 *   ?owner=<employeeId>
 *   ?from=YYYY-MM-DD&to=YYYY-MM-DD   filter by createdAt
 *   ?limit=N                          truncate (default 500)
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const slaState = searchParams.get("slaState");
  const owner = searchParams.get("owner");
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const limit = Math.min(2000, Number(searchParams.get("limit") ?? "500"));

  try {
    const snapshot = await mondayService.getSnapshot();
    let items = snapshot.complaints;
    if (status) items = items.filter((c) => c.status === status);
    if (slaState) items = items.filter((c) => c.slaState === slaState);
    if (owner) items = items.filter((c) => c.assigneeId === owner);
    if (from) items = items.filter((c) => c.createdAt >= from);
    if (to) items = items.filter((c) => c.createdAt <= to);

    return NextResponse.json({
      source: snapshot.mode,
      total: items.length,
      complaints: items.slice(0, limit),
      employees: snapshot.employees.map((e) => ({
        id: e.id,
        name: e.name,
        avatarColor: e.avatarColor,
      })),
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Snapshot failed" },
      { status: 500 },
    );
  }
}
