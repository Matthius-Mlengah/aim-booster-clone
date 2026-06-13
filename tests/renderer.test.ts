import { describe, expect, it } from "vitest";
import { currentRadius, currentTargetAlpha } from "@/features/game/model/radius";
import type { Target } from "@/features/game/types";

const target: Target = {
  id: 1,
  x: 100,
  y: 100,
  born: 1_000,
  life: 1_000,
  radius: 40,
  kind: "normal",
};

describe("target presentation", () => {
  it("pops quickly to a stable radius rather than growing for its full life", () => {
    expect(currentRadius(target, 1_000)).toBeCloseTo(31.2);
    expect(currentRadius(target, 1_200)).toBeCloseTo(40);
    expect(currentRadius(target, 1_800)).toBeCloseTo(40);
  });

  it("fades only near expiry", () => {
    expect(currentTargetAlpha(target, 1_500)).toBe(1);
    expect(currentTargetAlpha(target, 1_950)).toBeLessThan(1);
  });
});
