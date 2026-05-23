"use client";

import { useQuery } from "@tanstack/react-query";
import type { DashboardData } from "@/types/domain";

async function fetchDashboard(boardId: string): Promise<DashboardData> {
  const res = await fetch(`/api/monday/dashboard?boardId=${boardId}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to load dashboard");
  return res.json();
}

export function useDashboard(boardId = "ops") {
  return useQuery({
    queryKey: ["dashboard", boardId],
    queryFn: () => fetchDashboard(boardId),
  });
}
