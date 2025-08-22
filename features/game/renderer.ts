import {
  GRID, SPRITE_BASE_R, SPRITE_MAX_R, HIT_FACTOR, MIN_HIT_R
} from "./constants";
import { makeLogger } from "@/lib/debug";
const dbg = makeLogger("renderer");

let cachedImg: HTMLImageElement | null = null;
let cachedSrc = "";

export async function loadSprite(src: string) {
  if (cachedImg && cachedSrc === src) return cachedImg;
  cachedSrc = src;
  dbg.info("loading sprite:", src);
  cachedImg = await new Promise<HTMLImageElement>((resolve) => {
    const img = new Image();
    img.src = src;
    img.onload = () => { dbg.info("sprite loaded:", src, img.width, "x", img.height); resolve(img); };
    img.onerror = () => { dbg.warn("sprite failed; using fallback:", src); resolve(makeFallbackSprite()); };
  });
  return cachedImg!;
}

function makeFallbackSprite(): HTMLImageElement {
  const size = 128, cx = size / 2, cy = size / 2;
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const g = c.getContext("2d")!;
  const colors = ["#1d4ed8", "#3b82f6", "#93c5fd"];
  const radii  = [size * 0.45, size * 0.30, size * 0.14];
  for (let i = 0; i < 3; i++) {
    g.fillStyle = colors[i];
    g.beginPath(); g.arc(cx, cy, radii[i], 0, Math.PI * 2); g.fill();
  }
  const img = new Image();
  img.src = c.toDataURL("image/png");
  dbg.info("fallback sprite created");
  return img;
}

export const formatTime = (ms: number) => {
  const s = Math.floor(ms / 1000), m = Math.floor(s / 60);
  return `${String(m).padStart(2,"0")}:${String(s % 60).padStart(2,"0")}`;
};

export const currentRadius = (born: number, life: number, now: number) => {
  const norm = Math.max(0, Math.min(1, (now - born) / life));
  return SPRITE_BASE_R + norm * (SPRITE_MAX_R - SPRITE_BASE_R);
};

export const currentHitRadius = (r: number) => Math.max(MIN_HIT_R, r * HIT_FACTOR);

export function drawGrid(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.save();
  ctx.globalAlpha = 0.12; ctx.fillStyle = "#0f172a"; ctx.fillRect(0,0,w,h);
  ctx.strokeStyle = "#1e293b"; ctx.lineWidth = 1;
  for (let x = 0; x < w; x += GRID) { ctx.beginPath(); ctx.moveTo(x+0.5,0); ctx.lineTo(x+0.5,h); ctx.stroke(); }
  for (let y = 0; y < h; y += GRID) { ctx.beginPath(); ctx.moveTo(0,y+0.5); ctx.lineTo(w,y+0.5); ctx.stroke(); }
  ctx.restore();
}

export function drawWatermarks(
  ctx: CanvasRenderingContext2D, w: number, h: number, elapsed: number, lives: number
) {
  ctx.save();
  ctx.globalAlpha = 0.08; ctx.fillStyle = "#e2e8f0";
  ctx.font = `bold ${Math.floor(h * 0.25)}px Inter, system-ui, sans-serif`;
  ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.fillText(formatTime(elapsed), w/2, h/2);
  ctx.restore();

  const hearts = "♥".repeat(lives);
  ctx.save();
  ctx.globalAlpha = 0.18; ctx.fillStyle = "#e2e8f0";
  ctx.font = `bold ${Math.floor(h * 0.08)}px Inter, system-ui, sans-serif`;
  ctx.textAlign = "center";
  ctx.fillText(hearts, w/2, h*0.8);
  ctx.restore();
}

export function drawSprite(
  ctx: CanvasRenderingContext2D, img: HTMLImageElement, x: number, y: number, r: number
) {
  const s = r * 2; ctx.imageSmoothingEnabled = true;
  ctx.drawImage(img, x - s/2, y - s/2, s, s);
}
