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
   * Return a random item from the given array.
   */
  choice<T>(array: T[]): T {
    const idx = Math.floor(this.next() * array.length);
    return array[idx];
  }
}
