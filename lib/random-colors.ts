import { Random } from "./random";
import { range, clamp } from "./util";
import * as colorspaces from "colorspaces";
import { ColorTuple, hsluvToHex } from "hsluv";
import { clampedBytesToRGBColor } from "./color-util";

type RandomPaletteGenerator = (numEntries: number, rng: Random) => string[];
//type ColorFunction = (rng: Random) => string[];

export type RandomPaletteAlgorithm = "RGB" | "CIELUV" | "threevals" | "randhue";

export const DEFAULT_RANDOM_PALETTE_ALGORITHM: RandomPaletteAlgorithm =
  "threevals";

function createRandomRGBColor(rng: Random): string {
  const rgb = range(3).map(() => rng.inRange({ min: 0, max: 255, step: 1 }));
  return clampedBytesToRGBColor(rgb);
}

function createRandomCIELUVColor(rng: Random): string {
  const max_luv_samples = 100;
  let luvSampleFailed = true;
  let randColorHex: string = "#000000";

  //See if we can pull out a sample inside the LUV solid
  for (let i = 0; i < max_luv_samples; i++) {
    //bounds from https://docs.opencv.org/2.4/modules/imgproc/doc/miscellaneous_transformations.html#cvtcolor
    let L = rng.inInterval({ min: 0, max: 100 });
    let u = rng.inInterval({ min: -134, max: 220 });
    let v = rng.inInterval({ min: -140, max: 122 });
    let randColor = colorspaces.make_color("CIELUV", [L, u, v]);

    if (randColor.is_displayable() && !(L == 0.0 && (u != 0 || v != 0))) {
      randColorHex = randColor.as("hex");
      luvSampleFailed = false;
      break;
    }
  }

  //just sample sRGB if I couldn't sample a random LUV color
  if (luvSampleFailed) {
    let rgb = [0, 0, 0].map(
      () => rng.inRange({ min: 0, max: 255, step: 1 }) / 255.0
    );
    let randColor = colorspaces.make_color("sRGB", rgb);
    randColorHex = randColor.as("hex");
  }

  return randColorHex;
}

function threeVColor(rng: Random): string[] {
  let L1 = rng.inInterval({ min: 10, max: 25 });
  let L2 = rng.inInterval({ min: L1 + 25, max: 60 });
  let L3 = rng.inInterval({ min: L2 + 25, max: 85 });

  let Ls = [L1, L2, L3];

  let angleI = rng.inInterval({ min: 0, max: 120 });

  //Now we have 3 lightness values, pick a random hue and sat
  let h1 = rng.inInterval({ min: 0, max: 360 }),
    h2 = h1 + angleI,
    h3 = 360 * ((((h1 + h2) / 2 + 180) / 360) % 1);

  h2 = 360 * ((h2 / 360) % 1);

  let Hs = [h1, h2, h3];

  let Ss = [
    rng.fromGaussian({ mean: 100, stddev: 40 }),
    rng.fromGaussian({ mean: 100, stddev: 40 }),
    rng.fromGaussian({ mean: 100, stddev: 40 }),
  ];
  Ss = Ss.map((x) => clamp(x, 0, 100));

  //zip
  let hsls = Ls.map((k, i) => [Hs[i], Ss[i], k]);
  let hexcolors = hsls.map((x) => hsluvToHex(x as ColorTuple));

  //scramble order
  hexcolors = rng.uniqueChoices(hexcolors, hexcolors.length);
  return hexcolors;
}

function randHue(rng: Random): string[] {
  let L1 = rng.inInterval({ min: 10, max: 25 });
  let L2 = rng.inInterval({ min: L1 + 25, max: 60 });
  let L3 = rng.inInterval({ min: L2 + 25, max: 85 });

  let Ls = [L1, L2, L3];

  let angleI = rng.inInterval({ min: 0, max: 120 });

  //Now we have 3 lightness values, pick a random hue and sat
  let h1 = rng.inInterval({ min: 0, max: 360 }),
  h2 = rng.inInterval({ min: 0, max: 360 }),
  h3 = rng.inInterval({ min: 0, max: 360 });

  let Hs = [h1, h2, h3];

  let Ss = [
    rng.fromGaussian({ mean: 100, stddev: 40 }),
    rng.fromGaussian({ mean: 100, stddev: 40 }),
    rng.fromGaussian({ mean: 100, stddev: 40 }),
  ];
  Ss = Ss.map((x) => clamp(x, 0, 100));

  //zip
  let hsls = Ls.map((k, i) => [Hs[i], Ss[i], k]);
  let hexcolors = hsls.map((x) => hsluvToHex(x as ColorTuple));

  //scramble order
  hexcolors = rng.uniqueChoices(hexcolors, hexcolors.length);
  return hexcolors;
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

/**
 * Factory function to make a random palette generator for a triad generator
 */

function createTriadPaletteGenerator(
  createTriad: (rng: Random) => string[]
): RandomPaletteGenerator {
  return (numEntries: number, rng: Random): string[] => {
    let colors: string[] = [];
    let n = Math.floor(numEntries / 3) + 1;

    if (numEntries == 3) {
      colors = colors.concat(createTriad(rng));
    } else {
      for (let i = 0; i < n; i++) colors = colors.concat(createTriad(rng));
      colors = colors.slice(0, numEntries);
    }

    return colors;
  };
}

const PALETTE_GENERATORS: {
  [key in RandomPaletteAlgorithm]: RandomPaletteGenerator;
} = {
  RGB: createSimplePaletteGenerator(createRandomRGBColor),
  CIELUV: createSimplePaletteGenerator(createRandomCIELUVColor),
  threevals: createTriadPaletteGenerator(threeVColor),
  randHue: createTriadPaletteGenerator(randHue)
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
