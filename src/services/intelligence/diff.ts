import "server-only";

import type { IntelligenceSnapshot } from "./types";

export type SnapshotDiff = {
  fromAt: string;
  toAt: string;
  networkScoreDelta: number;
  alertsDelta: number;
  criticalDelta: number;
  branchesImproved: { id: string; name: string; delta: number }[];
  branchesDeclined: { id: string; name: string; delta: number }[];
  newAlerts: { id: string; title: string; severity: string }[];
  resolvedAlerts: { id: string; title: string }[];
};

/**
 * Computes a structured diff between two snapshots. Used to drive
 * the AI narrative layer and the live event stream.
 */
export function diffSnapshots(
  previous: IntelligenceSnapshot,
  current: IntelligenceSnapshot,
): SnapshotDiff {
  const prevHealthById = new Map(
    previous.branchHealth.map((b) => [b.branchId, b]),
  );
  const branchesImproved: SnapshotDiff["branchesImproved"] = [];
  const branchesDeclined: SnapshotDiff["branchesDeclined"] = [];
  for (const b of current.branchHealth) {
    const prev = prevHealthById.get(b.branchId);
    if (!prev) continue;
    const delta = b.score - prev.score;
    if (delta >= 3) {
      branchesImproved.push({ id: b.branchId, name: b.branchName, delta });
    } else if (delta <= -3) {
      branchesDeclined.push({ id: b.branchId, name: b.branchName, delta });
    }
  }
  branchesImproved.sort((a, b) => b.delta - a.delta);
  branchesDeclined.sort((a, b) => a.delta - b.delta);

  const prevAlertIds = new Set(previous.alerts.map((a) => a.id));
  const curAlertIds = new Set(current.alerts.map((a) => a.id));
  const newAlerts = current.alerts
    .filter((a) => !prevAlertIds.has(a.id))
    .map((a) => ({ id: a.id, title: a.title, severity: a.severity }));
  const resolvedAlerts = previous.alerts
    .filter((a) => !curAlertIds.has(a.id))
    .map((a) => ({ id: a.id, title: a.title }));

  return {
    fromAt: previous.generatedAt,
    toAt: current.generatedAt,
    networkScoreDelta: current.networkScore - previous.networkScore,
    alertsDelta: current.alerts.length - previous.alerts.length,
    criticalDelta:
      current.alerts.filter((a) => a.severity === "critical").length -
      previous.alerts.filter((a) => a.severity === "critical").length,
    branchesImproved,
    branchesDeclined,
    newAlerts,
    resolvedAlerts,
  };
}
