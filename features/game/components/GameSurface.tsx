"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createEngine } from "../engine";
import type { Attempt, HudStats } from "../types";
import { makeLogger } from "@/lib/debug";
const dbg = makeLogger("surface");

export default function GameSurface({
  running,
  onAttempt,
  onEnd,
  resetSeq = 0,
}: {
  running: boolean;
  onAttempt: (a: Attempt) => void;
  onEnd: () => void;
  resetSeq?: number;
}) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<ReturnType<typeof createEngine> | null>(null);
  const [hud, setHud] = useState<HudStats>({
    elapsedMs: 0, fps: 0, accuracy: 0, targets: 0, burst: 0, spawnEvery: 0
  });
  const [ready, setReady] = useState(false);

  const attemptRef = useRef(onAttempt);
  const endRef = useRef(onEnd);
  useEffect(() => { attemptRef.current = onAttempt; }, [onAttempt]);
  useEffect(() => { endRef.current = onEnd; }, [onEnd]);

  useEffect(() => {
    let mounted = true;
    let ro: ResizeObserver | null = null;

    (async () => {
      const canvas = canvasRef.current!;
      const eng = createEngine(canvas, (a) => attemptRef.current(a), () => endRef.current(), setHud);
      engineRef.current = eng;
      await eng.init();
      if (!mounted) return;

      eng.stop();

      const el = hostRef.current!;
      const resize = () => {
        const w = Math.floor(el.clientWidth);
        const h = Math.floor(el.clientHeight);
        const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
        eng.resize(w, h, dpr);
      };
      ro = new ResizeObserver(resize);
      ro.observe(el);
      resize();

      setReady(true);
      dbg.info("ready");
    })();

    return () => { mounted = false; engineRef.current?.stop(); ro?.disconnect(); };
  }, []);

  useEffect(() => {
    if (!ready || !engineRef.current) return;
    if (running) { dbg.info("running → start"); engineRef.current.start(); }
    else { dbg.info("running → stop"); engineRef.current.stop(); }
  }, [running, ready]);

  useEffect(() => { dbg.info("resetSeq", resetSeq); engineRef.current?.reset(); }, [resetSeq]);

  const fmtTime = useMemo(() => {
    const s = Math.floor(hud.elapsedMs / 1000), m = Math.floor(s / 60);
    return `${String(m).padStart(2,"0")}:${String(s % 60).padStart(2,"0")}`;
  }, [hud.elapsedMs]);

  const onPointer = (e: React.PointerEvent) => {
    if (!engineRef.current) return;
    const rect = (e.target as HTMLCanvasElement).getBoundingClientRect();
    engineRef.current.pointer(e.clientX - rect.left, e.clientY - rect.top);
  };

  return (
    <div
      ref={hostRef}
      style={{ contain: "layout paint size" }} 
      className="relative w-full h-full select-none touch-none rounded-xl overflow-hidden bg-[color:var(--bg)]"
    >
      <canvas ref={canvasRef} onPointerDown={onPointer} className="block w-full h-full" />

      <div className="absolute top-2 left-2 right-2 flex gap-6 text-sm text-slate-200 tabular-nums">
        <span>Time: <span className="font-semibold">{fmtTime}</span></span>
        <span>Accuracy: <span className="font-semibold">{hud.accuracy.toFixed(0)}%</span></span>
        <span>FPS: <span className="font-semibold">{Math.round(hud.fps)}</span></span>
        <span>At once: <span className="font-semibold">{hud.burst}</span></span>
      </div>
    </div>
  );
}
