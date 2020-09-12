import "mocha";
import { assert } from "chai";

import { Metrics } from "../src/metrics";

describe("Metrics", () => {
  // simulate a monotonically increasing external timer
  let time = 1;
  const getCurrentTime = () => time;

  it("should be tracked correctly", () => {
    const metrics = new Metrics(3, getCurrentTime);

    assert.equal(metrics.sum("foo"), undefined);

    metrics.record("foo", 5);
    time = 4;
    metrics.record("bar", 10);
    time = 5;
    metrics.record("foo", 20);

    assert.equal(metrics.sum("foo"), 25);
    time = 6;
    assert.equal(metrics.prune(), 1);
    assert.equal(metrics.sum("foo"), 20);
    assert.equal(metrics.sum("bar"), 10);
    time = 20;
    assert.equal(metrics.prune(), 2);
    assert.equal(metrics.sum("foo"), 0);
    assert.equal(metrics.sum("bar"), 0);
    metrics.record("baz", 10999);
    metrics.record("baz", 2);
    assert.equal(metrics.sum("baz"), 11001);

    time = 25;
    metrics.record("foo", 3);
    assert.equal(metrics.sum("foo"), 3);

    time = 26;
    assert.equal(metrics.prune(), 2);
    assert.equal(metrics.sum("baz"), 0);
    assert.equal(metrics.sum("foo"), 3);
  });
});
