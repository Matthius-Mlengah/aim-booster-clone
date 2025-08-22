import {
  DIFF_RAMP_MS, SPAWN_EVERY_EASY, SPAWN_EVERY_HARD,
  LIFE_EASY, LIFE_HARD, MAX_TARGETS_EASY, MAX_TARGETS_HARD
} from "./constants";

const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
const smoothstep = (t: number) => t * t * (3 - 2 * t);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export function getDiff(elapsedMs: number) {
  const t = smoothstep(clamp01(elapsedMs / DIFF_RAMP_MS));
  return {
    t,
    spawnEvery: lerp(SPAWN_EVERY_EASY, SPAWN_EVERY_HARD, t),
    lifeMs:     lerp(LIFE_EASY,         LIFE_HARD,       t),
    maxTargets: Math.round(lerp(MAX_TARGETS_EASY, MAX_TARGETS_HARD, t)),
  };
}
