import { Level, Logger } from "./logger";
import { create } from "./server";
import { getMonotonicTimeInSeconds } from "./time";

// TODO read from environment
const PORT = 3000;
const MAX_AGE_IN_SECONDS = 60;
const LOG_LEVEL = Level.TRACE;
const PRUNE_INTERVAL_SECONDS = 1;

const app = create(
  new Logger(LOG_LEVEL),
  MAX_AGE_IN_SECONDS,
  getMonotonicTimeInSeconds,
  (prune) => setInterval(prune, PRUNE_INTERVAL_SECONDS * 1000)
);
app.listen(PORT);
