import { MAX_LIVES } from "../constants";
import type {
  GameEndReason,
  GameModeId,
  HudStats,
  ModeSettings,
  RoundResult,
  Target,
} from "../types";

const REACTION_BIN_MS = 50;
const REACTION_BIN_COUNT = 81;

export type GameRuntimeState = {
  mode: GameModeId;
  targets: Target[];
  lastSpawnAt: number;
  startedAt: number | null;
  score: number;
  combo: number;
  bestCombo: number;
  hits: number;
  missClicks: number;
  expiredTargets: number;
  qualitySum: number;
  reactionSumMs: number;
  reactionCount: number;
  reactionHistogram: number[];
  lives: number;
  overload: number;
  highestLevel: number;
  fps: number;
  previousFrameAt: number | null;
  lastHudAt: number;
};

export function createInitialGameState(mode: GameModeId = "quick"): GameRuntimeState {
  return {
    mode,
    targets: [],
    lastSpawnAt: 0,
    startedAt: null,
    score: 0,
    combo: 0,
    bestCombo: 0,
    hits: 0,
    missClicks: 0,
    expiredTargets: 0,
    qualitySum: 0,
    reactionSumMs: 0,
    reactionCount: 0,
    reactionHistogram: Array.from({ length: REACTION_BIN_COUNT }, () => 0),
    lives: MAX_LIVES,
    overload: 0,
    highestLevel: 1,
    fps: 0,
    previousFrameAt: null,
    lastHudAt: Number.NEGATIVE_INFINITY,
  };
}

export function resetGameState(state: GameRuntimeState, mode: GameModeId) {
  state.mode = mode;
  state.targets.length = 0;
  state.lastSpawnAt = 0;
  state.startedAt = null;
  state.score = 0;
  state.combo = 0;
  state.bestCombo = 0;
  state.hits = 0;
  state.missClicks = 0;
  state.expiredTargets = 0;
  state.qualitySum = 0;
  state.reactionSumMs = 0;
  state.reactionCount = 0;
  state.reactionHistogram.fill(0);
  state.lives = MAX_LIVES;
  state.overload = 0;
  state.highestLevel = 1;
  state.fps = 0;
  state.previousFrameAt = null;
  state.lastHudAt = Number.NEGATIVE_INFINITY;
}

export function updateFrameTiming(state: GameRuntimeState, now: number) {
  if (state.previousFrameAt !== null) {
    const instantFps = 1000 / Math.max(1, now - state.previousFrameAt);
    state.fps = state.fps ? state.fps * 0.9 + instantFps * 0.1 : instantFps;
  }

  state.previousFrameAt = now;
}

export function getElapsedMs(state: GameRuntimeState, now: number) {
  return state.startedAt === null ? 0 : Math.max(0, now - state.startedAt);
}

function recordReaction(state: GameRuntimeState, reactionMs: number) {
  const safeReactionMs = Math.max(0, reactionMs);
  state.reactionSumMs += safeReactionMs;
  state.reactionCount += 1;

  const bin = Math.min(
    REACTION_BIN_COUNT - 1,
    Math.floor(safeReactionMs / REACTION_BIN_MS)
  );
  state.reactionHistogram[bin] += 1;
}

export function recordHit(
  state: GameRuntimeState,
  quality: number,
  reactionMs: number,
  points: number,
  combo: number,
  overloadReduction: number
) {
  state.hits += 1;
  state.qualitySum += quality;
  state.score += points;
  state.combo = combo;
  state.bestCombo = Math.max(state.bestCombo, combo);
  state.overload = Math.max(0, state.overload - overloadReduction);
  recordReaction(state, reactionMs);
}

export function recordMiss(state: GameRuntimeState, scorePenalty: number) {
  state.missClicks += 1;
  state.combo = 0;
  state.score = Math.max(0, state.score - scorePenalty);

  if (state.mode === "chaos") {
    state.overload = Math.min(100, state.overload + 5);
  }
}

export function recordExpiredTarget(
  state: GameRuntimeState,
  settings: ModeSettings,
  penaltyMultiplier = 1
) {
  state.expiredTargets += 1;
  state.combo = 0;

  if (state.mode === "survival") {
    state.lives = Math.max(0, state.lives - 1);
  }

  if (state.mode === "chaos") {
    state.overload = Math.min(
      100,
      state.overload + settings.overloadPerExpiry * penaltyMultiplier
    );
  }
}

export function getHitRate(state: GameRuntimeState) {
  const clickAttempts = state.hits + state.missClicks;
  return clickAttempts > 0 ? (state.hits / clickAttempts) * 100 : 0;
}

export function getCentrePrecision(state: GameRuntimeState) {
  return state.hits > 0 ? (state.qualitySum / state.hits) * 100 : 0;
}

function histogramPercentile(state: GameRuntimeState, percentile: number) {
  if (state.reactionCount === 0) return 0;

  const wanted = Math.max(1, Math.ceil(state.reactionCount * percentile));
  let seen = 0;

  for (let index = 0; index < state.reactionHistogram.length; index += 1) {
    seen += state.reactionHistogram[index];
    if (seen >= wanted) {
      return index * REACTION_BIN_MS + REACTION_BIN_MS / 2;
    }
  }

  return (REACTION_BIN_COUNT - 1) * REACTION_BIN_MS;
}

export function buildHudStats(
  state: GameRuntimeState,
  now: number,
  settings: ModeSettings
): HudStats {
  const elapsedMs = getElapsedMs(state, now);
  const remainingMs =
    settings.durationMs === null
      ? null
      : Math.max(0, settings.durationMs - elapsedMs);

  state.highestLevel = Math.max(state.highestLevel, settings.level);

  return {
    mode: state.mode,
    elapsedMs,
    remainingMs,
    score: state.score,
    combo: state.combo,
    bestCombo: state.bestCombo,
    hitRate: getHitRate(state),
    centrePrecision: getCentrePrecision(state),
    targets: state.targets.length,
    lives: state.lives,
    overload: state.overload,
    level: settings.level,
    wave: settings.wave,
  };
}

export function createRoundResult(
  state: GameRuntimeState,
  now: number,
  endReason: GameEndReason
): RoundResult {
  const elapsedMs = getElapsedMs(state, now);

  return {
    mode: state.mode,
    endReason,
    elapsedMs,
    score: state.score,
    hits: state.hits,
    missClicks: state.missClicks,
    expiredTargets: state.expiredTargets,
    hitRate: getHitRate(state),
    centrePrecision: getCentrePrecision(state),
    avgMs:
      state.reactionCount > 0
        ? state.reactionSumMs / state.reactionCount
        : 0,
    medianMs: histogramPercentile(state, 0.5),
    p95Ms: histogramPercentile(state, 0.95),
    hitsPerMinute:
      elapsedMs > 0 ? (state.hits * 60_000) / elapsedMs : 0,
    bestCombo: state.bestCombo,
    highestLevel: state.highestLevel,
  };
}
