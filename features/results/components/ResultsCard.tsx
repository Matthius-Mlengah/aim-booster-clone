"use client";

import type React from "react";
import { GAME_MODES } from "@/features/game/modes";
import type { RoundResult } from "@/features/game/types";
import { downloadResultsPdf } from "@/features/results/downloadResultsPdf";
import type { PersonalBest } from "@/lib/personalBests";
import {
  formatElapsedClock,
  formatInteger,
  formatMilliseconds,
  formatPercent,
  formatScore,
  formatTargetsPerMinute,
} from "@/lib/format";

function getObservation(result: RoundResult) {
  if (result.hitRate < 75) {
    return "Your speed is creating extra misses. Pause for a fraction longer before each click.";
  }

  if (result.centrePrecision < 62) {
    return "Your hit rate is solid. Aim closer to the centre to turn more hits into high-value shots.";
  }

  if (result.avgMs > 650) {
    return "Your precision is strong. Try moving sooner after each new target appears.";
  }

  if (result.bestCombo < 10) {
    return "Focus on maintaining a clean rhythm. A longer combo will raise your score quickly.";
  }

  return "Strong balance of speed and precision. Push for a longer combo on the next run.";
}

function endReasonText(result: RoundResult) {
  if (result.endReason === "time") {
    return "Time complete";
  }

  if (result.endReason === "lives") {
    return "All lives lost";
  }

  if (result.endReason === "overload") {
    return "Overload reached 100%";
  }

  return "Run ended early";
}

export default function ResultsCard({
  result,
  personalBest,
  isNewBest,
  onRestart,
  onBackToStart,
}: {
  result: RoundResult;
  personalBest: PersonalBest;
  isNewBest: boolean;
  onRestart: () => void;
  onBackToStart: () => void;
}) {
  const stop = (event: React.SyntheticEvent) => {
    event.stopPropagation();
  };

  const modeName =
    GAME_MODES.find(
      (mode) => mode.id === result.mode
    )?.name ?? "Round";

  return (
    <div
      className="w-full max-w-3xl rounded-2xl border border-white/10 bg-slate-900/96 p-5 shadow-2xl backdrop-blur tabular-nums"
      onPointerDown={stop}
      onClick={stop}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-sm font-medium text-blue-300">
            {modeName} · {endReasonText(result)}
          </div>

          <h3 className="mt-0.5 text-2xl font-semibold">
            Run results
          </h3>
        </div>

        {isNewBest && (
          <div className="rounded-full border border-amber-300/30 bg-amber-400/15 px-3 py-1.5 text-xs font-semibold text-amber-200">
            New personal best
          </div>
        )}
      </div>

      <div className="mt-4 flex items-end justify-between gap-4 rounded-2xl border border-blue-400/20 bg-blue-500/10 px-5 py-4">
        <div>
          <div className="text-xs font-medium uppercase tracking-[0.18em] text-blue-300">
            Score
          </div>

          <div className="mt-0.5 text-4xl font-black text-white">
            {formatScore(result.score)}
          </div>
        </div>

        <div className="pb-1 text-right text-sm text-slate-300">
          Personal best

          <div className="font-semibold text-white">
            {formatScore(personalBest.bestScore)}
          </div>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-5">
        <Stat
          title="Time"
          value={formatElapsedClock(result.elapsedMs)}
        />

        <Stat
          title="Hit rate"
          value={formatPercent(result.hitRate)}
        />

        <Stat
          title="Centre precision"
          value={formatPercent(
            result.centrePrecision
          )}
        />

        <Stat
          title="Best combo"
          value={formatInteger(result.bestCombo)}
        />

        <Stat
          title="Average reaction"
          value={`${formatMilliseconds(
            result.avgMs
          )} ms`}
        />
      </div>

      <p className="mt-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm leading-5 text-slate-300">
        {getObservation(result)}
      </p>

      <details className="mt-3 rounded-xl border border-white/10 bg-black/10 px-4 py-2.5 text-sm">
        <summary className="cursor-pointer select-none font-medium text-slate-200 hover:text-white">
          More details
        </summary>

        <div className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
          <MiniStat
            title="Hits per minute"
            value={formatTargetsPerMinute(
              result.hitsPerMinute
            )}
          />

          <MiniStat
            title="Hits / misses"
            value={`${result.hits} / ${result.missClicks}`}
          />

          <MiniStat
            title="Escaped targets"
            value={formatInteger(
              result.expiredTargets
            )}
          />

          <MiniStat
            title={
              result.mode === "chaos"
                ? "Highest level"
                : "Median reaction"
            }
            value={
              result.mode === "chaos"
                ? formatInteger(result.highestLevel)
                : `${formatMilliseconds(
                    result.medianMs
                  )} ms`
            }
          />
        </div>
      </details>

      <div className="mt-4 flex flex-wrap gap-2.5">
        <button
          onClick={onRestart}
          className="btn px-5 py-2.5"
        >
          Play Again
        </button>

        <button
          onClick={() =>
            downloadResultsPdf(result)
          }
          className="inline-flex items-center justify-center rounded-xl bg-white/10 px-4 py-2.5 text-sm font-medium text-slate-100 hover:bg-white/15 active:translate-y-[1px] focus:outline-none focus:ring-2 focus:ring-white/20"
        >
          Download PDF
        </button>

        <button
          onClick={onBackToStart}
          className="inline-flex items-center justify-center rounded-xl border border-white/10 px-4 py-2.5 text-sm font-medium text-slate-300 hover:bg-white/5 hover:text-white active:translate-y-[1px]"
        >
          Change Mode
        </button>
      </div>
    </div>
  );
}

function Stat({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-3">
      <div className="text-[11px] leading-4 text-slate-400">
        {title}
      </div>

      <div className="mt-1 text-lg font-semibold text-white">
        {value}
      </div>
    </div>
  );
}

function MiniStat({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div className="rounded-lg bg-white/5 px-3 py-2">
      <div className="text-[11px] text-slate-500">
        {title}
      </div>

      <div className="mt-0.5 font-semibold text-slate-200">
        {value}
      </div>
    </div>
  );
}