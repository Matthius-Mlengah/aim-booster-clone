import { GRID } from "../constants";
import type { Target, TargetKind } from "../types";
import { currentRadius, currentTargetAlpha, targetLifeProgress } from "../model/radius";
import { makeLogger } from "@/lib/debug";

const dbg = makeLogger("renderer");

const TARGET_COLOURS: Record<TargetKind, string> = {
  normal: "#60a5fa",
  gold: "#facc15",
  danger: "#fb7185",
  calm: "#34d399",
};

let cachedImg: HTMLImageElement | null = null;
let cachedSrc = "";

export async function loadSprite(src: string) {
  if (cachedImg && cachedSrc === src) return cachedImg;

  cachedSrc = src;
  dbg.info("loading sprite:", src);

  cachedImg = await new Promise<HTMLImageElement>((resolve) => {
    const img = new Image();
    img.src = src;
    img.onload = () => resolve(img);
    img.onerror = () => resolve(makeFallbackSprite());
  });

  return cachedImg;
}

function makeFallbackSprite(): HTMLImageElement {
  const size = 128;
  const centre = size / 2;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;

  const ctx = canvas.getContext("2d");
  if (ctx) {
    [
      [size * 0.45, "#1d4ed8"],
      [size * 0.3, "#3b82f6"],
      [size * 0.14, "#dbeafe"],
    ].forEach(([radius, colour]) => {
      ctx.fillStyle = String(colour);
      ctx.beginPath();
      ctx.arc(centre, centre, Number(radius), 0, Math.PI * 2);
      ctx.fill();
    });
  }

  const img = new Image();
  img.src = canvas.toDataURL("image/png");
  return img;
}

export function drawGrid(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
) {
  ctx.save();
  ctx.fillStyle = "#0b1220";
  ctx.fillRect(0, 0, width, height);
  ctx.globalAlpha = 0.18;
  ctx.strokeStyle = "#1e293b";
  ctx.lineWidth = 1;

  for (let x = 0; x < width; x += GRID) {
    ctx.beginPath();
    ctx.moveTo(x + 0.5, 0);
    ctx.lineTo(x + 0.5, height);
    ctx.stroke();
  }

  for (let y = 0; y < height; y += GRID) {
    ctx.beginPath();
    ctx.moveTo(0, y + 0.5);
    ctx.lineTo(width, y + 0.5);
    ctx.stroke();
  }

  ctx.restore();
}

export function createBackgroundLayer(width: number, height: number) {
  if (typeof document === "undefined") return null;

  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, width);
  canvas.height = Math.max(1, height);
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  drawGrid(ctx, width, height);
  return canvas;
}

function drawKindBadge(
  ctx: CanvasRenderingContext2D,
  target: Target,
  radius: number
) {
  const badge =
    target.kind === "gold"
      ? "★"
      : target.kind === "danger"
        ? "!"
        : target.kind === "calm"
          ? "+"
          : "";

  if (!badge) return;

  ctx.fillStyle = TARGET_COLOURS[target.kind];
  ctx.beginPath();
  ctx.arc(target.x + radius * 0.65, target.y - radius * 0.65, 10, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#07111f";
  ctx.font = "800 12px Inter, system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(badge, target.x + radius * 0.65, target.y - radius * 0.65 + 0.5);
}

export function drawTarget(
  ctx: CanvasRenderingContext2D,
  img: CanvasImageSource,
  target: Target,
  now: number
) {
  const radius = currentRadius(target, now);
  const size = radius * 2;
  const alpha = currentTargetAlpha(target, now);
  const remainingRatio = 1 - targetLifeProgress(target, now);
  const colour = TARGET_COLOURS[target.kind];

  ctx.save();
  ctx.globalAlpha = alpha;

  ctx.fillStyle = "rgba(2, 6, 23, 0.82)";
  ctx.beginPath();
  ctx.arc(target.x, target.y, radius + 5, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = colour;
  ctx.lineWidth = target.kind === "danger" ? 4 : 3;
  ctx.beginPath();
  ctx.arc(target.x, target.y, radius + 4, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * remainingRatio);
  ctx.stroke();

  ctx.imageSmoothingEnabled = true;
  ctx.drawImage(img, target.x - radius, target.y - radius, size, size);
  drawKindBadge(ctx, target, radius);
  ctx.restore();
}
