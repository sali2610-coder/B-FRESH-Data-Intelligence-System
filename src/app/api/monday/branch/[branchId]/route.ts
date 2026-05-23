import { NextResponse } from "next/server";
import { mondayService } from "@/services/monday";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ branchId: string }> },
) {
  const { branchId } = await params;
  try {
    const data = await mondayService.getBranchProfile(branchId);
    const status = await mondayService.getStatus();
    return NextResponse.json(data, {
      headers: {
        "x-bfresh-source": status.source,
        "x-bfresh-label": status.label,
      },
    });
  } catch {
    return NextResponse.json({ error: "branch_not_found" }, { status: 404 });
  }
}
