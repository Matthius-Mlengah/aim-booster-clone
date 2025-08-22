import type { Attempt } from "@/features/game/types";

function percentile(sorted: number[], p: number) {
  if (sorted.length === 0) return 0;
  const idx = Math.floor((sorted.length - 1) * p);
  return sorted[idx];
}

export function summarizeStats(attempts: Attempt[], elapsedMs: number) {
  const n = attempts.length;
  const qualities = attempts.map(a => a.quality ?? (a.hit ? 1 : 0));

  const accuracy = n ? (100 * qualities.reduce((s, q) => s + q, 0) / n) : 0;

  const rts = attempts.filter(a => a.hit && a.rt != null).map(a => a.rt as number).sort((a,b)=>a-b);
  const avgMs    = rts.length ? rts.reduce((s,x)=>s+x,0) / rts.length : 0;
  const medianMs = rts.length ? rts[Math.floor(rts.length/2)] : 0;
  const p95Ms    = percentile(rts, 0.95);

  const tpm = elapsedMs > 0 ? (n * 60000) / elapsedMs : 0;

  return {
    accuracy,
    avgMs,
    medianMs,
    p95Ms,
    tpm,
    attempts: n,
    elapsedMs,
  };
}
