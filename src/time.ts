import { performance } from "perf_hooks";

// Returns a number representing a monotonically increasing time in seconds.
// This number is not meaningful except relative to other such numbers.
export function getMonotonicTimeInSeconds(): number {
  return performance.now() / 1000;
}

// Returns a number representing the number of seconds elapsed since the Unix
// epoch.
export function getSystemTimeInSeconds(): number {
  return Math.floor(new Date().getTime() / 1000);
}
