"use client";

import { useQuery } from "@tanstack/react-query";
import type { DashboardData } from "@/types/domain";

async function fetchDashboard(): Promise<DashboardData> {
  const res = await fetch("/api/monday/dashboard", { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load dashboard");
  return res.json();
}

export type UseDashboardOpts = {
  /** Polling interval in ms. Pass 0 / undefined to disable. */
  refetchIntervalMs?: number;
};

export function useDashboard(opts: UseDashboardOpts = {}) {
  const refetchInterval = opts.refetchIntervalMs && opts.refetchIntervalMs > 0
    ? opts.refetchIntervalMs
    : false;
  return useQuery({
    queryKey: ["dashboard"],
    queryFn: fetchDashboard,
    refetchInterval,
  });
}
