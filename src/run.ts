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
  METRICS_APP_MAX_AGE_SECONDS: "60",
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

const app = create(
  logger,
  parseInt(METRICS_APP_MAX_AGE_SECONDS, 10),
  getMonotonicTimeInSeconds,
  (prune) =>
    setInterval(() => {
      const deleted = prune();
      logger.info("Pruned expired entries", { deleted });
    }, parseInt(METRICS_APP_PRUNE_INTERVAL_SECONDS, 10) * 1000)
);
app.listen(METRICS_APP_PORT);
