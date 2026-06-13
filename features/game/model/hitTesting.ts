import type { Target } from "../types";
import { currentRadius } from "./radius";

export type Point = {
  x: number;
  y: number;
};

export type HitTarget = {
  index: number;
  target: Target;
  distance: number;
  radius: number;
  quality: number;
};

export function findHitTarget(
  targets: Target[],
  point: Point,
  now: number
): HitTarget | null {
  let best: HitTarget | null = null;

  targets.forEach((target, index) => {
    const radius = currentRadius(target, now);
    const distance = Math.hypot(point.x - target.x, point.y - target.y);

    if (distance <= radius && (!best || distance < best.distance)) {
      best = {
        index,
        target,
        distance,
        radius,
        quality: Math.max(0, 1 - distance / radius),
      };
    }
  });

  return best;
}
