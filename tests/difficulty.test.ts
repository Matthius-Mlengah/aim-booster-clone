import { describe, it, expect } from "vitest";
import { getDiff } from "@/features/game/difficulty";
import {
  DIFF_RAMP_MS,
  SPAWN_EVERY_EASY,
  SPAWN_EVERY_HARD,
  LIFE_EASY,
  LIFE_HARD,
  MAX_TARGETS_EASY,
} from "@/features/game/constants";

describe("difficulty ramp", () => {
  it("starts at easy values", () => {
    const d = getDiff(0);
    expect(Math.round(d.spawnEvery)).toBeCloseTo(SPAWN_EVERY_EASY, -1);
    expect(Math.round(d.lifeMs)).toBeCloseTo(LIFE_EASY, -1);
    expect(d.maxTargets).toBeGreaterThanOrEqual(MAX_TARGETS_EASY);
  });

  it("reaches hard values near ramp end", () => {
    const d = getDiff(DIFF_RAMP_MS);
    expect(Math.round(d.spawnEvery)).toBeCloseTo(SPAWN_EVERY_HARD, -1);
    expect(Math.round(d.lifeMs)).toBeCloseTo(LIFE_HARD, -1);
    expect(d.maxTargets).toBeGreaterThanOrEqual(MAX_TARGETS_EASY);
  });

  it("monotonically increases difficulty", () => {
    const a = getDiff(0);
    const b = getDiff(DIFF_RAMP_MS / 2);
    const c = getDiff(DIFF_RAMP_MS);

    expect(b.spawnEvery).toBeLessThanOrEqual(a.spawnEvery);
    expect(c.spawnEvery).toBeLessThanOrEqual(b.spawnEvery);

    expect(b.lifeMs).toBeLessThanOrEqual(a.lifeMs);
    expect(c.lifeMs).toBeLessThanOrEqual(b.lifeMs);

    expect(b.maxTargets).toBeGreaterThanOrEqual(a.maxTargets);
    expect(c.maxTargets).toBeGreaterThanOrEqual(b.maxTargets);
  });
});
