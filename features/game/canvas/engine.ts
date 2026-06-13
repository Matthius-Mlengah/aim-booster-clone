import {
  HUD_UPDATE_INTERVAL_MS,
  SPRITE_SRC,
} from "../constants";
import { getModeSettings, pickTargetKind } from "../modes";
import type {
  Attempt,
  GameEndReason,
  GameModeId,
  HudStats,
  ModeSettings,
  RoundResult,
  Target,
} from "../types";
import { findHitTarget } from "../model/hitTesting";
import { findSpawnPoint } from "../model/spawning";
import { calculateHitScore, missScorePenalty } from "../model/scoring";
import { TargetPool } from "../model/targetPool";
import {
  buildHudStats,
  createInitialGameState,
  createRoundResult,
  getElapsedMs,
  recordExpiredTarget,
  recordHit,
  recordMiss,
  resetGameState,
  updateFrameTiming,
} from "../model/gameState";
import { EffectPool } from "./effects";
import {
  createBackgroundLayer,
  drawGrid,
  drawTarget,
  loadSprite,
} from "./renderer";

export type EngineApi = {
  init: () => Promise<void>;
  resize: (width: number, height: number, dpr?: number) => void;
  start: (mode?: GameModeId) => void;
  stop: () => void;
  end: () => void;
  reset: (mode?: GameModeId) => void;
  pointer: (x: number, y: number) => void;
};

type FrameRequest = (callback: FrameRequestCallback) => number;
type FrameCancel = (handle: number) => void;

type EngineDependencies = {
  now: () => number;
  random: () => number;
  requestFrame: FrameRequest;
  cancelFrame: FrameCancel;
  loadSprite: (src: string) => Promise<HTMLImageElement>;
};

export type EngineDependencyOverrides = Partial<EngineDependencies>;

const defaultDependencies: EngineDependencies = {
  now: () => performance.now(),
  random: () => Math.random(),
  requestFrame: (callback) => requestAnimationFrame(callback),
  cancelFrame: (handle) => cancelAnimationFrame(handle),
  loadSprite,
};

function targetLifeMultiplier(kind: Target["kind"]) {
  if (kind === "danger") return 0.62;
  if (kind === "gold") return 0.74;
  if (kind === "calm") return 0.82;
  return 1;
}

function targetRadiusMultiplier(kind: Target["kind"]) {
  if (kind === "gold") return 0.88;
  if (kind === "danger") return 0.92;
  if (kind === "calm") return 1.08;
  return 1;
}

function expiryPenaltyMultiplier(kind: Target["kind"]) {
  if (kind === "danger") return 1.6;
  if (kind === "calm") return 0.6;
  return 1;
}

