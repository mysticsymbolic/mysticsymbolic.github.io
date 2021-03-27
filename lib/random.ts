import { inclusiveRange, NumericRange } from "./util";

export type RandomParameters = {
  modulus: number;
  multiplier: number;
  increment: number;
};

const NUMERICAL_RECIPES_PARAMETERS: RandomParameters = {
  modulus: Math.pow(2, 32),
  multiplier: 1664525,
  increment: 1013904223,
};

/**
 * A simple linear congruential random number generator, as described in
 * https://en.wikipedia.org/wiki/Linear_congruential_generator.
 */
export class Random {
  private latestSeed: number;

  constructor(
    readonly seed: number = Date.now(),
    readonly params: RandomParameters = NUMERICAL_RECIPES_PARAMETERS
  ) {
    this.latestSeed = seed;
  }

  /**
   * Create an exact replica of this instance.
   */
  clone(): Random {
    return new Random(this.latestSeed, this.params);
  }

  /**
   * Return a random number that is greater than or equal to zero, and less
   * than one.
   */
  next(): number {
    this.latestSeed =
      (this.params.multiplier * this.latestSeed + this.params.increment) %
      this.params.modulus;
    return this.latestSeed / this.params.modulus;
  }

  /**
   * Return a random boolean with the given probability of being true.
   */
  bool(trueProbability: number = 0.5): boolean {
    return this.next() < trueProbability;
  }

  /**
   * Return a number in the given range, inclusive.
   */
  inRange(range: NumericRange): number {
    return this.choice(inclusiveRange(range));
  }

  /**
   * Return a random item from the given array. If the array is
   * empty, an exception is thrown.
   */
  choice<T>(array: T[]): T {
    if (array.length === 0) {
      throw new Error("Cannot choose randomly from an empty array!");
    }
    const idx = Math.floor(this.next() * array.length);
    return array[idx];
  }

  /**
   * Attempt to randomly choose *at most* the given number of unique items from
   * the array. If the array is too small, fewer items are returned.
   */
  uniqueChoices<T>(array: T[], howMany: number): T[] {
    let choicesLeft = [...array];
    const result: T[] = [];

    for (let i = 0; i < howMany; i++) {
      if (choicesLeft.length === 0) {
        break;
      }
      const choice = this.choice(choicesLeft);
      choicesLeft = choicesLeft.filter((item) => item !== choice);
      result.push(choice);
    }

    return result;
  }
}
