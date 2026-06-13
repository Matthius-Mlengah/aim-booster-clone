function clampFinite(value: number) {
  return Number.isFinite(value) ? value : 0;
}

export function formatClock(ms: number) {
  const safeMs = clampFinite(ms);
  const totalSeconds = Math.max(0, Math.ceil(safeMs / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function formatElapsedClock(ms: number) {
  const safeMs = clampFinite(ms);
  const totalSeconds = Math.max(0, Math.floor(safeMs / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function formatPercent(value: number, decimals = 1) {
  return `${clampFinite(value).toFixed(decimals)}%`;
}

export function formatInteger(value: number) {
  return Math.round(clampFinite(value)).toLocaleString("en-GB");
}

export function formatMilliseconds(value: number) {
  return formatInteger(value);
}

export function formatTargetsPerMinute(value: number) {
  return Number.isFinite(value) ? value.toFixed(0) : "0";
}

export function formatScore(value: number) {
  return formatInteger(value);
}
