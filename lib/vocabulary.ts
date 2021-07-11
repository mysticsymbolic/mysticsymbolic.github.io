export type VocabularyType = {
  name: string;
};

export class Vocabulary<T extends VocabularyType> {
  readonly itemMap: Map<string, T>;
  private _distribution: T[] | null = null;

  constructor(
    readonly items: T[],
    private readonly getFrequencyMultiplier: (item: T) => number = () => 1
  ) {
    this.itemMap = new Map(items.map((item) => [item.name, item]));
  }

  get distribution(): T[] {
    if (!this._distribution) {
      this._distribution = this.getFilteredDistribution(() => true);
    }
    return this._distribution;
  }

  get(name: string): T {
    const item = this.itemMap.get(name);
    if (!item) {
      throw new Error(`Unable to find the item "${name}"!`);
    }
    return item;
  }

  getFilteredDistribution(predicate?: (item: T) => boolean): T[] {
    const result: T[] = [];

    for (let item of this.items) {
      if (predicate && !predicate(item)) continue;
      const freq = this.getFrequencyMultiplier(item);
      for (let i = 0; i < freq; i++) {
        result.push(item);
      }
    }

    return result;
  }
}
