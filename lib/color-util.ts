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
