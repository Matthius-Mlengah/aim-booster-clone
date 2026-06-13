"use client";

import { useEffect, useMemo, useState } from "react";
import GameSurface from "@/features/game/components/GameSurface";
import StartOverlay from "@/components/StartOverlay";
import CountdownOverlay from "@/components/CountdownOverlay";
import ResultsCard from "@/components/ResultsCard";
import SettingsDialog from "@/components/SettingsDialog";
import { GAME_MODES } from "@/features/game/modes";
import type { GameModeId, RoundResult } from "@/features/game/types";
import {
  clearSavedProgress,
  createEmptyPersonalBests,
  DEFAULT_APP_SETTINGS,
  loadAppSettings,
  loadPersonalBests,
  recordPersonalBest,
  saveAppSettings,
  type AppSettings,
  type PersonalBestMap,
} from "@/lib/personalBests";

type GamePhase = "menu" | "countdown" | "running" | "results";

const MODE_DETAIL_STYLES: Record<
  GameModeId,
  {
    strapline: string;
    notice: string;
  }
> = {
  quick: {
    strapline: "text-blue-300",
    notice: "border-blue-400/20 bg-blue-500/10 text-blue-100",
  },
  survival: {
    strapline: "text-amber-300",
    notice: "border-amber-400/25 bg-amber-500/10 text-amber-100",
  },
  chaos: {
    strapline: "text-rose-300",
    notice: "border-rose-400/25 bg-rose-500/10 text-rose-100",
  },
};

export default function GameShell() {
  const [phase, setPhase] = useState<GamePhase>("menu");
  const [selectedMode, setSelectedMode] = useState<GameModeId>("quick");
  const [countdown, setCountdown] = useState<number | "GO">(3);
  const [result, setResult] = useState<RoundResult | null>(null);
  const [sessionId, setSessionId] = useState(0);
  const [personalBests, setPersonalBests] = useState<PersonalBestMap>(
    createEmptyPersonalBests
  );
  const [settings, setSettings] =
    useState<AppSettings>(DEFAULT_APP_SETTINGS);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [isNewBest, setIsNewBest] = useState(false);

  useEffect(() => {
    setPersonalBests(loadPersonalBests());
    setSettings(loadAppSettings());
  }, []);

  useEffect(() => {
    if (phase !== "countdown") return;

    setCountdown(3);

    const timers = [
      window.setTimeout(() => setCountdown(2), 850),
      window.setTimeout(() => setCountdown(1), 1_700),
      window.setTimeout(() => setCountdown("GO"), 2_550),
      window.setTimeout(() => setPhase("running"), 3_050),
    ];

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, [phase, sessionId]);

  const start = () => {
    setResult(null);
    setIsNewBest(false);
    setSessionId((current) => current + 1);
    setPhase("countdown");
  };

  const finish = (roundResult: RoundResult) => {
    const saved = recordPersonalBest(
      roundResult,
      settings.saveProgress,
      personalBests
    );

    setPersonalBests(saved.personalBests);
    setIsNewBest(saved.isNewScoreBest);
    setResult(roundResult);
    setPhase("results");
  };

  const backToStart = () => {
    setResult(null);
    setIsNewBest(false);
    setSessionId((current) => current + 1);
    setPhase("menu");
  };

  const updateSaveProgress = (enabled: boolean) => {
    const nextSettings = {
      ...settings,
      saveProgress: enabled,
    };

    setSettings(nextSettings);
    saveAppSettings(nextSettings);
  };

  const deleteSavedProgress = () => {
    clearSavedProgress();
    setPersonalBests(createEmptyPersonalBests());
    setIsNewBest(false);
  };

  const selectedDefinition = useMemo(
    () =>
      GAME_MODES.find((mode) => mode.id === selectedMode) ??
      GAME_MODES[0],
    [selectedMode]
  );

  const modeStyles = MODE_DETAIL_STYLES[selectedMode];

  return (
    <>
      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_300px]">
        <div className="card relative h-[620px] overflow-hidden p-3 sm:h-[680px] sm:p-4 lg:h-[720px]">
          <GameSurface
            active={phase === "running"}
            mode={selectedMode}
            sessionId={sessionId}
            onEnd={finish}
          />

          {phase === "menu" && (
            <StartOverlay
              selectedMode={selectedMode}
              personalBests={personalBests}
              onSelectMode={setSelectedMode}
              onStart={start}
            />
          )}

          {phase === "countdown" && (
            <CountdownOverlay value={countdown} />
          )}

          {phase === "results" && result && (
            <div className="absolute inset-0 flex items-center justify-center overflow-hidden bg-black/60 p-4 backdrop-blur">
              <ResultsCard
                result={result}
                personalBest={personalBests[result.mode]}
                isNewBest={isNewBest}
                onRestart={start}
                onBackToStart={backToStart}
              />
            </div>
          )}
        </div>

        <aside className="card h-fit space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div
                className={`text-xs font-medium uppercase tracking-[0.16em] ${modeStyles.strapline}`}
              >
                {selectedDefinition.strapline}
              </div>

              <h2 className="mt-1 text-lg font-semibold">
                {selectedDefinition.name}
              </h2>
            </div>

            <button
              type="button"
              onClick={() => setSettingsOpen(true)}
              className="rounded-lg border border-white/10 px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-white/5 hover:text-white"
            >
              Settings
            </button>
          </div>

          <p className="text-sm leading-6 text-slate-300">
            {selectedDefinition.description}
          </p>

          <div>
            <h3 className="mb-2 text-sm font-semibold text-white">
              How to score
            </h3>

            <ul className="space-y-1.5 text-sm text-slate-300">
              <li>• Fast centre hits earn the most points.</li>
              <li>• Consecutive hits build a multiplier up to x2.</li>
              <li>• Misses and expired targets reset the combo.</li>
            </ul>
          </div>

          {selectedMode === "survival" && (
            <p
              className={`rounded-xl border p-3 text-sm ${modeStyles.notice}`}
            >
              You have three lives. Every escaped target removes one.
            </p>
          )}

          {selectedMode === "chaos" && (
            <div
              className={`space-y-2 rounded-xl border p-3 text-sm ${modeStyles.notice}`}
            >
              <p>
                Expired targets and misses add overload. Accurate hits
                reduce it.
              </p>

              <div className="grid grid-cols-2 gap-1 text-xs text-slate-300">
                <span>★ Gold: bonus score</span>
                <span>! Danger: high pressure</span>
                <span>+ Calm: clears overload</span>
                <span>Blue: standard target</span>
              </div>
            </div>
          )}

          <p className="text-xs leading-5 text-slate-500">
            {settings.saveProgress
              ? "Personal bests are saved on this device."
              : "Progress saving is turned off."}
          </p>
        </aside>
      </section>

      <SettingsDialog
        open={settingsOpen}
        settings={settings}
        onChangeSaveProgress={updateSaveProgress}
        onDeleteSavedProgress={deleteSavedProgress}
        onClose={() => setSettingsOpen(false)}
      />
    </>
  );
}