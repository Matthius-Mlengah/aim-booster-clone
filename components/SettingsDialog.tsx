"use client";

import type React from "react";
import type { AppSettings } from "@/lib/personalBests";

export default function SettingsDialog({
  open,
  settings,
  onChangeSaveProgress,
  onDeleteSavedProgress,
  onClose,
}: {
  open: boolean;
  settings: AppSettings;
  onChangeSaveProgress: (enabled: boolean) => void;
  onDeleteSavedProgress: () => void;
  onClose: () => void;
}) {
  if (!open) return null;

  const stop = (event: React.SyntheticEvent) => {
    event.stopPropagation();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-sm"
      onPointerDown={onClose}
      role="presentation"
    >
      <section
        className="w-full max-w-md rounded-2xl border border-white/10 bg-slate-900 p-5 shadow-2xl"
        onPointerDown={stop}
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-title"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2
              id="settings-title"
              className="text-xl font-semibold text-white"
            >
              Settings
            </h2>

            <p className="mt-1 text-sm leading-6 text-slate-400">
              Your progress is stored only in this browser and is
              never sent anywhere.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-white/10 px-2.5 py-1.5 text-sm text-slate-300 hover:bg-white/5 hover:text-white"
            aria-label="Close settings"
          >
            Close
          </button>
        </div>

        <div className="mt-5 rounded-xl border border-white/10 bg-white/5 p-4">
          <label className="flex cursor-pointer items-start justify-between gap-4">
            <span>
              <span className="block font-medium text-white">
                Save progress on this device
              </span>

              <span className="mt-1 block text-sm leading-5 text-slate-400">
                Saves personal bests for Quick Play, Survival, and
                Chaos.
              </span>
            </span>

            <input
              type="checkbox"
              checked={settings.saveProgress}
              onChange={(event) =>
                onChangeSaveProgress(event.target.checked)
              }
              className="mt-1 h-5 w-5 accent-blue-500"
            />
          </label>
        </div>

        <div className="mt-4 rounded-xl border border-rose-400/20 bg-rose-500/8 p-4">
          <h3 className="font-medium text-rose-100">
            Delete saved progress
          </h3>

          <p className="mt-1 text-sm leading-5 text-slate-400">
            Removes all saved scores, best times, combos, and Chaos
            levels from this browser.
          </p>

          <button
            type="button"
            onClick={() => {
              const confirmed = window.confirm(
                "Delete all saved Aim Trainer progress from this browser?"
              );

              if (confirmed) {
                onDeleteSavedProgress();
              }
            }}
            className="mt-3 rounded-xl border border-rose-400/30 bg-rose-500/15 px-4 py-2 text-sm font-semibold text-rose-100 hover:bg-rose-500/25"
          >
            Delete saved progress
          </button>
        </div>
      </section>
    </div>
  );
}