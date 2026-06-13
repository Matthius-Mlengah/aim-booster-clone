import { GAME_MODES } from "@/features/game/modes";
import type { RoundResult } from "@/features/game/types";
import {
  formatElapsedClock,
  formatInteger,
  formatMilliseconds,
  formatPercent,
  formatScore,
  formatTargetsPerMinute,
} from "@/lib/format";

export async function downloadResultsPdf(result: RoundResult) {
  const { default: jsPDF } = await import("jspdf");
  const doc = new jsPDF();
  const modeName = GAME_MODES.find((mode) => mode.id === result.mode)?.name ?? "Round";
  let y = 16;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text(`${modeName} Results`, 14, y);
  y += 10;

  doc.setFontSize(28);
  doc.text(formatScore(result.score), 14, y);
  y += 10;

  const rows: [string, string][] = [
    ["Duration", formatElapsedClock(result.elapsedMs)],
    ["Hit rate", formatPercent(result.hitRate)],
    ["Centre precision", formatPercent(result.centrePrecision)],
    ["Average reaction", `${formatMilliseconds(result.avgMs)} ms`],
    ["Median reaction", `${formatMilliseconds(result.medianMs)} ms`],
    ["Hits per minute", formatTargetsPerMinute(result.hitsPerMinute)],
    ["Hits", formatInteger(result.hits)],
    ["Miss clicks", formatInteger(result.missClicks)],
    ["Escaped targets", formatInteger(result.expiredTargets)],
    ["Best combo", formatInteger(result.bestCombo)],
  ];

  if (result.mode === "chaos") {
    rows.push(["Highest chaos level", formatInteger(result.highestLevel)]);
  }

  doc.setFontSize(11);
  rows.forEach(([label, value]) => {
    doc.setFont("helvetica", "bold");
    doc.text(`${label}:`, 14, y);
    doc.setFont("helvetica", "normal");
    doc.text(value, 88, y);
    y += 7;
  });

  doc.save(`aim-trainer-${result.mode}-results.pdf`);
}
