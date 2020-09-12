// A simplistic variation on a linked list. Does not handle the same node being
// part of multiple lists.
export interface IMetricNode {
  // The value stored at this node.
  readonly value: number;

  // The timestamp for this value.
  readonly timestamp: number;

  // The next node.
  next?: IMetricNode;
}

// Adds `node` to the end of the linked list represented by `start` (mutating).
export function append(start: IMetricNode, node: IMetricNode) {
  let current = start;

  while (current.next !== undefined) {
    current = current.next;
  }

  current.next = node;
}

// Returns the sublist represented by the first node in the linked list
// represented by `start` for which `filter` returns a falsy value (not
// mutating, but returns the node from the list itself, not a copy).
export function skipWhile(
  start: IMetricNode,
  filter: (node: IMetricNode) => boolean
): IMetricNode | undefined {
  let current = start;

  while (filter(current)) {
    const { next } = current;
    if (next === undefined) {
      return;
    }

    current = next;
  }

  return current;
}

// Returns the result of applying `reducer` to every node in the linked list
// represented by `start`. `initialValue` is the value to pass for `acc` in the
// first iteration.
export function reduce<T>(
  start: IMetricNode,
  reducer: (acc: T, curr: number) => T,
  initialValue: T
): T {
  let current: IMetricNode | undefined = start;
  let acc = initialValue;

  while (current !== undefined) {
    acc = reducer(acc, current.value);

    current = current.next;
  }

  return acc;
}
