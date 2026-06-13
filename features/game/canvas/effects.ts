import { MAX_VISUAL_EFFECTS } from "../constants";

export type EffectTone = "normal" | "gold" | "danger" | "calm" | "miss";

type EffectKind = "ring" | "particle" | "text" | "miss";

type VisualEffect = {
  active: boolean;
  kind: EffectKind;
  x: number;
  y: number;
  velocityX: number;
  velocityY: number;
  born: number;
  life: number;
  size: number;
  text: string;
  colour: string;
};

const COLOURS: Record<EffectTone, string> = {
  normal: "#60a5fa",
  gold: "#facc15",
  danger: "#fb7185",
  calm: "#34d399",
  miss: "#f87171",
};

export class EffectPool {
  private readonly effects: VisualEffect[];
  private cursor = 0;

  constructor(capacity = MAX_VISUAL_EFFECTS) {
    this.effects = Array.from({ length: capacity }, () => ({
      active: false,
      kind: "particle" as EffectKind,
      x: 0,
      y: 0,
      velocityX: 0,
      velocityY: 0,
      born: 0,
      life: 0,
      size: 0,
      text: "",
      colour: "#ffffff",
    }));
  }

  private acquire(): VisualEffect {
    const effect = this.effects[this.cursor];
    this.cursor = (this.cursor + 1) % this.effects.length;
    effect.active = true;
    return effect;
  }

  spawnHit(
    x: number,
    y: number,
    now: number,
    points: number,
    label: string,
    tone: Exclude<EffectTone, "miss">,
    particleCount: number
  ) {
    const colour = COLOURS[tone];
    const ring = this.acquire();
    Object.assign(ring, {
      kind: "ring" as EffectKind,
      x,
      y,
      velocityX: 0,
      velocityY: 0,
      born: now,
      life: 260,
      size: 18,
      text: "",
      colour,
    });

    const text = this.acquire();
    Object.assign(text, {
      kind: "text" as EffectKind,
      x,
      y: y - 12,
      velocityX: 0,
      velocityY: -24,
      born: now,
      life: 520,
      size: 16,
      text: `${label} +${points}`,
      colour,
    });

    for (let index = 0; index < particleCount; index += 1) {
      const angle = (index / particleCount) * Math.PI * 2;
      const speed = 45 + (index % 3) * 16;
      const particle = this.acquire();
      Object.assign(particle, {
        kind: "particle" as EffectKind,
        x,
        y,
        velocityX: Math.cos(angle) * speed,
        velocityY: Math.sin(angle) * speed,
        born: now,
        life: 360,
        size: 3 + (index % 2),
        text: "",
        colour,
      });
    }
  }

  spawnMiss(x: number, y: number, now: number) {
    const miss = this.acquire();
    Object.assign(miss, {
      kind: "miss" as EffectKind,
      x,
      y,
      velocityX: 0,
      velocityY: 0,
      born: now,
      life: 340,
      size: 12,
      text: "",
      colour: COLOURS.miss,
    });
  }

  clear() {
    this.effects.forEach((effect) => {
      effect.active = false;
    });
  }

  draw(ctx: CanvasRenderingContext2D, now: number) {
    this.effects.forEach((effect) => {
      if (!effect.active) return;

      const age = now - effect.born;
      if (age >= effect.life) {
        effect.active = false;
        return;
      }

      const progress = age / effect.life;
      const alpha = 1 - progress;
      const x = effect.x + effect.velocityX * (age / 1000);
      const y = effect.y + effect.velocityY * (age / 1000);

      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = effect.colour;
      ctx.fillStyle = effect.colour;

      if (effect.kind === "ring") {
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(x, y, effect.size + progress * 28, 0, Math.PI * 2);
        ctx.stroke();
      } else if (effect.kind === "particle") {
        ctx.beginPath();
        ctx.arc(x, y, effect.size * (1 - progress * 0.4), 0, Math.PI * 2);
        ctx.fill();
      } else if (effect.kind === "text") {
        ctx.font = "700 14px Inter, system-ui, sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(effect.text, x, y);
      } else {
        ctx.lineWidth = 2.5;
        const size = effect.size + progress * 4;
        ctx.beginPath();
        ctx.moveTo(x - size, y - size);
        ctx.lineTo(x + size, y + size);
        ctx.moveTo(x + size, y - size);
        ctx.lineTo(x - size, y + size);
        ctx.stroke();
      }

      ctx.restore();
    });
  }
}
