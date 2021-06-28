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

export type NumericInterval = {
  min: number;
  max: number;
};

export type NumericRange = NumericInterval & {
  step: number;
};

export type GaussianDist = {
  mean: number;
  stddev: number;
};

/**
 * Return numbers within the given range, inclusive.
 */
export function inclusiveRange({ min, max, step }: NumericRange): number[] {
  const result: number[] = [];

  for (let i = min; i <= max; i += step) {
    result.push(i);
  }

  return result;
}

/**
 * Clamp a number between min and max
 */
export function clamp(x: number, min: number, max: number) {
  return Math.max(min, Math.min(x, max));
}

/**
 * Return an array containing the numbers from 0 to one
 * less than the given value, increasing.
 */
export function range(count: number): number[] {
  return inclusiveRange({ min: 0, max: count - 1, step: 1 });
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

/** Returns whether the given number is even (as opposed to odd). */
export function isEvenNumber(value: number) {
  return value % 2 === 0;
}

/**
 * Convert the given number of seconds (float) to milliseconds (integer).
 */
export function secsToMsecs(secs: number): number {
  return Math.floor(secs * 1000);
}

/**
 * Returns the given number to a "friendly-looking" human
 * representation that is not ridiculously long.  For example,
 * it will return "1.85" instead of "1.850000000143".
 */
export function toFriendlyDecimal(value: number, maxDecimalDigits = 2): string {
  const str = value.toString();
  const fixedStr = value.toFixed(maxDecimalDigits);

  return str.length < fixedStr.length ? str : fixedStr;
}

/**
 * Given an array consisting of a nullable type, filter out all the nulls.
 */
export function withoutNulls<T>(arr: (T | null)[]): T[] {
  const result: T[] = [];

  for (let item of arr) {
    if (item !== null) {
      result.push(item);
    }
  }

  return result;
}
