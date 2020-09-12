import { Level, Logger, parseLevel } from "./logger";
import { create } from "./server";
import { getMonotonicTimeInSeconds } from "./time";

// we could read these from a `.env` file but to keep things simple we'll
// specify defaults here

const {
  METRICS_APP_PORT,
  METRICS_APP_MAX_AGE_SECONDS,
  METRICS_APP_PRUNE_INTERVAL_SECONDS,
  METRICS_APP_LOG_LEVEL,
} = {
  METRICS_APP_PORT: "3000",
  METRICS_APP_MAX_AGE_SECONDS: "3600",
  METRICS_APP_PRUNE_INTERVAL_SECONDS: "1",
  METRICS_APP_LOG_LEVEL: "DEBUG",
  ...process.env,
};

const logLevel = parseLevel(METRICS_APP_LOG_LEVEL);

const logger = new Logger(logLevel);
logger.info("Starting...", {
  port: METRICS_APP_PORT,
  maxAge: METRICS_APP_MAX_AGE_SECONDS,
  pruneInterval: METRICS_APP_PRUNE_INTERVAL_SECONDS,
  logLevel: logLevel,
});

let intervalId: NodeJS.Timeout;

const app = create(
  logger,
  parseInt(METRICS_APP_MAX_AGE_SECONDS, 10),
  getMonotonicTimeInSeconds,
  (prune) =>
    (intervalId = setInterval(() => {
      const deleted = prune();
      logger.info("Pruned expired entries", { deleted });
    }, parseInt(METRICS_APP_PRUNE_INTERVAL_SECONDS, 10) * 1000))
);
const server = app.listen(METRICS_APP_PORT);
process.on("SIGINT", () => {
  clearInterval(intervalId);
  server.close((err) => {
    if (err) {
      logger.error("Error shutting down server", { err });
      process.exitCode = 1;
    }
  });
});
