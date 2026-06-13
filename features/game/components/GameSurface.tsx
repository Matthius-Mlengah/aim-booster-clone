"use client";

import { useEffect, useRef, useState } from "react";
import { createEngine } from "../engine";
import type {
  GameModeId,
  HudStats,
  RoundResult,
} from "../types";
import { makeLogger } from "@/lib/debug";
import {
  formatClock,
  formatElapsedClock,
  formatScore,
} from "@/lib/format";

const dbg = makeLogger("surface");

function createInitialHud(mode: GameModeId): HudStats {
  return {
    mode,
    elapsedMs: 0,
    remainingMs: mode === "quick" ? 60_000 : null,
    score: 0,
    combo: 0,
    bestCombo: 0,
    hitRate: 0,
    centrePrecision: 0,
    targets: 0,
    lives: 3,
    overload: 0,
    level: 1,
    wave: mode === "chaos" ? "build" : null,
  };
}

function comboMultiplier(combo: number): string {
  if (combo <= 1) return "x1.00";

  return `x${Math.min(
    2,
    1 + (combo - 1) * 0.05
  ).toFixed(2)}`;
}

export default function GameSurface({
  active,
  mode,
  sessionId,
  onEnd,
}: {
  active: boolean;
  mode: GameModeId;
  sessionId: number;
  onEnd: (result: RoundResult) => void;
}) {
  const canvasHostRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef =
    useRef<ReturnType<typeof createEngine> | null>(null);

  const [hud, setHud] = useState<HudStats>(() =>
    createInitialHud(mode)
  );

  const [ready, setReady] = useState(false);

  const endRef = useRef(onEnd);

  useEffect(() => {
    endRef.current = onEnd;
  }, [onEnd]);

  useEffect(() => {
    let mounted = true;
    let resizeObserver: ResizeObserver | null = null;

    async function initialise() {
      const canvas = canvasRef.current;
      const canvasHost = canvasHostRef.current;

      if (!canvas || !canvasHost) return;

      const engine = createEngine(
        canvas,
        () => undefined,
        (result) => endRef.current(result),
        setHud
      );

      engineRef.current = engine;

      await engine.init();

      if (!mounted) return;

      const resize = () => {
        const width = Math.floor(canvasHost.clientWidth);
        const height = Math.floor(canvasHost.clientHeight);

        const dpr = Math.max(
          1,
          Math.min(2, window.devicePixelRatio || 1)
        );

        engine.resize(width, height, dpr);
      };

      resizeObserver = new ResizeObserver(resize);
      resizeObserver.observe(canvasHost);

      resize();

      setReady(true);
      dbg.info("ready");
    }

    void initialise();

    return () => {
      mounted = false;
      engineRef.current?.stop();
      resizeObserver?.disconnect();
    };
  }, []);

  useEffect(() => {
    setHud(createInitialHud(mode));
    engineRef.current?.reset(mode);
  }, [mode, sessionId]);

  useEffect(() => {
    if (!ready || !engineRef.current) return;

    if (active) {
      engineRef.current.start(mode);
    } else {
      engineRef.current.stop();
    }
  }, [active, mode, ready, sessionId]);

  const onPointer = (
    event: React.PointerEvent<HTMLCanvasElement>
  ) => {
    if (!engineRef.current || !active) return;

    const rect =
      event.currentTarget.getBoundingClientRect();

    engineRef.current.pointer(
      event.clientX - rect.left,
      event.clientY - rect.top
    );
  };

  const quickProgress =
    hud.remainingMs === null
      ? 0
      : Math.max(
          0,
          Math.min(1, hud.remainingMs / 60_000)
        );

  const timeValue =
    mode === "quick"
      ? formatClock(hud.remainingMs ?? 0)
      : formatElapsedClock(hud.elapsedMs);

  return (
    <div className="grid h-full min-h-0 grid-rows-[auto_minmax(0,1fr)] gap-3 select-none">
      <section className="rounded-xl border border-white/10 bg-slate-950/72 px-4 py-3 shadow-lg backdrop-blur tabular-nums">
        <div className="grid grid-cols-4 items-center gap-3">
          <HudItem
            label={
              mode === "quick" ? "Time left" : "Time"
            }
            value={timeValue}
          />

          <HudItem
            label="Score"
            value={formatScore(hud.score)}
            centred
          />

          <HudItem
            label="Combo"
            value={comboMultiplier(hud.combo)}
            centred
          />

          {mode === "quick" && (
            <HudItem
              label="Hit rate"
              value={`${Math.round(hud.hitRate)}%`}
              right
            />
          )}

          {mode === "survival" && (
            <HudItem
              label="Lives"
              value={`${"♥".repeat(
                hud.lives
              )}${"♡".repeat(
                Math.max(0, 3 - hud.lives)
              )}`}
              right
              accent="amber"
            />
          )}

          {mode === "chaos" && (
            <HudItem
              label={`Level ${hud.level}`}
              value={hud.wave ?? "build"}
              right
              accent="rose"
            />
          )}
        </div>

        {mode === "quick" && (
          <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-blue-400 transition-[width] duration-100"
              style={{
                width: `${quickProgress * 100}%`,
              }}
            />
          </div>
        )}

        {mode === "chaos" && (
          <div className="mt-2 flex items-center gap-3">
            <span className="text-[11px] font-medium text-slate-400">
              Overload {Math.round(hud.overload)}%
            </span>

            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
              <div
                className={`h-full rounded-full transition-[width] duration-100 ${
                  hud.overload >= 75
                    ? "bg-rose-500"
                    : hud.overload >= 45
                      ? "bg-amber-400"
                      : "bg-emerald-400"
                }`}
                style={{
                  width: `${hud.overload}%`,
                }}
              />
            </div>
          </div>
        )}
      </section>

      <div
        ref={canvasHostRef}
        style={{
          contain: "layout paint size",
        }}
        className="relative min-h-0 overflow-hidden rounded-xl bg-[color:var(--bg)] touch-none"
      >
        <canvas
          ref={canvasRef}
          onPointerDown={onPointer}
          className="block h-full w-full cursor-crosshair"
        />

        {active && (
          <button
            type="button"
            onPointerDown={(event) =>
              event.stopPropagation()
            }
            onClick={() =>
              engineRef.current?.end()
            }
            className="absolute bottom-3 right-3 rounded-lg border border-white/10 bg-slate-950/75 px-3 py-1.5 text-xs font-medium text-slate-300 backdrop-blur hover:bg-slate-900 hover:text-white"
          >
            End run
          </button>
        )}
      </div>
    </div>
  );
}

function HudItem({
  label,
  value,
  centred = false,
  right = false,
  accent = "default",
}: {
  label: string;
  value: string;
  centred?: boolean;
  right?: boolean;
  accent?: "default" | "amber" | "rose";
}) {
  const alignment = centred
    ? "text-center"
    : right
      ? "text-right"
      : "text-left";

  const valueColour =
    accent === "amber"
      ? "text-amber-300"
      : accent === "rose"
        ? "text-rose-300 capitalize"
        : "text-white";

  return (
    <div className={alignment}>
      <div className="text-[10px] font-medium uppercase tracking-[0.16em] text-slate-400">
        {label}
      </div>

      <div
        className={`text-lg font-semibold ${valueColour}`}
      >
        {value}
      </div>
    </div>
  );
}