export type GameModeId = "quick" | "survival" | "chaos";

export type GameEndReason = "time" | "lives" | "overload" | "quit";

export type ChaosWave = "build" | "surge" | "breath";

export type TargetKind = "normal" | "gold" | "danger" | "calm";

export type Attempt = {
  t: number;
  outcome: "hit" | "miss" | "expired";
  hit: boolean;
  rt?: number;
  dx?: number;
  dy?: number;
  dist?: number;
  quality?: number;
  points?: number;
  targetKind?: TargetKind;
};

export type Target = {
  id: number;
  x: number;
  y: number;
  born: number;
  life: number;
  radius: number;
  kind: TargetKind;
};

export type ModeSettings = {
  mode: GameModeId;
  durationMs: number | null;
  spawnEveryMs: number;
  targetLifetimeMs: number;
  desiredActiveTargets: number;
  maximumActiveTargets: number;
  spawnBatchSize: number;
  targetRadius: number;
  scoreMultiplier: number;
  overloadPerExpiry: number;
  level: number;
  wave: ChaosWave | null;
  minimumSpacingFactor: number;
};

export type HudStats = {
  mode: GameModeId;
  elapsedMs: number;
  remainingMs: number | null;
  score: number;
  combo: number;
  bestCombo: number;
  hitRate: number;
  centrePrecision: number;
  targets: number;
  lives: number;
  overload: number;
  level: number;
  wave: ChaosWave | null;
};

export type RoundResult = {
  mode: GameModeId;
  endReason: GameEndReason;
  elapsedMs: number;
  score: number;
  hits: number;
  missClicks: number;
  expiredTargets: number;
  hitRate: number;
  centrePrecision: number;
  avgMs: number;
  medianMs: number;
  p95Ms: number;
  hitsPerMinute: number;
  bestCombo: number;
  highestLevel: number;
};

export type ModeDefinition = {
  id: GameModeId;
  name: string;
  strapline: string;
  description: string;
};
