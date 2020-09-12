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

// Adds `node` to the end of `list` by mutating `list` in place. Follows any
// links in `node`.
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

// Deletes contiguous nodes satisfying `filter` from the beginning of `list` by
// mutating it in place.
export function deleteWhile(
  list: IList,
  filter: (node: IMetricNode) => boolean
) {
  if (list.head === undefined) {
    return;
  }

  let current = list.head;

  while (filter(current)) {
    const { next } = current;
    if (next === undefined) {
      return {};
    }

    current = next;
  }

  list.head = current;
}

export function reduce<T>(
  list: IList,
  reducer: (acc: T, curr: number) => T,
  initialValue: T
): T {
  const { head } = list;

  let current = head;
  let acc = initialValue;

  while (current !== undefined) {
    acc = reducer(acc, current.value);

    current = current.next;
  }

  return acc;
}
