import type { GameModeId, ModeSettings, TargetKind } from "../types";

const clamp01 = (value: number) => Math.max(0, Math.min(1, value));

const KIND_MULTIPLIER: Record<TargetKind, number> = {
  normal: 1,
  gold: 1.8,
  danger: 1.45,
  calm: 0.9,
};

export type HitScoreInput = {
  quality: number;
  reactionMs: number;
  targetLifetimeMs: number;
  previousCombo: number;
  settings: ModeSettings;
  targetKind: TargetKind;
};

export type HitScore = {
  points: number;
  combo: number;
  precisionLabel: "HIT" | "GREAT" | "PERFECT";
  overloadReduction: number;
};

export function calculateHitScore(input: HitScoreInput): HitScore {
  const quality = clamp01(input.quality);
  const speed = clamp01(1 - input.reactionMs / input.targetLifetimeMs);
  const combo = input.previousCombo + 1;
  const comboMultiplier = Math.min(2, 1 + Math.max(0, combo - 1) * 0.05);

  const rawPoints =
    (100 + quality * 50 + speed * 50) *
    comboMultiplier *
    input.settings.scoreMultiplier *
    KIND_MULTIPLIER[input.targetKind];

  const precisionLabel = quality >= 0.8 ? "PERFECT" : quality >= 0.5 ? "GREAT" : "HIT";
  const baseReduction = precisionLabel === "PERFECT" ? 3 : precisionLabel === "GREAT" ? 2 : 1;
  const overloadReduction = input.targetKind === "calm" ? 18 : baseReduction;

  return {
    points: Math.max(1, Math.round(rawPoints)),
    combo,
    precisionLabel,
    overloadReduction,
  };
}

export function missScorePenalty(mode: GameModeId) {
  if (mode === "survival") return 10;
  return 25;
}
