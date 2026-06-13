import {
  CANVAS_EDGE_PADDING,
  HUD_SAFE_AREA_HEIGHT,
} from "../constants";
import type { Target } from "../types";

export type GameBounds = {
  width: number;
  height: number;
};

export type RandomSource = () => number;

export type SpawnOptions = {
  radius: number;
  minimumSpacingFactor: number;
};

const MAX_SPAWN_TRIES = 28;

function nearestTargetDistance(targets: Target[], x: number, y: number) {
  if (targets.length === 0) return Number.POSITIVE_INFINITY;
  return targets.reduce(
    (nearest, target) => Math.min(nearest, Math.hypot(x - target.x, y - target.y)),
    Number.POSITIVE_INFINITY
  );
}

function hasEnoughSpace(
  targets: Target[],
  x: number,
  y: number,
  radius: number,
  spacingFactor: number
) {
  return targets.every((target) => {
    const requiredDistance = (radius + target.radius) * spacingFactor;
    return Math.hypot(x - target.x, y - target.y) >= requiredDistance;
  });
}

export function findSpawnPoint(
  targets: Target[],
  bounds: GameBounds,
  options: SpawnOptions,
  random: RandomSource
): { x: number; y: number } | null {
  const horizontalPadding = CANVAS_EDGE_PADDING + options.radius;
  const topPadding = Math.max(HUD_SAFE_AREA_HEIGHT, CANVAS_EDGE_PADDING + options.radius);
  const bottomPadding = CANVAS_EDGE_PADDING + options.radius;

  const availableWidth = bounds.width - horizontalPadding * 2;
  const availableHeight = bounds.height - topPadding - bottomPadding;

  if (availableWidth <= 0 || availableHeight <= 0) return null;

  let bestCandidate: { x: number; y: number; clearance: number } | null = null;

  for (let tries = 0; tries < MAX_SPAWN_TRIES; tries += 1) {
    const x = horizontalPadding + random() * availableWidth;
    const y = topPadding + random() * availableHeight;
    const clearance = nearestTargetDistance(targets, x, y);

    if (!bestCandidate || clearance > bestCandidate.clearance) {
      bestCandidate = { x, y, clearance };
    }

    if (
      hasEnoughSpace(
        targets,
        x,
        y,
        options.radius,
        options.minimumSpacingFactor
      )
    ) {
      return { x, y };
    }
  }

  return bestCandidate ? { x: bestCandidate.x, y: bestCandidate.y } : null;
}
