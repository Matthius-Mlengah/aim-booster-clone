import { Attempt, HudStats, Target } from "./types";
import { getDiff } from "./difficulty";
import { MAX_LIVES, MIN_GAP, SPRITE_SRC } from "./constants";
import {
  loadSprite, drawGrid, drawWatermarks, drawSprite,
  currentRadius
} from "./renderer";

export function createEngine(
  canvas: HTMLCanvasElement,
  onAttempt: (a: Attempt) => void,
  onEnd: () => void,
  onStats?: (s: HudStats) => void
) {
  const ctx = canvas.getContext("2d")!;
  let img: HTMLImageElement | null = null;

  let running = false;
  let targets: Target[] = [];
  let lastSpawn = 0;
  let lives = MAX_LIVES;

  let attempts = 0;
  let qualitySum = 0;

  let start: number | null = null;
  let fps = 0; let prevT: number | null = null;
  let raf: number | null = null;
  let W = canvas.width, H = canvas.height;

  let armed = false;

  const resetCounters = () => {
    attempts = 0;
    qualitySum = 0;
    lives = MAX_LIVES;
    start = null;
    lastSpawn = 0;
    armed = false;
  };

  const api = {
    async init() { img = await loadSprite(SPRITE_SRC); },
    resize(w: number, h: number, dpr = 1) {
      W = w; H = h;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    },
    start() { if (!running) { running = true; tick(); } },
    stop()  { running = false; if (raf) cancelAnimationFrame(raf); raf = null; },
    reset() { targets = []; resetCounters(); ctx.clearRect(0,0,W,H); },

    pointer(x: number, y: number) {
      if (!running || !armed) return; 

      const now = performance.now();

      let bestIdx = -1, bestDist = Infinity, bestR = 0;
      for (let i = 0; i < targets.length; i++) {
        const t = targets[i];
        const r = currentRadius(t.born, t.life, now);
        const d = Math.hypot(x - t.x, y - t.y);
        if (d <= r && d < bestDist) { bestIdx = i; bestDist = d; bestR = r; }
      }

      attempts++;

      if (bestIdx >= 0) {
        const t = targets[bestIdx];
        const qual = Math.max(0, 1 - bestDist / bestR);
        qualitySum += qual;
        onAttempt({ t: now, hit: true, rt: now - t.born, dx: x - t.x, dy: y - t.y, dist: bestDist, quality: qual });
        targets.splice(bestIdx, 1);
      } else {
        qualitySum += 0;
        onAttempt({ t: now, hit: false });
      }
    },
  };

  function trySpawn(now: number, lifeMs: number) {
    if (!img) return;
    const pad = 40;
    for (let tries = 0; tries < 25; tries++) {
      const x = pad + Math.random() * Math.max(1, W - pad * 2);
      const y = pad + Math.random() * Math.max(1, H - pad * 2);
      let ok = true;
      for (const t of targets) {
        if (Math.hypot(x - t.x, y - t.y) < MIN_GAP) { ok = false; break; }
      }
      if (ok) {
        targets.push({ id: Math.random(), x, y, born: now, life: lifeMs });
        armed = true; 
        return;
      }
    }
  }

  function tick() {
    const now = performance.now();

    if (prevT != null) {
      const inst = 1000 / Math.max(1, now - prevT);
      fps = fps ? fps * 0.9 + inst * 0.1 : inst;
    }
    prevT = now;

    const elapsed = start ? now - start : 0;
    const diff = getDiff(elapsed);

    if (running) {
      if (!start) { start = now; raf = requestAnimationFrame(tick); return; }

      if (targets.length < diff.maxTargets && now - lastSpawn > diff.spawnEvery) {
        trySpawn(now, diff.lifeMs);
        lastSpawn = now;
      }

      const before = targets.length;
      targets = targets.filter(t => now - t.born < t.life);
      const expired = before - targets.length;
      if (expired > 0) {
        lives = Math.max(0, lives - expired);
        if (lives === 0) { running = false; onEnd(); }
      }
    }

    ctx.clearRect(0, 0, W, H);
    drawGrid(ctx, W, H);
    drawWatermarks(ctx, W, H, start ? now - start : 0, lives);
    if (img) for (const t of targets) {
      const r = currentRadius(t.born, t.life, now);
      drawSprite(ctx, img, t.x, t.y, r);
    }

    const accuracy = attempts ? (100 * qualitySum / attempts) : 0;
    onStats?.({
      elapsedMs: start ? now - start : 0,
      fps,
      accuracy,
      targets: targets.length,
      burst: diff.maxTargets,
      spawnEvery: diff.spawnEvery,
    });

    if (running) raf = requestAnimationFrame(tick);
  }

  return api;
}
