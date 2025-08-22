"use client";

import { useMemo, useState } from "react";
import GameSurface from "@/features/game/components/GameSurface";
import StartOverlay from "@/components/StartOverlay";
import ResultsCard from "@/components/ResultsCard";
import { summarizeStats } from "@/lib/stats";
import type { Attempt } from "@/features/game/types";

export default function GameShell() {
  const [running, setRunning] = useState(false);
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [roundStart, setRoundStart] = useState<number | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [resetSeq, setResetSeq] = useState(0);

  const start = () => {
    setShowResults(false);
    setAttempts([]);
    setRoundStart(performance.now());
    setResetSeq(s => s + 1);
    setRunning(false);
    requestAnimationFrame(() => {
      setRunning(true);
    });
  };

  const end = () => { setRunning(false); setShowResults(true); };

  const backToStart = () => {
    setRunning(false);
    setShowResults(false);
    setAttempts([]);
    setRoundStart(null);
    setResetSeq(s => s + 1);
  };

  const onAttempt = (a: Attempt) => setAttempts(prev => [...prev, a]);

  const elapsedMs = useMemo(() => {
    if (!roundStart) return 0;
    if (running) return performance.now() - roundStart;
    const last = attempts.at(-1)?.t ?? roundStart;
    return last - roundStart;
  }, [roundStart, running, attempts]);

  const stats = useMemo(() => summarizeStats(attempts, elapsedMs), [attempts, elapsedMs]);

  return (
    <section className="grid gap-4 md:grid-cols-[1fr_minmax(260px,300px)]">
      <div className="card relative overflow-hidden">
        <div className="relative mx-auto w-full max-w-4xl">
          <div className="w-full" style={{ aspectRatio: "16 / 9" }}>
            <GameSurface
              running={running}
              onAttempt={onAttempt}
              onEnd={end}
              resetSeq={resetSeq}
            />
          </div>
        </div>

        {!running && !showResults && <StartOverlay onStart={start} />}

        {showResults && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur">
            <ResultsCard stats={stats} onRestart={start} onBackToStart={backToStart} />
          </div>
        )}
      </div>

      <aside className="card h-fit">
        <h2 className="text-lg font-semibold mb-2">How to play</h2>
        <ol className="list-decimal list-inside text-sm text-slate-300 space-y-1">
          <li>Click <span className="font-medium">Start</span> to begin.</li>
          <li>Targets spawn in the window; hit near the center.</li>
          <li>End any time to see stats and save a PDF.</li>
        </ol>
      </aside>
    </section>
  );
}
