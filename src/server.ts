import * as express from "express";

import { Logger } from "./logger";
import { Metrics } from "./metrics";

export function create(
  logger: Logger,
  maxAgeInSeconds: number,
  getCurrentTime: () => number,
  registerPruneCallback: (callback: () => void) => void
) {
  const app = express();
  app.use(express.json());

  const metrics = new Metrics(maxAgeInSeconds, getCurrentTime);
  registerPruneCallback(() => metrics.prune());

  app.post("/metric/:metric", (req, res) => {
    const metric = req.params.metric;
    const raw = req.body.value;
    const value = parseInt(raw, 10);
    logger.info("Request received: record", {
      metric,
      value,
    });

    if (isNaN(value) || value === NaN) {
      res.status(400).send("`value` must be a number");
      return;
    }

    metrics.record(metric, req.body.value);

    res.status(200).send("{}");
  });

  app.get("/metric/:metric/sum", (req, res) => {
    const metric = req.params.metric;
    logger.info("Request received: sum", { metric });
    const value = metrics.sum(metric);

    if (value === undefined) {
      res.status(400).send(`Unknown metric: ${metric}`);
      return;
    }

    res.status(200).send(value.toString(10));
  });

  return app;
}
