export const DEBUG_ENABLED =
  (typeof process !== "undefined" && process.env.NEXT_PUBLIC_DEBUG === "1") ||
  (typeof process !== "undefined" && process.env.NODE_ENV !== "production");

type Level = "log" | "info" | "warn" | "error";

function base(scope: string, level: Level) {
  return (...args: unknown[]) => {
    if (!DEBUG_ENABLED) return;
    (console as any)[level](`[${scope}]`, ...args);
  };
}

export function makeLogger(scope: string) {
  return {
    log: base(scope, "log"),
    info: base(scope, "info"),
    warn: base(scope, "warn"),
    error: base(scope, "error"),
  };
}

export const dbg = makeLogger("app");
