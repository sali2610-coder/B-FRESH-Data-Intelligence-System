import { NextResponse } from "next/server";
import { mondayService } from "@/services/monday";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ branchId: string }> },
) {
  const { branchId } = await params;
  const { searchParams } = new URL(request.url);
  const boardId = searchParams.get("boardId") ?? "ops";
  try {
    const data = await mondayService.getBranchProfile(branchId, boardId);
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "branch_not_found" }, { status: 404 });
  }
}
