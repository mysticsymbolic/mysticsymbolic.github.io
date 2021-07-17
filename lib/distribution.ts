/**
 * Return a probability distribution of the given Array.
 *
 * Each item may be repeated more than once in the return value,
 * making it more likely for the item to be randomly chosen.
 *
 * @param items The list of items to create a distribution from.
 *
 * @param getFrequencyMultiplier A function that takes an item
 *   and returns a positive integer specifying how many times
 *   it should be included in the distribution.
 */
export function createDistribution<T>(
  items: T[],
  getFrequencyMultiplier: (item: T) => number
) {
  const result: T[] = [];

  for (let item of items) {
    const freq = getFrequencyMultiplier(item);
    for (let i = 0; i < freq; i++) {
      result.push(item);
    }
  }

  return result;
}
