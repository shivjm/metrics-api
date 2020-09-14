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
      const response1 = await agent.get("/metric/foo/sum");
      assert.equal(
        response1.status,
        400,
        "fetching an unknown metric must return a 400 Bad Request"
      );
      pruneCallback();

      for (const value of ["5.1", Infinity, NaN]) {
        const response = await agent.post("/metric/foo").send({ value });
        assert.equal(
          response.status,
          400,
          `trying to record a value of ${JSON.stringify(value)} must fail`
        );
      }

      const response2 = await agent.post("/metric/foo").send({ value: 5.1 });
      assert.equal(response2.status, 200);
      assert.deepEqual(response2.body, {});

      assert.deepEqual(
        (await agent.get("/metric/foo/sum")).body,
        { value: 5 },
        "metrics must be saved"
      );

      time = 61; // the age is now exactly the maximum
      pruneCallback();

      assert.deepEqual(
        (await agent.get("/metric/foo/sum")).body,
        { value: 5 },
        "metrics at the maximum age must not be erased"
      );

      await agent.post("/metric/foo").send({ value: 71.9 });

      // no change in the time, so no metrics should be pruned
      pruneCallback();
      assert.deepEqual(
        (await agent.get("/metric/foo/sum")).body,
        { value: 77 },
        "metrics at the maximum age must not be erased (no change in time)"
      );

      time = 62;
      // now the first metric should be pruned
      pruneCallback();
      assert.deepEqual(
        (await agent.get("/metric/foo/sum")).body,
        { value: 72 },
        "outdated metrics must be pruned"
      );

      time = 122;
      // now the second metric is older than the maximum, but there is no call
      // to `pruneCallback`, so it shouldn't be deleted yet
      assert.deepEqual(
        (await agent.get("/metric/foo/sum")).body,
        { value: 72 },
        "outdated metrics must not be pruned without an explicit call to `prune`"
      );
      pruneCallback();

      // *now* it should have been deleted

      assert.deepEqual(
        (await agent.get("/metric/foo/sum")).body,
        { value: 0 },
        "metrics older than the maximum age must be erased (second round)"
      );
    } finally {
      agent.close();
    }
  });
});
