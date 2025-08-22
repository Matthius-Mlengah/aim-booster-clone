export const DEBUG = false;

type LogArgs = unknown[];

export const log = (...a: LogArgs): void => {
  if (DEBUG) console.log(...a);
};

export const info = (...a: LogArgs): void => {
  if (DEBUG) console.info(...a);
};

export const warn = (...a: LogArgs): void => {
  if (DEBUG) console.warn(...a);
};
