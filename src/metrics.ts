import { append, deleteWhile, IList, reduce } from "./list";

export class Metrics {
  private readonly store: Map<string, IList> = new Map();

  constructor(
    public readonly maxAgeInSeconds: number,
    private readonly getCurrentTime: () => number
  ) {
    // nothing to do
  }

  prune() {
    const now = this.getCurrentTime();

    for (const list of this.store.values()) {
      const { head } = list;

      if (head === undefined) {
        continue;
      }

      deleteWhile(list, (node) => now - node.timestamp > this.maxAgeInSeconds);
    }
  }

  record(key: string, value: number) {
    if (!this.store.has(key)) {
      this.store.set(key, {});
    }

    append(this.store.get(key)!, { value, timestamp: this.getCurrentTime() });
  }

  sum(key: string): number | undefined {
    const list = this.store.get(key);

    if (list === undefined) {
      return undefined;
    }

    return reduce(list, (acc, curr) => acc + curr, 0);
  }
}
