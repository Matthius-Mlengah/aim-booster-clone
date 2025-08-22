"use client";

type Results = {
  accuracy: number;
  avgMs: number;
  medianMs: number;
  p95Ms: number;
  tpm: number;
  attempts: number;
  elapsedMs: number;
};

export default function ResultsCard({
  stats,
  onRestart,
  onBackToStart,
}: {
  stats: Results;
  onRestart: () => void;
  onBackToStart: () => void;
}) {
  const clamp = (n: number) => (Number.isFinite(n) ? n : 0);
  const fmtPct = (n: number) => `${clamp(n).toFixed(1)}%`;
  const fmtInt = (n: number) => `${Math.round(clamp(n))}`;
  const fmtMs  = (n: number) => fmtInt(n);
  const fmtTPM = (n: number) => (Number.isFinite(n) ? n.toFixed(0) : "0");

  const fmtClock = (() => {
    const ms = clamp(stats.elapsedMs);
    const s = Math.floor(ms / 1000);
    const m = Math.floor(s / 60);
    return `${String(m).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
  })();

  const stop = (e: React.SyntheticEvent) => e.stopPropagation();

  const downloadPdf = async () => {
    const { default: jsPDF } = await import("jspdf");
    const doc = new jsPDF();
    let y = 16;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("Round Results", 14, y);
    y += 8;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.text(`Duration: ${fmtClock}`, 14, y);
    y += 8;

    const rows: [string, string][] = [
      ["Accuracy", fmtPct(stats.accuracy)],
      ["Avg reaction (ms)", fmtMs(stats.avgMs)],
      ["Median reaction (ms)", fmtMs(stats.medianMs)],
      ["95th percentile (ms)", fmtMs(stats.p95Ms)],
      ["Targets/min", fmtTPM(stats.tpm)],
      ["Attempts", fmtInt(stats.attempts)],
    ];

    rows.forEach(([k, v]) => {
      doc.setFont("helvetica", "bold"); doc.text(`${k}:`, 14, y);
      doc.setFont("helvetica", "normal"); doc.text(`${v}`, 90, y);
      y += 6;
    });

    y += 4;
    doc.setFontSize(10);
    doc.text(
      "Avg = mean; Median = middle value; 95th percentile = 95% of hits were this fast or faster; Targets/min = attempts per minute.",
      14, y, { maxWidth: 180 }
    );

    doc.save("aim-trainer-results.pdf");
  };

  return (
    <div
      className="rounded-2xl border border-white/10 bg-slate-900/70 p-6 backdrop-blur tabular-nums"
      onPointerDown={stop}
      onClick={stop}
    >
      <h3 className="text-3xl font-semibold mb-4">Round Results</h3>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Stat title="Accuracy" value={fmtPct(stats.accuracy)} />
        <Stat title="Avg reaction (ms)" value={fmtMs(stats.avgMs)} />
        <Stat title="Median reaction (ms)" value={fmtMs(stats.medianMs)} />
        <Stat title="95th percentile (ms)" value={fmtMs(stats.p95Ms)} />
        <Stat title="Targets/min" value={fmtTPM(stats.tpm)} />
        <Stat title="Attempts" value={fmtInt(stats.attempts)} />
      </div>

      <p className="text-xs text-slate-400 mt-4">
        Avg = mean; Median = middle value; 95th percentile = 95% of hits were this fast or faster;
        Targets/min = attempts per minute.
      </p>

      <div className="mt-5 flex flex-wrap gap-3">
        <button
          onClick={downloadPdf}
          className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-5 py-3 font-medium text-white shadow-sm hover:bg-blue-500 active:translate-y-[1px] focus:outline-none focus:ring-2 focus:ring-blue-400/50"
        >
          Download PDF
        </button>
        <button
          onClick={onRestart}
          className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-5 py-3 font-medium text-white shadow-sm hover:bg-blue-500 active:translate-y-[1px] focus:outline-none focus:ring-2 focus:ring-blue-400/50"
        >
          Play Again
        </button>
        <button
          onClick={onBackToStart}
          className="inline-flex items-center justify-center rounded-xl bg-white/10 px-5 py-3 font-medium text-slate-100 hover:bg-white/15 active:translate-y-[1px] focus:outline-none focus:ring-2 focus:ring-white/20"
        >
          Back to Start
        </button>
      </div>
    </div>
  );
}

function Stat({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
      <div className="text-slate-300 text-sm">{title}</div>
      <div className="text-2xl font-semibold mt-1">{value}</div>
    </div>
  );
}
