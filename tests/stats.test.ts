import { describe, expect, it } from "vitest";
import { summarizeStats } from "@/lib/stats";
import type { Attempt } from "@/features/game/types";

 describe("statistics summary", () => {
  it("separates hit rate from centre precision", () => {
    const attempts: Attempt[] = [
      { t: 100, outcome: "hit", hit: true, rt: 200, quality: 1 },
      { t: 200, outcome: "miss", hit: false },
      { t: 300, outcome: "hit", hit: true, rt: 400, quality: 0.5 },
      { t: 400, outcome: "expired", hit: false },
    ];

    const stats = summarizeStats(attempts, 30_000);

    expect(stats.hitRate).toBeCloseTo(66.67, 1);
    expect(stats.centrePrecision).toBeCloseTo(75);
    expect(stats.avgMs).toBe(300);
    expect(stats.medianMs).toBe(200);
    expect(stats.hitsPerMinute).toBe(4);
    expect(stats.expiredTargets).toBe(1);
  });
});
