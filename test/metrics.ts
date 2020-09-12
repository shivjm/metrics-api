import "mocha";
import { assert } from "chai";

import { Metrics } from "../src/metrics";

describe("Metrics", () => {
  // simulate a monotonically increasing external timer
  const times = [1, 4, 5, 6, 20, 20, 20, 25, 26];
  const getCurrentTime = () => times.shift()!;

  it("should be tracked correctly", () => {
    // the numbers in the comments below indicate the value returned by
    // `getCurrentTime` at that point
    const metrics = new Metrics(3, getCurrentTime);

    assert.equal(metrics.sum("foo"), undefined);

    metrics.record("foo", 5); // 1
    metrics.record("bar", 10); // 4
    metrics.record("foo", 20); // 5

    assert.equal(metrics.sum("foo"), 25);
    metrics.prune(); // 6
    assert.equal(metrics.sum("foo"), 20);
    assert.equal(metrics.sum("bar"), 10);
    metrics.prune(); // 20
    assert.equal(metrics.sum("foo"), 0);
    assert.equal(metrics.sum("bar"), 0);
    metrics.record("baz", 10999); // 20
    metrics.record("baz", 2); // 20
    assert.equal(metrics.sum("baz"), 11001);
    metrics.record("foo", 3); // 25
    assert.equal(metrics.sum("foo"), 3);
    metrics.prune(); // 26
    assert.equal(metrics.sum("baz"), 0);
    assert.equal(metrics.sum("foo"), 3);
  });
});
