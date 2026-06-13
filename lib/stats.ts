import type { Attempt } from "@/features/game/types";

export type ResultsSummary = {
  hitRate: number;
  centrePrecision: number;
  avgMs: number;
  medianMs: number;
  p95Ms: number;
  hitsPerMinute: number;
  hits: number;
  missClicks: number;
  expiredTargets: number;
  elapsedMs: number;
};

function percentile(sorted: number[], p: number) {
  if (sorted.length === 0) return 0;
  const index = Math.floor((sorted.length - 1) * p);
  return sorted[index];
}

export function summarizeStats(attempts: Attempt[], elapsedMs: number): ResultsSummary {
  const hits = attempts.filter((attempt) => attempt.outcome === "hit");
  const missClicks = attempts.filter((attempt) => attempt.outcome === "miss").length;
  const expiredTargets = attempts.filter((attempt) => attempt.outcome === "expired").length;
  const clickAttempts = hits.length + missClicks;

  const qualitySum = hits.reduce(
    (sum, attempt) => sum + (attempt.quality ?? 0),
    0
  );

  const reactionTimes = hits
    .map((attempt) => attempt.rt ?? 0)
    .sort((a, b) => a - b);

  const avgMs = reactionTimes.length
    ? reactionTimes.reduce((sum, reactionTime) => sum + reactionTime, 0) /
      reactionTimes.length
    : 0;

  return {
    hitRate: clickAttempts > 0 ? (hits.length / clickAttempts) * 100 : 0,
    centrePrecision: hits.length > 0 ? (qualitySum / hits.length) * 100 : 0,
    avgMs,
    medianMs: percentile(reactionTimes, 0.5),
    p95Ms: percentile(reactionTimes, 0.95),
    hitsPerMinute: elapsedMs > 0 ? (hits.length * 60_000) / elapsedMs : 0,
    hits: hits.length,
    missClicks,
    expiredTargets,
    elapsedMs,
  };
}
