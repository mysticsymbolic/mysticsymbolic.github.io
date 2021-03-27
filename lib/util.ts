export function float(value: string | number | undefined): number {
  if (typeof value === "number") return value;
  if (value === undefined) value = "";

  const float = parseFloat(value);

  if (isNaN(float)) {
    throw new Error(`Expected '${value}' to be a float!`);
  }

  return float;
}

export function flatten<T>(arr: T[][]): T[] {
  const result: T[] = [];

  for (let subarr of arr) {
    result.push(...subarr);
  }

  return result;
}

/**
 * Convert radians to degrees.
 */
export function rad2deg(radians: number): number {
  return (radians * 180) / Math.PI;
}

/**
 * Return an array containing the numbers from 0 to one
 * less than the given value, increasing.
 */
export function range(count: number): number[] {
  const result: number[] = [];
  for (let i = 0; i < count; i++) {
    result.push(i);
  }

  return result;
}

/**
 * Slugify the given string.
 *
 * Taken from: https://gist.github.com/mathewbyrne/1280286
 */
export function slugify(text: string) {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/[^\w\-]+/g, "") // Remove all non-word chars
    .replace(/\-\-+/g, "-") // Replace multiple - with single -
    .replace(/^-+/, "") // Trim - from start of text
    .replace(/-+$/, ""); // Trim - from end of text
}
