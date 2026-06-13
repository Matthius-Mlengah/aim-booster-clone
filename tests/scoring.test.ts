import { describe, expect, it } from "vitest";
import { calculateHitScore, missScorePenalty } from "@/features/game/model/scoring";
import { getModeSettings } from "@/features/game/modes";

 describe("scoring", () => {
  it("rewards centre precision, speed, and combos", () => {
    const settings = getModeSettings("quick", 20_000);
    const ordinary = calculateHitScore({
      quality: 0.4,
      reactionMs: 900,
      targetLifetimeMs: 1_200,
      previousCombo: 0,
      settings,
      targetKind: "normal",
    });
    const excellent = calculateHitScore({
      quality: 0.95,
      reactionMs: 180,
      targetLifetimeMs: 1_200,
      previousCombo: 15,
      settings,
      targetKind: "normal",
    });

    expect(excellent.points).toBeGreaterThan(ordinary.points);
    expect(excellent.precisionLabel).toBe("PERFECT");
    expect(excellent.combo).toBe(16);
  });

  it("makes calm targets valuable during Chaos", () => {
    const award = calculateHitScore({
      quality: 0.6,
      reactionMs: 300,
      targetLifetimeMs: 800,
      previousCombo: 4,
      settings: getModeSettings("chaos", 80_000),
      targetKind: "calm",
    });

    expect(award.overloadReduction).toBe(18);
    expect(missScorePenalty("chaos")).toBe(25);
  });
});
