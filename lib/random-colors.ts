import { Random } from "./random";
import { range, clamp } from "./util";
import * as colorspaces from "colorspaces";
import { ColorTuple, hsluvToHex } from "hsluv";

export interface PaletteAlgorithmConfig {
  valueMin?: number,
  valueMax?: number,
  hue?: number,
  hueInterval?: number
  saturation?: number
}

type RandomPaletteGenerator = (numEntries: number, rng: Random, config: PaletteAlgorithmConfig) => string[];
// type ColorFunction = (rng: Random) => string[];
// type ColorFunctionConfig = () => string[];


export type RandomPaletteAlgorithm = "RGB" | "CIELUV" | "threevals";
//  | "randgrey"
//  | "threev15"
//  | "threev30"
//  | "threev45"
//  | "threev60"
//  | "threev75"
//  | "threev90";

export const DEFAULT_RANDOM_PALETTE_ALGORITHM: RandomPaletteAlgorithm =
  "threevals";

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

/*
function createRandGrey(rng: Random): string[] {
  let L1 = rng.inInterval({ min: 0, max: 100 });
  let L2 = rng.inInterval({ min: 0, max: 100 });
  let L3 = rng.inInterval({ min: 0, max: 100 });

  let Ls = [L1, L2, L3];

  let h = 0;
  let Hs = [h, h, h];

  let S = 0;
  let Ss = [S, S, S];

  //zip
  let hsls = Ls.map((k, i) => [Hs[i], Ss[i], k]);
  let hexcolors = hsls.map((x) => hsluvToHex(x as ColorTuple));

  //scramble order
  hexcolors = rng.uniqueChoices(hexcolors, hexcolors.length);
  return hexcolors;
}
*/

function create3Vconfig() {
  return (rng: Random, config: PaletteAlgorithmConfig): string[] => {
    const LMin = config.valueMin ? config.valueMin : 25;
    const LMax = config.valueMax? config.valueMax: 75;
    let Ls = [LMin, 50, LMax];

    //Now we have 3 lightness values, pick a random hue and sat
    let h1 = config.hue ? config.hue : rng.inInterval({ min: 0, max: 360 }),
      h2 = 360 * (((h1 + (config.hueInterval ? config.hueInterval : 120)) / 360) % 1),
      h3 = 360 * (((h2 + (config.hueInterval ? config.hueInterval : 240)) / 360) % 1);

    let Hs = [h1, h2, h3];

    const sat = config.saturation ? config.saturation : rng.fromGaussian({ mean: 100, stddev: 40 });
    let Ss = [ sat, sat, sat ];
    Ss = Ss.map((x) => clamp(x, 0, 100));

    //zip
    let hsls = Ls.map((k, i) => [Hs[i], Ss[i], k]);
    let hexcolors = hsls.map((x) => hsluvToHex(x as ColorTuple));

    //scramble order
    hexcolors = rng.uniqueChoices(hexcolors, hexcolors.length);
    return hexcolors;
  };
}

// function threeVColor(rng: Random): string[] {
//   let L1 = rng.inInterval({ min: 10, max: 25 });
//   let L2 = rng.inInterval({ min: L1 + 25, max: 60 });
//   let L3 = rng.inInterval({ min: L2 + 25, max: 85 });
//
//   let Ls = [L1, L2, L3];
//
//   let angleI = rng.inInterval({ min: 0, max: 120 });
//
//   //Now we have 3 lightness values, pick a random hue and sat
//   let h1 = rng.inInterval({ min: 0, max: 360 }),
//     h2 = h1 + angleI,
//     h3 = 360 * ((((h1 + h2) / 2 + 180) / 360) % 1);
//
//   h2 = 360 * ((h2 / 360) % 1);
//
//   let Hs = [h1, h2, h3];
//
//   let Ss = [
//     rng.fromGaussian({ mean: 100, stddev: 40 }),
//     rng.fromGaussian({ mean: 100, stddev: 40 }),
//     rng.fromGaussian({ mean: 100, stddev: 40 }),
//   ];
//   Ss = Ss.map((x) => clamp(x, 0, 100));
//
//   //zip
//   let hsls = Ls.map((k, i) => [Hs[i], Ss[i], k]);
//   let hexcolors = hsls.map((x) => hsluvToHex(x as ColorTuple));
//
//   //scramble order
//   hexcolors = rng.uniqueChoices(hexcolors, hexcolors.length);
//   return hexcolors;
// }

/*
function threeVColor(rng: Random): string[] {
  let lowL_Mean = 20.0,
    medL_Mean = 40.0,
    hiL_Mean = 70,
    lowL_SD = 30.0,
    medL_SD = lowL_SD,
    hiL_SD = lowL_SD;

  let Ls = [
    rng.fromGaussian({ mean: lowL_Mean, stddev: lowL_SD }),
    rng.fromGaussian({ mean: medL_Mean, stddev: medL_SD }),
    rng.fromGaussian({ mean: hiL_Mean, stddev: hiL_SD }),
  ];

  Ls = Ls.map((x) => clamp(x, 0, 100));

  //Now we have 3 lightness values, pick a random hue and sat

  let h1 = rng.inInterval({ min: 0, max: 360 }),
    h2 = 360 * (((h1 + 60 * Number(rng.bool(0.5))) / 360) % 1),
    h3 = 360 * (((h1 + 180 * Number(rng.bool(0.5))) / 360) % 1);

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
*/

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
  createTriad: (rng: Random, config: PaletteAlgorithmConfig) => string[]
): RandomPaletteGenerator {
  return (numEntries: number, rng: Random, config?): string[] => {
    let colors: string[] = [];
    let n = Math.floor(numEntries / 3) + 1;

    if (numEntries == 3) {
      colors = colors.concat(createTriad(rng, config));
    } else {
      for (let i = 0; i < n; i++) colors = colors.concat(createTriad(rng, config));
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
  threevals: createTriadPaletteGenerator(create3Vconfig()),
  // threevals: createTriadPaletteGenerator(threeVColor),
  //randgrey: createTriadPaletteGenerator(createRandGrey),
  //threev15: createTriadPaletteGenerator(create3V180(15)),
  //threev30: createTriadPaletteGenerator(create3V180(15)),
  //threev45: createTriadPaletteGenerator(create3V180(45)),
  //threev60: createTriadPaletteGenerator(create3V180(60)),
  //threev75: createTriadPaletteGenerator(create3V180(75)),
  //threev90: createTriadPaletteGenerator(create3V180(90)),
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
  algorithm: RandomPaletteAlgorithm = DEFAULT_RANDOM_PALETTE_ALGORITHM,
  config: PaletteAlgorithmConfig = {},
): string[] {
  return PALETTE_GENERATORS[algorithm](numEntries, rng, config);
}
