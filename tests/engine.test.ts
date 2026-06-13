import { describe, expect, it } from "vitest";
import { createEngine } from "@/features/game/engine";
import type { Attempt, HudStats, RoundResult } from "@/features/game/types";
import { createFakeCanvas } from "./helpers/fakeCanvas";

function sequence(values: number[]) {
  let index = 0;
  return () => values[index++] ?? 0.5;
}

describe("engine", () => {
  it("starts a mode, scores a hit, records a miss, and returns a result", async () => {
    let now = 1_000;
    const frameCallbacks: FrameRequestCallback[] = [];
    const attempts: Attempt[] = [];
    let lastStats: HudStats | null = null;
    let result: RoundResult | null = null;

    const engine = createEngine(
      createFakeCanvas(),
      (attempt) => attempts.push(attempt),
      (roundResult) => {
        result = roundResult;
      },
      (stats) => {
        lastStats = stats;
      },
      {
        now: () => now,
        random: sequence([0.5, 0.5, 0.5]),
        requestFrame: (callback) => {
          frameCallbacks.push(callback);
          return frameCallbacks.length;
        },
        cancelFrame: () => undefined,
        loadSprite: async () => ({ width: 64, height: 64 }) as HTMLImageElement,
      }
    );

    await engine.init();
    engine.resize(800, 450, 1);
    engine.start("quick");

    expect(lastStats).not.toBeNull();
    expect((lastStats as unknown as HudStats).targets).toBe(1);

    now = 1_200;
    engine.pointer(400, 225);
    engine.pointer(0, 0);

    expect(attempts[0]).toMatchObject({ outcome: "hit", hit: true });
    expect(attempts[1]).toMatchObject({ outcome: "miss", hit: false });
    expect((lastStats as unknown as HudStats).score).toBeGreaterThan(0);

    engine.end();
    expect(result).not.toBeNull();
    expect((result as unknown as RoundResult).mode).toBe("quick");
    expect((result as unknown as RoundResult).endReason).toBe("quit");
  });
});
