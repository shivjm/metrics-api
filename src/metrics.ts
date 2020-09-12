import { append, skipWhile, IMetricNode, reduce } from "./list";

export class Metrics {
  private readonly store: Map<string, IMetricNode | undefined> = new Map();

  constructor(
    public readonly maxAgeInSeconds: number,
    private readonly getCurrentTime: () => number
  ) {
    // nothing to do
  }

  prune() {
    const now = this.getCurrentTime();

    let deleted = 0;

    for (const [key, node] of this.store.entries()) {
      if (node === undefined) {
        continue;
      }

      const initialCount = reduce(node, (acc, _curr) => acc + 1, 0);
      const newHeadNode = skipWhile(
        node,
        (node) => now - node.timestamp > this.maxAgeInSeconds
      );
      this.store.set(key, newHeadNode);
      const newCount =
        newHeadNode === undefined
          ? 0
          : reduce(newHeadNode, (acc, _curr) => acc + 1, 0);

      deleted += initialCount - newCount;
    }

    return deleted;
  }

  record(key: string, value: number) {
    const node = { value, timestamp: this.getCurrentTime() };

    const existing = this.store.get(key);
    if (existing === undefined) {
      this.store.set(key, node);
    } else {
      append(existing, node);
    }
  }

  sum(key: string): number | undefined {
    if (!this.store.has(key)) {
      return undefined;
    }

    const node = this.store.get(key);

    if (node === undefined) {
      return 0;
    }

    return reduce(node, (acc, curr) => acc + curr, 0);
  }
}
