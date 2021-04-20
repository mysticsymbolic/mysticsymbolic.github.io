import { Random } from "./random";
import { range } from "./util";
import * as colorspaces from "colorspaces";

type RandomPaletteGenerator = (numEntries: number, rng: Random) => string[];

export type RandomPaletteAlgorithm = "RGB" | "CIELUV";

export const DEFAULT_RANDOM_PALETTE_ALGORITHM: RandomPaletteAlgorithm =
  "CIELUV";

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

function createRandomRGBColor(rng: Random): string {
  const rgb = range(3).map(() => rng.inRange({ min: 0, max: 255, step: 1 }));
  return "#" + rgb.map(clampedByteToHex).join("");
}

function createRandomCIELUVColor(rng: Random): string {
  const max_luv_samples = 100;
  let luv_sample_failed = true;
  let rand_color_hex: string = "#000000";

  //See if we can pull out a sample inside the LUV solid
  for (let i = 0; i < max_luv_samples; i++) {
    //bounds from https://docs.opencv.org/2.4/modules/imgproc/doc/miscellaneous_transformations.html#cvtcolor
    let L = rng.inInterval({ min: 0, max: 100 });
    let u = rng.inInterval({ min: -134, max: 220 });
    let v = rng.inInterval({ min: -140, max: 122 });
    let rand_color = colorspaces.make_color("CIELUV", [L, u, v]);

    //console.log(`L:${L},u${u},v${v}`);
    if (rand_color.is_displayable() && !(L == 0.0 && (u != 0 || v != 0))) {
      rand_color_hex = rand_color.as("hex");
      //console.log(rand_color_hex);
      luv_sample_failed = false;
      break;
    }
  }

  //just sample sRGB if I couldn't sample a random LUV color
  if (luv_sample_failed) {
    //console.log("Sampling sRGB");
    let rgb = [0, 0, 0].map(
      () => rng.inRange({ min: 0, max: 255, step: 1 }) / 255.0
    );
    //console.log(rgb);
    let rand_color = colorspaces.make_color("sRGB", rgb);
    rand_color_hex = rand_color.as("hex");
  }

  return rand_color_hex;
}

/**
 * Factory function to take a function that generates a random color
 * and return a palette generator that just calls it once for every
 * color in the palette.
 */
function createSimplePaletteGenerator(
  createColor: (rng: Random) => string
): RandomPaletteGenerator {
  return (numEntries: number, rng: Random) =>
    range(numEntries).map(() => createColor(rng));
}

const PALETTE_GENERATORS: {
  [key in RandomPaletteAlgorithm]: RandomPaletteGenerator;
} = {
  RGB: createSimplePaletteGenerator(createRandomRGBColor),
  CIELUV: createSimplePaletteGenerator(createRandomCIELUVColor),
};

export const RANDOM_PALETTE_ALGORITHMS = Object.keys(
  PALETTE_GENERATORS
) as RandomPaletteAlgorithm[];

/**
 * Create a random color palette with the given number of entries,
 * optionally using the given random number generator and the
 * given algorithm.
 *
 * The return value is an Array of strings, where each string is
 * a color hex hash (e.g. `#ff0000`).
 */
export function createRandomColorPalette(
  numEntries: number,
  rng: Random = new Random(),
  algorithm: RandomPaletteAlgorithm = DEFAULT_RANDOM_PALETTE_ALGORITHM
): string[] {
  return PALETTE_GENERATORS[algorithm](numEntries, rng);
}
