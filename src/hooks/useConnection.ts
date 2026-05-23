"use client";

import { useQuery } from "@tanstack/react-query";

export type ConnectionInfo = {
  source: "mock" | "live";
  label: "live" | "mock" | "error";
  mode: "mock" | "live" | "auto";
  hasToken: boolean;
  hasBoards: boolean;
  accountName: string | null;
  tokenMasked: string | null;
  error: { kind: string; message: string } | null;
  lastChecked: string;
};

async function fetchStatus(force?: boolean): Promise<ConnectionInfo> {
  const res = await fetch(
    `/api/monday/status${force ? "?force=1" : ""}`,
    { cache: "no-store" },
  );
  if (!res.ok) throw new Error("Failed to load connection status");
  return res.json();
}

export function useConnection() {
  return useQuery({
    queryKey: ["connection"],
    queryFn: () => fetchStatus(),
    staleTime: 30_000,
    refetchInterval: 60_000,
    refetchOnWindowFocus: true,
  });
}

export async function pingConnection() {
  return fetchStatus(true);
}
