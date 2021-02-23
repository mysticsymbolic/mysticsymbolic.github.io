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
