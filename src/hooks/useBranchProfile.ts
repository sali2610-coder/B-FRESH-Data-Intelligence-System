"use client";

import { useQuery } from "@tanstack/react-query";
import type { BranchProfile } from "@/types/domain";

async function fetchProfile(branchId: string): Promise<BranchProfile> {
  const res = await fetch(`/api/monday/branch/${branchId}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to load branch profile");
  return res.json();
}

export function useBranchProfile(branchId: string) {
  return useQuery({
    queryKey: ["branchProfile", branchId],
    queryFn: () => fetchProfile(branchId),
    enabled: !!branchId,
  });
}
