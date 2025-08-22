import { TextDecoder, TextEncoder } from "node:util";
import { performance as nodePerformance } from "node:perf_hooks";

(globalThis as any).TextEncoder ||= TextEncoder;
(globalThis as any).TextDecoder ||= TextDecoder;
(globalThis as any).DOMMatrix ||= class DOMMatrix {
  a = 1; b = 0; c = 0; d = 1; e = 0; f = 0;
  constructor(_: any = null) {}
};
(globalThis as any).performance ||= nodePerformance;

if (process.env.VITEST_SILENT_LOGS === "1") {
  const noop = () => {};
  console.log = noop as any;
  console.info = noop as any;
  console.warn = noop as any;
  console.error = noop as any;
}

export {};
