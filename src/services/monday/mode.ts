import "server-only";

import { env, hasToken } from "@/lib/env";
import { getEnabledBoards } from "@/config/mondayBoards";
import { pingMonday } from "@/lib/monday/client";

export type ConnectionStatus = {
  /** Resolved data source the dashboard will use right now. */
  source: "mock" | "live";
  /** User-facing label key the UI can localize. */
  label: "live" | "mock" | "error";
  /** Configured mode, before resolution. */
  configuredMode: "mock" | "live" | "auto";
  hasToken: boolean;
  hasBoards: boolean;
  error?: { kind: string; message: string };
  /** Friendly account name when live succeeded. */
  accountName?: string;
  lastChecked: string;
};

let cached: { value: ConnectionStatus; at: number } | null = null;
const CACHE_TTL_MS = 30_000;

export async function getConnectionStatus(
  opts: { force?: boolean } = {},
): Promise<ConnectionStatus> {
  if (!opts.force && cached && Date.now() - cached.at < CACHE_TTL_MS) {
    return cached.value;
  }
  const status = await computeStatus();
  cached = { value: status, at: Date.now() };
  return status;
}

async function computeStatus(): Promise<ConnectionStatus> {
  const mode = env.BFRESH_DATA_MODE;
  const tokenPresent = hasToken();
  const hasBoards = getEnabledBoards().length > 0;
  const base = {
    configuredMode: mode,
    hasToken: tokenPresent,
    hasBoards,
    lastChecked: new Date().toISOString(),
  } as const;

  if (mode === "mock") {
    return { ...base, source: "mock", label: "mock" };
  }

  if (mode === "live") {
    if (!tokenPresent) {
      return {
        ...base,
        source: "mock",
        label: "error",
        error: {
          kind: "auth",
          message: "Configured for live but MONDAY_API_TOKEN is missing",
        },
      };
    }
    const ping = await pingMonday();
    if (!ping.ok) {
      return {
        ...base,
        source: "mock",
        label: "error",
        error: { kind: ping.kind, message: ping.message },
      };
    }
    return {
      ...base,
      source: "live",
      label: "live",
      accountName: ping.accountName,
    };
  }

  // auto
  if (!tokenPresent) {
    return { ...base, source: "mock", label: "mock" };
  }
  const ping = await pingMonday();
  if (!ping.ok) {
    return {
      ...base,
      source: "mock",
      label: "error",
      error: { kind: ping.kind, message: ping.message },
    };
  }
  return {
    ...base,
    source: "live",
    label: "live",
    accountName: ping.accountName,
  };
}
