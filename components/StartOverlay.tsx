"use client";

export default function StartOverlay({ onStart }: { onStart: () => void }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-[linear-gradient(180deg,rgba(15,23,42,.75),rgba(2,6,23,.75))]">
      <div className="rounded-2xl p-8 border border-slate-700 bg-[color:var(--surface)]/80 backdrop-blur text-center max-w-sm mx-auto space-y-4">
        <div>
          <h3 className="text-xl font-semibold mb-1">Aim Trainer</h3>
          <p className="text-slate-300 text-sm">Press start and click the center of each target as it appears.</p>
        </div>
        <button className="btn w-full" onClick={onStart}>Start</button>
      </div>
    </div>
  );
}
