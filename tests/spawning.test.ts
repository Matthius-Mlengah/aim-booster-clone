import { describe, expect, it } from "vitest";
import { findSpawnPoint } from "@/features/game/model/spawning";
import type { Target } from "@/features/game/types";

function sequence(values: number[]) {
  let index = 0;
  return () => values[index++] ?? 0;
}

const existing: Target = {
  id: 1,
  x: 400,
  y: 225,
  born: 0,
  life: 1000,
  radius: 40,
  kind: "normal",
};

describe("controlled spawning", () => {
  it("keeps the target inside the canvas and below the HUD", () => {
    const point = findSpawnPoint(
      [],
      { width: 800, height: 450 },
      { radius: 40, minimumSpacingFactor: 1 },
      sequence([0.5, 0.5])
    );

    expect(point?.x).toBe(400);
    expect(point?.y).toBeGreaterThan(58);
    expect(point?.y).toBeLessThan(410);
  });

  it("tries a less crowded position", () => {
    const point = findSpawnPoint(
      [existing],
      { width: 800, height: 450 },
      { radius: 40, minimumSpacingFactor: 1 },
      sequence([0.5, 0.5, 0.85, 0.8])
    );

    expect(point?.x).toBeGreaterThan(500);
  });
});
