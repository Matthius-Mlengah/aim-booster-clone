import {
  CHAOS_LEVEL_DURATION_MS,
  MAX_CHAOS_TARGETS,
  MIN_TARGET_RADIUS,
  NORMAL_TARGET_RADIUS,
  QUICK_PLAY_DURATION_MS,
} from "./constants";

import type {
  ChaosWave,
  GameModeId,
  ModeDefinition,
  ModeSettings,
  TargetKind,
} from "./types";

const clamp = (
  value: number,
  minimum: number,
  maximum: number
): number => Math.max(minimum, Math.min(maximum, value));

const lerp = (
  start: number,
  end: number,
  progress: number
): number => start + (end - start) * progress;

export const GAME_MODES: readonly ModeDefinition[] = [
  {
    id: "quick",
    name: "Quick Play",
    strapline: "60 second score attack",
    description:
      "Build a combo, aim for the centre, and beat your best score.",
  },
  {
    id: "survival",
    name: "Survival",
    strapline: "Three lives, no time limit",
    description:
      "Targets become faster until three of them escape.",
  },
  {
    id: "chaos",
    name: "Chaos",
    strapline: "Infinite impossible challenge",
    description:
      "Control the overload meter while each wave grows denser and faster.",
  },
] as const;

function quickPlaySettings(
  elapsedMs: number
): ModeSettings {
  if (elapsedMs < 12_000) {
    return {
      mode: "quick",
      durationMs: QUICK_PLAY_DURATION_MS,
      spawnEveryMs: 420,
      targetLifetimeMs: 1_500,
      desiredActiveTargets: 1,
      maximumActiveTargets: 1,
      spawnBatchSize: 1,
      targetRadius: 48,
      scoreMultiplier: 1,
      overloadPerExpiry: 0,
      level: 1,
      wave: null,
      minimumSpacingFactor: 1,
    };
  }

  if (elapsedMs < 45_000) {
    const progress =
      (elapsedMs - 12_000) / 33_000;

    return {
      mode: "quick",
      durationMs: QUICK_PLAY_DURATION_MS,
      spawnEveryMs: lerp(390, 300, progress),
      targetLifetimeMs: lerp(
        1_350,
        1_050,
        progress
      ),
      desiredActiveTargets: 1,
      maximumActiveTargets: 1,
      spawnBatchSize: 1,
      targetRadius: lerp(46, 40, progress),
      scoreMultiplier: lerp(
        1.05,
        1.2,
        progress
      ),
      overloadPerExpiry: 0,
      level: 2,
      wave: null,
      minimumSpacingFactor: 1,
    };
  }

  const progress = clamp(
    (elapsedMs - 45_000) / 15_000,
    0,
    1
  );

  return {
    mode: "quick",
    durationMs: QUICK_PLAY_DURATION_MS,
    spawnEveryMs: lerp(270, 210, progress),
    targetLifetimeMs: lerp(950, 780, progress),
    desiredActiveTargets: 2,
    maximumActiveTargets: 2,
    spawnBatchSize: 2,
    targetRadius: lerp(39, 35, progress),
    scoreMultiplier: lerp(
      1.25,
      1.4,
      progress
    ),
    overloadPerExpiry: 0,
    level: 3,
    wave: null,
    minimumSpacingFactor: 0.95,
  };
}

function survivalSettings(
  elapsedMs: number
): ModeSettings {
  const level =
    1 + Math.floor(elapsedMs / 15_000);

  const exponent = Math.max(0, level - 1);

  const desiredActiveTargets = Math.min(
    12,
    1 + Math.floor(level / 2)
  );

  return {
    mode: "survival",
    durationMs: null,
    spawnEveryMs: Math.max(
      190,
      720 * Math.pow(0.95, exponent)
    ),
    targetLifetimeMs: Math.max(
      620,
      1_600 * Math.pow(0.97, exponent)
    ),
    desiredActiveTargets,
    maximumActiveTargets: Math.min(
      14,
      desiredActiveTargets
    ),
    spawnBatchSize: Math.min(
      3,
      Math.max(
        1,
        Math.ceil(desiredActiveTargets / 4)
      )
    ),
    targetRadius: Math.max(
      28,
      47 - exponent * 0.7
    ),
    scoreMultiplier: 1 + exponent * 0.07,
    overloadPerExpiry: 0,
    level,
    wave: null,
    minimumSpacingFactor: Math.max(
      0.78,
      1 - exponent * 0.015
    ),
  };
}

