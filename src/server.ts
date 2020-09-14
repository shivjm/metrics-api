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
    const { value } = req.body;
    logger.info("Request received: record", {
      metric,
      value,
    });

    if (typeof value !== "number" || isNaN(value) || !isFinite(value)) {
      res.status(400).send({});
      return;
    }

    metrics.record(metric, Math.round(value));

    res.header("Content-Type", "application/json").status(200).send({});
  });

  app.get("/metric/:metric/sum", (req, res) => {
    const metric = req.params.metric;
    logger.info("Request received: sum", { metric });
    const value = metrics.sum(metric);

    if (value === undefined) {
      res.status(400).send(`Unknown metric: ${metric}`);
      return;
    }

    res
      .header("Content-Type", "application/json")
      .status(200)
      .send(JSON.stringify({ value }));
  });

  return app;
}
