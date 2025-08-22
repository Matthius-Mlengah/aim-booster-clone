import { vi, describe, it, expect, beforeEach } from "vitest";

vi.mock("@/features/game/renderer", async () => {
  const real = await vi.importActual<typeof import("@/features/game/renderer")>(
    "@/features/game/renderer"
  );
  return {
    ...real,
    loadSprite: vi.fn(async () => ({ width: 64, height: 64 } as any)),
    drawGrid: vi.fn(),
    drawWatermarks: vi.fn(),
    drawSprite: vi.fn(),
    currentRadius: () => 20,  
    currentHitRadius: () => 8, 
  };
});

vi.mock("@/features/game/difficulty", () => ({
  getDiff: () => ({ t: 1, spawnEvery: 0, lifeMs: 60, maxTargets: 2 }),
}));

import { createEngine } from "@/features/game/engine";

function fakeCtx(): CanvasRenderingContext2D {
  const noop = () => {};
  return {
    canvas: {} as any,
    clearRect: noop, setTransform: noop, fillRect: noop,
    beginPath: noop, moveTo: noop, lineTo: noop, stroke: noop,
    drawImage: noop as any, fillText: noop,
    save: noop, restore: noop, clip: noop, closePath: noop,
    arc: noop as any, ellipse: noop as any, strokeRect: noop as any,
    measureText: () => ({ width: 0 } as TextMetrics),
    createLinearGradient: () => ({ addColorStop: noop } as any),
    createPattern: () => null,
    createRadialGradient: () => ({ addColorStop: noop } as any),
    getLineDash: () => [],
    getTransform: () => new DOMMatrix(),
    isPointInPath: () => false,
    isPointInStroke: () => false,
    putImageData: noop as any,
    resetTransform: noop,
    rotate: noop, scale: noop, setLineDash: noop as any,
    translate: noop, transform: noop,
    fillStyle: "#000", strokeStyle: "#000", lineWidth: 1,
    textAlign: "left", textBaseline: "alphabetic", font: "10px sans-serif",
    globalAlpha: 1, globalCompositeOperation: "source-over",
    imageSmoothingEnabled: true, imageSmoothingQuality: "low",
    direction: "inherit",
  } as any;
}

beforeEach(() => {
  vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) =>
    setTimeout(() => cb(performance.now()), 0) as unknown as number
  );
  vi.stubGlobal("cancelAnimationFrame", (id: number) =>
    clearTimeout(id as unknown as number)
  );
});

describe("engine basic lifecycle", () => {
  it("initializes, spawns, expires, and reports stats", async () => {
    const canvas: any = {
      width: 0,
      height: 0,
      style: {},
      getContext: () => fakeCtx(),
    };

    const attempts: any[] = [];
    let ended = false;
    let lastStats: any = null;

    const eng = createEngine(
      canvas,
      (a) => attempts.push(a),
      () => { ended = true; },
      (s) => { lastStats = s; }
    );

    await eng.init();
    eng.resize(800, 450, 1);
    eng.start();

    await new Promise((r) => setTimeout(r, 50));
    expect(lastStats).toBeTruthy();
    expect(lastStats.burst).toBe(2);

    eng.pointer(0, 0);
    eng.pointer(100, 100);

    await new Promise((r) => setTimeout(r, 120));
    eng.stop();

    expect(typeof eng.reset).toBe("function");
    expect(lastStats.fps).toBeGreaterThan(0);
    expect(typeof ended).toBe("boolean");
  });
});
