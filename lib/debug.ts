export const DEBUG = false;

type LogArgs = unknown[];

export const log = (...a: LogArgs): void => { if (DEBUG) console.log(...a); };
export const info = (...a: LogArgs): void => { if (DEBUG) console.info(...a); };
export const warn = (...a: LogArgs): void => { if (DEBUG) console.warn(...a); };

export const makeLogger = (prefix: string) => {
  const withPrefix = (fn: (...a: LogArgs) => void) => (...a: LogArgs) => {
    if (DEBUG) fn(prefix, ...a);
  };
  return {
    log: withPrefix(console.log),
    info: withPrefix(console.info),
    warn: withPrefix(console.warn),
  };
};