export function createEngine(
  canvas: HTMLCanvasElement,
  onAttempt: (attempt: Attempt) => void,
  onEnd: (result: RoundResult) => void,
  onStats?: (stats: HudStats) => void,
  dependencyOverrides: EngineDependencyOverrides = {}
): EngineApi {
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Canvas 2D context is not available.");
  }

  const deps = { ...defaultDependencies, ...dependencyOverrides };
  const state = createInitialGameState();
  const targetPool = new TargetPool();
  const effects = new EffectPool();

  let img: HTMLImageElement | null = null;
  let running = false;
  let finished = false;
  let frameHandle: number | null = null;
  let width = Math.max(1, canvas.width);
  let height = Math.max(1, canvas.height);
  let backgroundLayer: HTMLCanvasElement | null = null;

  const render = (now: number) => {
    ctx.clearRect(0, 0, width, height);

    if (backgroundLayer) {
      ctx.drawImage(backgroundLayer, 0, 0, width, height);
    } else {
      drawGrid(ctx, width, height);
    }

    if (img) {
      state.targets.forEach((target) => drawTarget(ctx, img as HTMLImageElement, target, now));
    }

    effects.draw(ctx, now);
  };

  const removeTargetAt = (index: number) => {
    const removed = state.targets[index];
    const last = state.targets.pop();

    if (last && index < state.targets.length) {
      state.targets[index] = last;
    }

    if (removed) targetPool.release(removed);
  };

  const forceHudUpdate = (now: number, settings: ModeSettings) => {
    state.lastHudAt = now;
    onStats?.(buildHudStats(state, now, settings));
  };

  const finish = (reason: GameEndReason, now = deps.now()) => {
    if (finished) return;

    running = false;
    finished = true;

    if (frameHandle !== null) {
      deps.cancelFrame(frameHandle);
      frameHandle = null;
    }

    const settings = getModeSettings(state.mode, getElapsedMs(state, now));
    render(now);
    forceHudUpdate(now, settings);
    onEnd(createRoundResult(state, now, reason));
  };

  const spawnTarget = (now: number, settings: ModeSettings) => {
    if (!img || state.targets.length >= settings.maximumActiveTargets) return false;

    const kind = pickTargetKind(state.mode, settings.level, state.overload, deps.random);
    const radius = settings.targetRadius * targetRadiusMultiplier(kind);
    const point = findSpawnPoint(
      state.targets,
      { width, height },
      {
        radius,
        minimumSpacingFactor: settings.minimumSpacingFactor,
      },
      deps.random
    );

    if (!point) return false;

    state.targets.push(
      targetPool.acquire({
        x: point.x,
        y: point.y,
        born: now,
        life: settings.targetLifetimeMs * targetLifeMultiplier(kind),
        radius,
        kind,
      })
    );

    return true;
  };

  const expireTargets = (now: number, settings: ModeSettings) => {
    for (let index = state.targets.length - 1; index >= 0; index -= 1) {
      const target = state.targets[index];
      if (now - target.born < target.life) continue;

      recordExpiredTarget(state, settings, expiryPenaltyMultiplier(target.kind));
      onAttempt({
        t: now,
        outcome: "expired",
        hit: false,
        targetKind: target.kind,
      });
      removeTargetAt(index);
    }
  };

  const scheduleNextFrame = () => {
    frameHandle = deps.requestFrame(tick);
  };

  const tick = () => {
    if (!running) return;

    const now = deps.now();
    updateFrameTiming(state, now);
    const elapsedMs = getElapsedMs(state, now);
    const settings = getModeSettings(state.mode, elapsedMs);

    if (settings.durationMs !== null && elapsedMs >= settings.durationMs) {
      finish("time", now);
      return;
    }

    expireTargets(now, settings);

    if (state.mode === "survival" && state.lives <= 0) {
      finish("lives", now);
      return;
    }

    if (state.mode === "chaos" && state.overload >= 100) {
      finish("overload", now);
      return;
    }

    const spawnIsDue =
      state.targets.length === 0 ||
      now - state.lastSpawnAt >= settings.spawnEveryMs;

    if (spawnIsDue && state.targets.length < settings.desiredActiveTargets) {
      const missingTargets = settings.desiredActiveTargets - state.targets.length;
      const batchSize = Math.min(settings.spawnBatchSize, missingTargets);

      for (let index = 0; index < batchSize; index += 1) {
        if (!spawnTarget(now, settings)) break;
      }

      state.lastSpawnAt = now;
    }

    render(now);

    if (now - state.lastHudAt >= HUD_UPDATE_INTERVAL_MS) {
      forceHudUpdate(now, settings);
    }

    scheduleNextFrame();
  };

  const reset = (mode: GameModeId = state.mode) => {
    targetPool.releaseAll(state.targets);
    resetGameState(state, mode);
    effects.clear();
    finished = false;
    ctx.clearRect(0, 0, width, height);
    drawGrid(ctx, width, height);
  };

  return {
    async init() {
      img = await deps.loadSprite(SPRITE_SRC);
    },

    resize(nextWidth: number, nextHeight: number, dpr = 1) {
      width = Math.max(1, nextWidth);
      height = Math.max(1, nextHeight);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      backgroundLayer = createBackgroundLayer(width, height);
      render(deps.now());
    },

    start(mode: GameModeId = "quick") {
      if (running) return;

      reset(mode);
      const now = deps.now();
      state.startedAt = now;
      state.lastSpawnAt = Number.NEGATIVE_INFINITY;
      running = true;
      finished = false;
      tick();
    },

    stop() {
      running = false;
      if (frameHandle !== null) {
        deps.cancelFrame(frameHandle);
      }
      frameHandle = null;
    },

    end() {
      if (running) finish("quit");
    },

    reset,

    pointer(x: number, y: number) {
      if (!running) return;

      const now = deps.now();
      const elapsedMs = getElapsedMs(state, now);
      const settings = getModeSettings(state.mode, elapsedMs);
      const hit = findHitTarget(state.targets, { x, y }, now);

      if (hit) {
        const reactionMs = now - hit.target.born;
        const award = calculateHitScore({
          quality: hit.quality,
          reactionMs,
          targetLifetimeMs: hit.target.life,
          previousCombo: state.combo,
          settings,
          targetKind: hit.target.kind,
        });

        recordHit(
          state,
          hit.quality,
          reactionMs,
          award.points,
          award.combo,
          award.overloadReduction
        );

        effects.spawnHit(
          hit.target.x,
          hit.target.y,
          now,
          award.points,
          award.precisionLabel,
          hit.target.kind,
          award.precisionLabel === "PERFECT" ? 8 : 5
        );

        onAttempt({
          t: now,
          outcome: "hit",
          hit: true,
          rt: reactionMs,
          dx: x - hit.target.x,
          dy: y - hit.target.y,
          dist: hit.distance,
          quality: hit.quality,
          points: award.points,
          targetKind: hit.target.kind,
        });

        removeTargetAt(hit.index);
        state.lastSpawnAt = Number.NEGATIVE_INFINITY;
      } else {
        recordMiss(state, missScorePenalty(state.mode));
        effects.spawnMiss(x, y, now);
        onAttempt({ t: now, outcome: "miss", hit: false });
      }

      if (state.mode === "chaos" && state.overload >= 100) {
        finish("overload", now);
        return;
      }

      forceHudUpdate(now, settings);
    },
  };
}
