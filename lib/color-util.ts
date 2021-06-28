/**
 * Clamp the given number to be between 0 and 255, then
 * convert it to hexadecimal.
 */
export function clampedByteToHex(value: number): string {
  if (value < 0) {
    value = 0;
  } else if (value > 255) {
    value = 255;
  }
  let hex = value.toString(16);
  if (hex.length === 1) {
    hex = "0" + hex;
  }
  return hex;
}

/**
 * Convert the given array of numbers to an RGB hex value.
 */
export function clampedBytesToRGBColor(values: number[]): string {
  return "#" + values.map(clampedByteToHex).join("");
}

/**
 * Convert the given hex color string, e.g. `#abcdef`, to an
 * Array of RGB numbers.
 */
export function parseHexColor(value: string): [number, number, number] {
  const red = parseInt(value.substring(1, 3), 16);
  const green = parseInt(value.substring(3, 5), 16);
  const blue = parseInt(value.substring(5, 7), 16);
  return [red, green, blue];
}
