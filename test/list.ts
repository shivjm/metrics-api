import "mocha";
import { assert } from "chai";

import { append, dropWhile, IList, IMetricNode } from "../src/list";

describe("A linked list", () => {
  it("can be created", () => {
    const _list: IList = {};

    const tail = { value: 1, timestamp: 5 };
    const _list2: IList = {
      head: { value: 2, timestamp: 3, next: tail },
      tail,
    };
  });

  it("can have items appended to it", () => {
    const list: IList = {};

    const node1 = { value: 5, timestamp: 0 };
    append(list, { ...node1 });

    assert.deepEqual(list.head, node1);
    assert.deepEqual(list.tail, node1);

    const node2 = { value: 20, timestamp: 800 };
    append(list, { ...node2 });
    assert.deepEqual(list.head, { ...node1, next: node2 });
    assert.deepEqual(list.tail, node2);

    const node3: IMetricNode = { value: 0, timestamp: 801 };
    const node4 = { value: 15, timestamp: 802 };
    node3.next = node4;
    append(list, { ...node3 });

    assert.deepEqual(list.head, {
      ...node1,
      next: { ...node2, next: { ...node3 } },
    });
    assert.deepEqual(list.tail, node4);
  });

  it("can drop filtered items", () => {
    const node1: IMetricNode = { value: 50, timestamp: 1 };
    const node2: IMetricNode = { value: 800, timestamp: 5 };
    const node3: IMetricNode = { value: 20, timestamp: 8 };
    const node4: IMetricNode = { value: 90, timestamp: 8 };

    node1.next = node2;
    node2.next = node3;
    node3.next = node4;

    const list1: IList = { head: node1, tail: node4 };

    const list2: IList = { ...list1 };

    assert.deepEqual(
      dropWhile(list2, ({ timestamp }) => timestamp < 5),
      { head: { ...node2 }, tail: node4 }
    );
  });
});
