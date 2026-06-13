import { describe, expect, it } from "vitest";
import { getModeSettings } from "@/features/game/modes";

 describe("game modes", () => {
  it("gives Quick Play a 60 second warm-up and final rush", () => {
    const start = getModeSettings("quick", 0);
    const finish = getModeSettings("quick", 55_000);

    expect(start.durationMs).toBe(60_000);
    expect(start.desiredActiveTargets).toBe(1);
    expect(finish.desiredActiveTargets).toBe(2);
    expect(finish.spawnEveryMs).toBeLessThan(start.spawnEveryMs);
    expect(finish.targetLifetimeMs).toBeLessThan(start.targetLifetimeMs);
  });

  it("ramps Survival without removing its three-life identity", () => {
    const start = getModeSettings("survival", 0);
    const later = getModeSettings("survival", 90_000);

    expect(start.durationMs).toBeNull();
    expect(later.level).toBeGreaterThan(start.level);
    expect(later.spawnEveryMs).toBeLessThan(start.spawnEveryMs);
    expect(later.desiredActiveTargets).toBeGreaterThan(start.desiredActiveTargets);
  });

  it("cycles Chaos waves and caps the active target budget", () => {
    expect(getModeSettings("chaos", 1_000).wave).toBe("build");
    expect(getModeSettings("chaos", 7_000).wave).toBe("surge");
    expect(getModeSettings("chaos", 9_500).wave).toBe("breath");

    const veryLate = getModeSettings("chaos", 60 * 60 * 1000);
    expect(veryLate.maximumActiveTargets).toBe(64);
    expect(veryLate.desiredActiveTargets).toBeLessThanOrEqual(48);
    expect(veryLate.spawnEveryMs).toBeGreaterThanOrEqual(75);
    expect(veryLate.targetLifetimeMs).toBeGreaterThanOrEqual(400);
  });
});