function getChaosWave(
  levelTimeMs: number
): ChaosWave {
  if (levelTimeMs < 6_000) {
    return "build";
  }

  if (levelTimeMs < 9_000) {
    return "surge";
  }

  return "breath";
}

function chaosSettings(
  elapsedMs: number
): ModeSettings {
  const level =
    1 +
    Math.floor(
      elapsedMs / CHAOS_LEVEL_DURATION_MS
    );

  const levelTimeMs =
    elapsedMs % CHAOS_LEVEL_DURATION_MS;

  const wave = getChaosWave(levelTimeMs);
  const exponent = Math.max(0, level - 1);

  const waveSpawnMultiplier =
    wave === "surge"
      ? 0.72
      : wave === "breath"
        ? 1.35
        : 1;

  const waveLifeMultiplier =
    wave === "surge"
      ? 0.86
      : wave === "breath"
        ? 1.1
        : 1;

  const waveTargetOffset =
    wave === "surge"
      ? Math.max(1, Math.ceil(level * 0.12))
      : wave === "breath"
        ? -1
        : 0;

  const baseDesiredTargets =
    2 + Math.floor(level * 0.78);

  const desiredActiveTargets = clamp(
    baseDesiredTargets + waveTargetOffset,
    1,
    48
  );

  return {
    mode: "chaos",
    durationMs: null,
    spawnEveryMs: Math.max(
      75,
      560 *
        Math.pow(0.94, exponent) *
        waveSpawnMultiplier
    ),
    targetLifetimeMs: Math.max(
      400,
      1_650 *
        Math.pow(0.965, exponent) *
        waveLifeMultiplier
    ),
    desiredActiveTargets,
    maximumActiveTargets: MAX_CHAOS_TARGETS,
    spawnBatchSize: Math.min(
      8,
      1 + Math.floor(level / 5)
    ),
    targetRadius: clamp(
      NORMAL_TARGET_RADIUS - exponent * 0.38,
      MIN_TARGET_RADIUS,
      NORMAL_TARGET_RADIUS
    ),
    scoreMultiplier: 1 + level * 0.1,
    overloadPerExpiry: Math.min(
      10,
      4 + Math.floor(level / 8)
    ),
    level,
    wave,
    minimumSpacingFactor: Math.max(
      0.55,
      0.95 - exponent * 0.012
    ),
  };
}

export function getModeSettings(
  mode: GameModeId,
  elapsedMs: number
): ModeSettings {
  if (mode === "survival") {
    return survivalSettings(elapsedMs);
  }

  if (mode === "chaos") {
    return chaosSettings(elapsedMs);
  }

  return quickPlaySettings(elapsedMs);
}

export function pickTargetKind(
  mode: GameModeId,
  level: number,
  overload: number,
  random: () => number
): TargetKind {
  if (mode !== "chaos") {
    return "normal";
  }

  const roll = random();

  const calmChance =
    overload >= 58 ? 0.09 : 0;

  if (roll < calmChance) {
    return "calm";
  }

  const goldThreshold =
    calmChance + 0.05;

  if (roll < goldThreshold) {
    return "gold";
  }

  const dangerChance = Math.min(
    0.32,
    0.11 + level * 0.008
  );

  if (
    roll <
    goldThreshold + dangerChance
  ) {
    return "danger";
  }

  return "normal";
}