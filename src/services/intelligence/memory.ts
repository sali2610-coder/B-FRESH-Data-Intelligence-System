import "server-only";

import type { IntelligenceSnapshot } from "./types";

/**
 * Rolling in-process snapshot memory. Keeps a short window of recent
 * snapshots so the engine can compute trends, deltas and narrative
 * comparisons without going back to the source.
 *
 * Single-process / single-instance store. For production multi-instance
 * deployments swap the backing store for Redis / Vercel KV — interface
 * (record/list/latest/snapshotAt) stays the same.
 */

const MAX_ENTRIES = 24;

export type SnapshotSummary = {
  generatedAt: string;
  mode: "mock" | "live";
  networkScore: number;
  networkScoreTrend: number;
  totals: Record<string, number>;
  criticalAlerts: number;
  highAlerts: number;
};

type HistoryEntry = {
  summary: SnapshotSummary;
  /** Heavy snapshot retained only for the latest few entries to save memory. */
  full?: IntelligenceSnapshot;
};

class SnapshotMemory {
  private buf: HistoryEntry[] = [];

  record(snapshot: IntelligenceSnapshot): void {
    const summary: SnapshotSummary = {
      generatedAt: snapshot.generatedAt,
      mode: snapshot.mode,
      networkScore: snapshot.networkScore,
      networkScoreTrend: snapshot.networkScoreTrend,
      totals: snapshot.audit.totals,
      criticalAlerts: snapshot.alerts.filter((a) => a.severity === "critical")
        .length,
      highAlerts: snapshot.alerts.filter((a) => a.severity === "high").length,
    };

    // Drop full data on older entries to keep memory bounded.
    for (let i = 0; i < this.buf.length; i++) {
      if (i < this.buf.length - 2) this.buf[i].full = undefined;
    }

    this.buf.push({ summary, full: snapshot });
    if (this.buf.length > MAX_ENTRIES) {
      this.buf = this.buf.slice(-MAX_ENTRIES);
    }
  }

  latest(): HistoryEntry | undefined {
    return this.buf[this.buf.length - 1];
  }

  previous(): HistoryEntry | undefined {
    return this.buf[this.buf.length - 2];
  }

  listSummaries(): SnapshotSummary[] {
    return this.buf.map((e) => e.summary);
  }

  /** Returns the entry recorded ≥`ms` milliseconds before `to`. */
  snapshotAt(ms: number, to: Date = new Date()): HistoryEntry | undefined {
    const cutoff = to.getTime() - ms;
    for (let i = this.buf.length - 1; i >= 0; i--) {
      if (new Date(this.buf[i].summary.generatedAt).getTime() <= cutoff) {
        return this.buf[i];
      }
    }
    return undefined;
  }

  clear(): void {
    this.buf = [];
  }

  size(): number {
    return this.buf.length;
  }
}

export const snapshotMemory = new SnapshotMemory();
