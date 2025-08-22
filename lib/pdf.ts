import { jsPDF } from "jspdf";

export function downloadSummaryPDF(stats: {
  accuracy: number; meanMs: number; medianMs: number; p95Ms: number;
  tpm: number; attempts: number; hits: number; elapsedMs: number;
}) {
  const doc = new jsPDF();
  doc.setFontSize(18);
  doc.text("Aim Trainer Results", 20, 20);

  doc.setFontSize(12);
  const lines = [
    `Accuracy: ${stats.accuracy.toFixed(1)}%`,
    `Avg reaction (ms): ${Math.round(stats.meanMs)}`,
    `Median reaction (ms): ${Math.round(stats.medianMs)}`,
    `95th percentile (ms): ${Math.round(stats.p95Ms)}`,
    `Targets/min: ${Math.round(stats.tpm)}`,
    `Attempts: ${stats.attempts}`,
  ];
  lines.forEach((l, i) => doc.text(l, 20, 50 + i * 10));

  doc.save("results.pdf");
}
