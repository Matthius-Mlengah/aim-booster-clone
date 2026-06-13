import { TARGET_FADE_DURATION_MS, TARGET_POP_DURATION_MS } from "../constants";
import type { Target } from "../types";

const clamp01 = (value: number) => Math.max(0, Math.min(1, value));

export function currentRadius(target: Target, now: number) {
  const popProgress = clamp01((now - target.born) / TARGET_POP_DURATION_MS);
  const easedProgress = 1 - Math.pow(1 - popProgress, 3);
  return target.radius * (0.78 + easedProgress * 0.22);
}

export function currentTargetAlpha(target: Target, now: number) {
  const remainingMs = target.life - (now - target.born);
  return clamp01(remainingMs / TARGET_FADE_DURATION_MS);
}

export function targetLifeProgress(target: Target, now: number) {
  return clamp01((now - target.born) / target.life);
}
