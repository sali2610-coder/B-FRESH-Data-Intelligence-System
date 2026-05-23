import "server-only";

import type { IntelligenceSnapshot } from "./types";
import type { SnapshotDiff } from "./diff";

/**
 * AI-style operational narrative — Hebrew sentences derived from the
 * snapshot (and optionally a diff against the previous snapshot).
 *
 * These are deterministic / rule-based today, but the shape matches
 * what an LLM would produce. When the AI Copilot lands, swap the
 * rule generator for an LLM call without changing the consumer.
 */

export type NarrativeKind =
  | "trend"
  | "alert"
  | "risk"
  | "improvement"
  | "anomaly"
  | "summary";

export type NarrativeImportance = "high" | "medium" | "low";

export type Narrative = {
  id: string;
  kind: NarrativeKind;
  importance: NarrativeImportance;
  sentence: string;
  /** Linkable references so UI can deep-link to the right entity. */
  refs?: {
    branchId?: string;
    region?: string;
    alertId?: string;
  };
  confidence: number; // 0..1
  generatedAt: string;
};

const REGION_HE: Record<string, string> = {
  north: "צפון",
  center: "מרכז",
  south: "דרום",
};

export function generateNarratives(
  snapshot: IntelligenceSnapshot,
  diff?: SnapshotDiff,
): Narrative[] {
  const out: Narrative[] = [];
  const at = snapshot.generatedAt;

  // ── Headline summary ──
  out.push({
    id: "n-headline",
    kind: "summary",
    importance: "high",
    sentence: `ציון בריאות הרשת כעת ${snapshot.networkScore}${
      snapshot.networkScoreTrend
        ? ` · ${snapshot.networkScoreTrend > 0 ? "+" : ""}${snapshot.networkScoreTrend}% מהמדידה הקודמת`
        : ""
    } · ${snapshot.branches.length} סניפים פעילים`,
    confidence: 0.99,
    generatedAt: at,
  });

  // ── Regional trends ──
  const sortedRegions = [...snapshot.regionalTrends].sort(
    (a, b) => b.trend - a.trend,
  );
  const improvingRegion = sortedRegions.find((r) => r.trend > 0);
  const decliningRegion = sortedRegions.find((r) => r.trend < 0);
  if (improvingRegion) {
    out.push({
      id: `n-region-up-${improvingRegion.region}`,
      kind: "improvement",
      importance: "medium",
      sentence: `אזור ${REGION_HE[improvingRegion.region]} משתפר — ${improvingRegion.trend > 0 ? "+" : ""}${improvingRegion.trend}% ב-${improvingRegion.branchCount} סניפים`,
      refs: { region: improvingRegion.region },
      confidence: 0.86,
      generatedAt: at,
    });
  }
  if (decliningRegion) {
    out.push({
      id: `n-region-down-${decliningRegion.region}`,
      kind: "trend",
      importance: "high",
      sentence: `אזור ${REGION_HE[decliningRegion.region]} בירידה — ${decliningRegion.trend}% מהשבוע הקודם`,
      refs: { region: decliningRegion.region },
      confidence: 0.83,
      generatedAt: at,
    });
  }

  // ── SLA-risk branches ──
  const riskBranches = snapshot.branchHealth.filter(
    (b) => b.components.sla >= 70 && b.components.sla < 80,
  );
  if (riskBranches.length > 0) {
    out.push({
      id: "n-sla-risk",
      kind: "risk",
      importance: "high",
      sentence: `${riskBranches.length} סניפים מתקרבים לחריגת SLA — נדרשת תשומת לב מנהלית`,
      refs:
        riskBranches.length === 1
          ? { branchId: riskBranches[0].branchId }
          : undefined,
      confidence: 0.82,
      generatedAt: at,
    });
  }

  // ── Maintenance overload ──
  const openMaintenance = snapshot.maintenance.filter(
    (m) => m.status !== "done",
  ).length;
  if (openMaintenance >= 12) {
    out.push({
      id: "n-maint-overload",
      kind: "alert",
      importance: openMaintenance >= 20 ? "high" : "medium",
      sentence: `עומס באחזקה — ${openMaintenance} קריאות פתוחות ברשת`,
      confidence: 0.9,
      generatedAt: at,
    });
  }

  // ── Complaint spike narrative ──
  for (const spike of snapshot.complaintSpikes.slice(0, 1)) {
    out.push({
      id: `n-spike-${spike.branchId}`,
      kind: "anomaly",
      importance: spike.severity === "high" ? "high" : "medium",
      sentence: `קפיצה בנפח תלונות ב-${spike.branchName} · +${spike.delta}% מהממוצע`,
      refs: { branchId: spike.branchId },
      confidence: 0.78,
      generatedAt: at,
    });
  }

  // ── Recurring failure ──
  for (const rec of snapshot.recurringFailures.slice(0, 1)) {
    out.push({
      id: `n-rec-${rec.branchId}`,
      kind: "alert",
      importance: rec.occurrences >= 5 ? "high" : "medium",
      sentence: `תקלה חוזרת ב-${rec.branchName} · "${rec.signature}" ${rec.occurrences} פעמים ב-${rec.windowDays} ימים`,
      refs: { branchId: rec.branchId },
      confidence: 0.84,
      generatedAt: at,
    });
  }

  // ── Diff-driven narratives ──
  if (diff) {
    if (diff.networkScoreDelta >= 2) {
      out.push({
        id: "n-network-up",
        kind: "improvement",
        importance: "medium",
        sentence: `הרשת השתפרה ב-${diff.networkScoreDelta} נקודות מאז המדידה הקודמת`,
        confidence: 0.9,
        generatedAt: at,
      });
    } else if (diff.networkScoreDelta <= -2) {
      out.push({
        id: "n-network-down",
        kind: "trend",
        importance: "high",
        sentence: `ירידה של ${Math.abs(diff.networkScoreDelta)} נקודות בציון הרשת מאז המדידה הקודמת`,
        confidence: 0.9,
        generatedAt: at,
      });
    }
    if (diff.newAlerts.length >= 3) {
      out.push({
        id: "n-new-alerts",
        kind: "alert",
        importance: "high",
        sentence: `${diff.newAlerts.length} התרעות חדשות מאז המדידה הקודמת`,
        confidence: 0.92,
        generatedAt: at,
      });
    }
    if (diff.resolvedAlerts.length >= 2) {
      out.push({
        id: "n-resolved",
        kind: "improvement",
        importance: "low",
        sentence: `${diff.resolvedAlerts.length} התרעות נסגרו`,
        confidence: 0.95,
        generatedAt: at,
      });
    }
    if (diff.branchesImproved.length > 0) {
      const top = diff.branchesImproved[0];
      out.push({
        id: `n-branch-up-${top.id}`,
        kind: "improvement",
        importance: "medium",
        sentence: `${top.name} השתפר ב-${top.delta} נקודות בריאות`,
        refs: { branchId: top.id },
        confidence: 0.88,
        generatedAt: at,
      });
    }
    if (diff.branchesDeclined.length > 0) {
      const top = diff.branchesDeclined[0];
      out.push({
        id: `n-branch-down-${top.id}`,
        kind: "risk",
        importance: "high",
        sentence: `${top.name} ירד ב-${Math.abs(top.delta)} נקודות — מומלץ לבדוק`,
        refs: { branchId: top.id },
        confidence: 0.86,
        generatedAt: at,
      });
    }
  }

  return out;
}
