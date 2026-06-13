"use client";

import { GAME_MODES } from "@/features/game/modes";
import type { GameModeId } from "@/features/game/types";
import type { PersonalBestMap } from "@/lib/personalBests";
import {
  formatElapsedClock,
  formatScore,
} from "@/lib/format";

const MODE_COLOURS: Record<
  GameModeId,
  {
    active: string;
    inactive: string;
    strapline: string;
  }
> = {
  quick: {
    active:
      "border-blue-400 bg-blue-500/15 ring-2 ring-blue-400/20",
    inactive:
      "border-white/10 bg-white/5 hover:border-blue-400/35 hover:bg-blue-500/8",
    strapline: "text-blue-300",
  },

  survival: {
    active:
      "border-amber-400 bg-amber-500/15 ring-2 ring-amber-400/20",
    inactive:
      "border-white/10 bg-white/5 hover:border-amber-400/35 hover:bg-amber-500/8",
    strapline: "text-amber-300",
  },

  chaos: {
    active:
      "border-rose-400 bg-rose-500/15 ring-2 ring-rose-400/20",
    inactive:
      "border-white/10 bg-white/5 hover:border-rose-400/35 hover:bg-rose-500/8",
    strapline: "text-rose-300",
  },
};

export default function StartOverlay({
  selectedMode,
  personalBests,
  onSelectMode,
  onStart,
}: {
  selectedMode: GameModeId;
  personalBests: PersonalBestMap;
  onSelectMode: (mode: GameModeId) => void;
  onStart: () => void;
}) {
  const selected =
    GAME_MODES.find((mode) => mode.id === selectedMode) ??
    GAME_MODES[0];

  const best = personalBests[selectedMode];

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-[linear-gradient(180deg,rgba(15,23,42,.78),rgba(2,6,23,.88))] p-4">
      <div className="w-full max-w-2xl space-y-5 rounded-2xl border border-slate-700 bg-[color:var(--surface)]/92 p-6 shadow-2xl backdrop-blur">
        <div className="text-center">
          <h2 className="text-2xl font-semibold">
            Choose your challenge
          </h2>

          <p className="mt-1 text-sm text-slate-300">
            All modes reward speed, centre precision, and long
            combos.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          {GAME_MODES.map((mode) => {
            const active = mode.id === selectedMode;
            const colours = MODE_COLOURS[mode.id];

            return (
              <button
                key={mode.id}
                type="button"
                onClick={() => onSelectMode(mode.id)}
                className={`rounded-xl border p-4 text-left transition ${
                  active ? colours.active : colours.inactive
                }`}
              >
                <div className="font-semibold text-white">
                  {mode.name}
                </div>

                <div
                  className={`mt-1 text-xs font-medium ${colours.strapline}`}
                >
                  {mode.strapline}
                </div>

                <div className="mt-2 text-xs leading-5 text-slate-400">
                  {mode.description}
                </div>
              </button>
            );
          })}
        </div>

        <div className="flex flex-col gap-3 rounded-xl border border-white/10 bg-black/15 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="font-medium text-white">
              {selected.name}
            </div>

            <div className="text-sm text-slate-400">
              Best score: {formatScore(best.bestScore)}

              {selectedMode !== "quick" && best.bestTimeMs > 0
                ? ` · Best time: ${formatElapsedClock(
                    best.bestTimeMs
                  )}`
                : ""}
            </div>
          </div>

          <button
            className="btn min-w-36"
            type="button"
            onClick={onStart}
          >
            Play {selected.name}
          </button>
        </div>
      </div>
    </div>
  );
}