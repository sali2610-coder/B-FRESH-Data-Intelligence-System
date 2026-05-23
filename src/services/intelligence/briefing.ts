import "server-only";

import type { ExecutiveBriefing, IntelligenceSnapshot } from "./types";

/**
 * Compact, AI-friendly executive briefing. Reads the IntelligenceSnapshot
 * and returns a structured narrative an LLM can summarise verbatim or
 * augment with rationale. No prose generation here — that's a future
 * LLM step (Vercel AI Gateway).
 */
export function generateBriefing(
  snapshot: IntelligenceSnapshot,
): ExecutiveBriefing {
  const critical = snapshot.alerts.filter((a) => a.severity === "critical");
  const high = snapshot.alerts.filter((a) => a.severity === "high");

  const whatBurning: string[] = critical
    .slice(0, 5)
    .map((a) => `${a.title} — ${a.detail}`);

  const whatImproved: string[] = [];
  const positiveInsights = snapshot.insights
    .filter((i) => i.kind === "positive")
    .slice(0, 3);
  for (const i of positiveInsights) {
    whatImproved.push(`${i.title} — ${i.detail}`);
  }

  const whereAttention: string[] = [];
  const attentionBranches = snapshot.branchHealth
    .filter((b) => b.status === "attention" || b.status === "critical")
    .slice(0, 5);
  for (const b of attentionBranches) {
    whereAttention.push(
      `${b.branchName} (ציון ${b.score}) — ${b.status === "critical" ? "קריטי" : "דורש מענה"}`,
    );
  }
  for (const a of high.slice(0, 3)) {
    whereAttention.push(`${a.title} — ${a.detail}`);
  }

  const strongest = [...snapshot.regionalTrends].sort(
    (a, b) => b.avgHealth - a.avgHealth,
  )[0];
  const weakest = [...snapshot.regionalTrends].sort(
    (a, b) => a.avgHealth - b.avgHealth,
  )[0];

  const topPriorityActions = snapshot.insights
    .filter((i) => i.recommendation && i.importance !== "low")
    .slice(0, 4)
    .map((i) => ({
      title: i.title,
      detail: i.recommendation ?? "",
      expectedImpact: i.metric,
    }));

  const trend = snapshot.networkScoreTrend;
  const headline = `ציון רשת ${snapshot.networkScore} · ${
    trend >= 0 ? "+" : ""
  }${trend}% מהשבוע הקודם · ${critical.length} התרעות קריטיות`;

  return {
    generatedAt: snapshot.generatedAt,
    mode: snapshot.mode,
    headline,
    networkScore: snapshot.networkScore,
    trend,
    whatBurning,
    whatImproved,
    whereAttention,
    strongestRegion: strongest
      ? { region: strongest.region, avgHealth: strongest.avgHealth }
      : null,
    weakestRegion: weakest
      ? { region: weakest.region, avgHealth: weakest.avgHealth }
      : null,
    topPriorityActions,
  };
}
