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

  /**
   * Returns a probability distribution of the vocabulary's items.
   *
   * Each item may be repeated more than once in the return value,
   * making it more likely for the item to be randomly chosen.
   */
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

  /**
   * Filters the vocabulary by the given predicate, and
   * returns a probability distribution of the result.
   *
   * @see Vocabulary.distribution
   */
  getFilteredDistribution(predicate: (item: T) => boolean): T[] {
    const result: T[] = [];

    for (let item of this.items) {
      if (!predicate(item)) continue;
      const freq = this.getFrequencyMultiplier(item);
      for (let i = 0; i < freq; i++) {
        result.push(item);
      }
    }

    return result;
  }
}
