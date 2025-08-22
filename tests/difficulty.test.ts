import { getDiff } from "@/features/game/difficulty";
import {
  DIFF_RAMP_MS,
  SPAWN_EVERY_EASY, SPAWN_EVERY_HARD,
  LIFE_EASY, LIFE_HARD,
  MAX_TARGETS_EASY, MAX_TARGETS_HARD
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
    expect(d.maxTargets).toBeLessThanOrEqual(MAX_TARGETS_HARD);
  });

  it("monotonically increases difficulty", () => {
    const early = getDiff(5_000);
    const mid   = getDiff(30_000);
    const late  = getDiff(60_000);

    expect(early.spawnEvery).toBeGreaterThan(mid.spawnEvery);
    expect(mid.spawnEvery).toBeGreaterThan(late.spawnEvery);

    expect(early.lifeMs).toBeGreaterThan(mid.lifeMs);
    expect(mid.lifeMs).toBeGreaterThan(late.lifeMs);

    expect(early.maxTargets).toBeLessThanOrEqual(mid.maxTargets);
    expect(mid.maxTargets).toBeLessThanOrEqual(late.maxTargets);
  });
});
