"use client";

import { useQuery } from "@tanstack/react-query";
import type {
  ComplaintEntity,
  EmployeeEntity,
} from "@/domain";

export type ComplaintsFilters = {
  status?: string;
  slaState?: string;
  owner?: string;
  from?: string;
  to?: string;
};

export type ComplaintsResponse = {
  source: "mock" | "live";
  total: number;
  complaints: ComplaintEntity[];
  employees: Pick<EmployeeEntity, "id" | "name" | "avatarColor">[];
};

async function fetchComplaints(
  filters: ComplaintsFilters,
): Promise<ComplaintsResponse> {
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(filters)) {
    if (v && v !== "all") qs.set(k, v);
  }
  const res = await fetch(`/api/intelligence/complaints?${qs.toString()}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to load complaints");
  return res.json();
}

export function useComplaints(filters: ComplaintsFilters = {}) {
  return useQuery({
    queryKey: ["complaints", filters],
    queryFn: () => fetchComplaints(filters),
    refetchInterval: 60_000,
  });
}
