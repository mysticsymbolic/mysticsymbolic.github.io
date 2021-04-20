export type VocabularyType = {
  name: string;
};

export class Vocabulary<T extends VocabularyType> {
  readonly itemMap: Map<string, T>;

  constructor(readonly items: T[]) {
    this.itemMap = new Map(items.map((item) => [item.name, item]));
  }

  get(name: string): T {
    const item = this.itemMap.get(name);
    if (!item) {
      throw new Error(`Unable to find the item "${name}"!`);
    }
    return item;
  }
}
