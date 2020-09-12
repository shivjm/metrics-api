import { stdout } from "process";

import { getSystemTimeInSeconds } from "./time";

export type Context = { [k: string]: any };

type LoggerHandler = (message: string, context: object) => void;

// A log level, with `ERROR` being the highest priority and `TRACE` the lowest.
export const enum Level {
  ERROR,
  WARN,
  INFO,
  DEBUG,
  TRACE,
}

// A simple logging utility.
export class Logger {
  readonly error: LoggerHandler;
  readonly warn: LoggerHandler;
  readonly info: LoggerHandler;
  readonly debug: LoggerHandler;
  readonly trace: LoggerHandler;

  constructor(
    public readonly level: Level,
    public readonly context: Context = {}
  ) {
    this.error = level >= Level.TRACE ? handler("error", context) : discard;
    this.warn = level >= Level.WARN ? handler("warn", context) : discard;
    this.info = level >= Level.INFO ? handler("info", context) : discard;
    this.debug = level >= Level.DEBUG ? handler("debug", context) : discard;
    this.trace = level >= Level.TRACE ? handler("trace", context) : discard;
  }

  // Returns a new logger that merges the given context with the existing context.
  child(childContext: Context): Logger {
    return new Logger(this.level, { ...this.context, childContext });
  }
}

function discard(_message: string, _context: Context) {}

function handler(label: string, loggerContext: Context): LoggerHandler {
  return (message: string, userContext: Context = {}) => {
    const context = {
      timestamp: getSystemTimeInSeconds(),
      message,
      level: label,
      ...loggerContext,
      ...userContext,
    };

    stdout.write(JSON.stringify(context) + "\n");
  };
}
