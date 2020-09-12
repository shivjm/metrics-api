// A simplistic variation on a linked list. Does not handle the same node being
// part of multiple lists.
export interface IList {
  head?: IMetricNode;
  tail?: IMetricNode;
}

export interface IMetricNode {
  // The value stored at this node.
  readonly value: number;

  // The timestamp for this value.
  readonly timestamp: number;

  // The next node.
  next?: IMetricNode;
}

export function append(list: IList, node: IMetricNode) {
  if (list.head === undefined) {
    list.head = node;
  }

  if (list.tail !== undefined) {
    const existing = list.tail;
    existing.next = node;
  }

  let tail = node;

  while (tail.next !== undefined) {
    tail = tail.next;
  }

  list.tail = tail;
}

export function dropWhile(
  list: IList,
  filter: (node: IMetricNode) => boolean
): IList {
  if (list.head === undefined) {
    return list;
  }

  let current = list.head;

  while (filter(current)) {
    const { next } = current;
    if (next === undefined) {
      return {};
    }

    current = next;
  }

  return { head: current, tail: list.tail };
}
