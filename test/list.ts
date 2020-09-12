import "mocha";
import { assert } from "chai";

import { append, IMetricNode, reduce, skipWhile } from "../src/list";

describe("A linked list", () => {
  it("can have items appended to it", () => {
    const node1: IMetricNode = { value: 5, timestamp: 0 };

    const node2: IMetricNode = { value: 20, timestamp: 800 };
    append(node1, { ...node2 });
    assert.deepEqual(node1, { ...node1, next: node2 });

    const node3: IMetricNode = { value: 0, timestamp: 801 };
    const node4 = { value: 15, timestamp: 802 };
    node3.next = node4;
    append(node1, { ...node3 });

    assert.deepEqual(node1, {
      ...node1,
      next: { ...node2, next: { ...node3 } },
    });
  });

  it("can drop filtered items", () => {
    const node1: IMetricNode = { value: 50, timestamp: 1 };
    const node2: IMetricNode = { value: 800, timestamp: 5 };
    const node3: IMetricNode = { value: 20, timestamp: 8 };
    const node4: IMetricNode = { value: 90, timestamp: 8 };

    node1.next = node2;
    node2.next = node3;
    node3.next = node4;

    assert.deepEqual(
      skipWhile(node1, ({ timestamp }) => timestamp < 5),
      node2
    );

    assert.deepEqual(
      skipWhile(node1, () => true),
      undefined
    );
  });

  it("can be traversed", () => {
    const node1: IMetricNode = { value: 50, timestamp: 1 };
    const node2: IMetricNode = { value: 800, timestamp: 5 };
    const node3: IMetricNode = { value: 20, timestamp: 8 };
    const node4: IMetricNode = { value: 90, timestamp: 8 };

    node1.next = node2;
    node2.next = node3;
    node3.next = node4;

    assert.equal(
      reduce(node1, (acc, curr) => acc + curr, 0),
      960
    );
  });
});
