import { describe, expect, it } from "vitest";
import { findHitTarget } from "@/features/game/model/hitTesting";
import type { Target } from "@/features/game/types";

const target = (id: number, x: number, y: number): Target => ({
  id,
  x,
  y,
  born: 0,
  life: 1000,
  radius: 40,
  kind: "normal",
});

describe("hit testing", () => {
  it("returns the closest target inside the visible radius", () => {
    const hit = findHitTarget(
      [target(1, 100, 100), target(2, 105, 100)],
      { x: 106, y: 100 },
      200
    );

    expect(hit?.target.id).toBe(2);
    expect(hit?.quality).toBeGreaterThan(0.9);
  });

  it("returns null outside every target", () => {
    expect(findHitTarget([target(1, 100, 100)], { x: 300, y: 100 }, 200)).toBeNull();
  });
});
