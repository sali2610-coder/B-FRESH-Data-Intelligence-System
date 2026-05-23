import "server-only";

import { mondayAdapter } from "./monday";
import {
  biExportAdapter,
  deliveryAdapter,
  formsAdapter,
  hrAdapter,
  posAdapter,
  sapAdapter,
  whatsappAdapter,
} from "./stubs";
import type { SourceAdapter, SourceBatch, SourceHealth } from "./types";

/** Every source the platform knows about. Order does not matter. */
export const ADAPTERS: SourceAdapter[] = [
  mondayAdapter,
  whatsappAdapter,
  formsAdapter,
  posAdapter,
  sapAdapter,
  hrAdapter,
  deliveryAdapter,
  biExportAdapter,
];

export function getEnabledAdapters(): SourceAdapter[] {
  return ADAPTERS.filter((a) => a.isEnabled());
}

export type SourcesReport = {
  kind: string;
  name: string;
  enabled: boolean;
  health: SourceHealth;
};

export async function reportSources(): Promise<SourcesReport[]> {
  return Promise.all(
    ADAPTERS.map(async (a) => ({
      kind: a.kind,
      name: a.name,
      enabled: a.isEnabled(),
      health: await a.health(),
    })),
  );
}

/**
 * Pulls batches from every enabled adapter in parallel.
 * The intelligence aggregator treats them all identically — no special
 * casing per source type.
 */
export async function fetchAllBatches(): Promise<SourceBatch[]> {
  const enabled = getEnabledAdapters();
  if (enabled.length === 0) return [];
  const results = await Promise.allSettled(
    enabled.map((a) => a.fetchBatches()),
  );
  const out: SourceBatch[] = [];
  for (const r of results) {
    if (r.status === "fulfilled") out.push(...r.value);
  }
  return out;
}
