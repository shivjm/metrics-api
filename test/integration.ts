import "mocha";
import chai = require("chai");
import chaiHttp = require("chai-http");
chai.use(chaiHttp);

const { assert } = chai;

import { Level, Logger } from "../src/logger";
import { create } from "../src/server";

describe("Server", () => {
  let time = 1;
  const getTime = () => time;

  let pruneCallback: () => void;

  const app = create(new Logger(Level.ERROR), 60, getTime, (prune) => {
    pruneCallback = prune;
  });

  it("should respond to /metric endpoints", async () => {
    const agent = chai.request(app).keepOpen();

    try {
      const response = await agent.get("/metric/foo/sum");
      assert.equal(
        response.status,
        400,
        "fetching an unknown metric must return a 400 Bad Request"
      );
      pruneCallback();

      await agent.post("/metric/foo").send({ value: 5 });

      assert.equal(
        (await agent.get("/metric/foo/sum")).text,
        "5",
        "metrics must be saved"
      );

      time = 61; // the age is now exactly the maximum
      pruneCallback();

      assert.equal(
        (await agent.get("/metric/foo/sum")).text,
        "5",
        "metrics at the maximum age must not be erased"
      );

      await agent.post("/metric/foo").send({ value: 72 });

      // no change in the time, so no metrics should be pruned
      pruneCallback();
      assert.equal(
        (await agent.get("/metric/foo/sum")).text,
        "77",
        "metrics at the maximum age must not be erased (no change in time)"
      );

      time = 62;
      // now the first metric should be pruned
      pruneCallback();
      assert.equal(
        (await agent.get("/metric/foo/sum")).text,
        "72",
        "outdated metrics must be pruned"
      );

      time = 122;
      // now the second metric is older than the maximum, but there is no call
      // to `pruneCallback`, so it shouldn't be deleted yet
      assert.equal(
        (await agent.get("/metric/foo/sum")).text,
        "72",
        "outdated metrics must not be pruned without an explicit call to `prune`"
      );
      pruneCallback();

      // *now* it should have been deleted

      assert.equal(
        (await agent.get("/metric/foo/sum")).text,
        "0",
        "metrics older than the maximum age must be erased (second round)"
      );
    } finally {
      agent.close();
    }
  });
});
