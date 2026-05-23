"use client";

import { useQuery } from "@tanstack/react-query";

export type Narrative = {
  id: string;
  kind: "trend" | "alert" | "risk" | "improvement" | "anomaly" | "summary";
  importance: "high" | "medium" | "low";
  sentence: string;
  refs?: { branchId?: string; region?: string; alertId?: string };
  confidence: number;
  generatedAt: string;
};

async function fetchNarratives(): Promise<{
  narratives: Narrative[];
  generatedAt: string;
}> {
  const res = await fetch("/api/intelligence/narratives", {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to load narratives");
  return res.json();
}

export function useNarratives(opts: { refetchIntervalMs?: number } = {}) {
  const refetchInterval =
    opts.refetchIntervalMs && opts.refetchIntervalMs > 0
      ? opts.refetchIntervalMs
      : 30_000;
  return useQuery({
    queryKey: ["narratives"],
    queryFn: fetchNarratives,
    refetchInterval,
  });
}
