import { Random } from "./random";
import { range, clamp } from "./util";
import * as colorspaces from "colorspaces";
import { ColorTuple, hsluvToHex } from "hsluv";

type RandomPaletteGenerator = (numEntries: number, rng: Random) => string[];

export type RandomPaletteAlgorithm =
  | "RGB"
  | "CIELUV"
  | "threevals"
  | "huecontrast"
  | "randgrey"
  | "3v15"
  | "3v30"
  | "3v45"
  | "3v60"
  | "3v75"
  | "3v90";

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

function create3HColor(rng: Random): string[] {
  let L = rng.fromGaussian({ mean: 50, stddev: 20 });

  let Ls = [L, L, L];

  Ls = Ls.map((x) => clamp(x, 0, 100));

  let h1 = rng.inInterval({ min: 0, max: 360 }),
    h2 = 360 * (((h1 + 120) / 360) % 1),
    h3 = 360 * (((h1 + 240) / 360) % 1);

  let Hs = [h1, h2, h3];

  let S = 100;
  let Ss = [S, S, S];

  Ss = Ss.map((x) => clamp(x, 0, 100));

  //zip
  let hsls = Ls.map((k, i) => [Hs[i], Ss[i], k]);
  let hexcolors = hsls.map((x) => hsluvToHex(x as ColorTuple));

  //scramble order
  hexcolors = rng.uniqueChoices(hexcolors, hexcolors.length);
  return hexcolors;
}

function create3V180(angle1:number):
number => string[] {
  return (rng: Random): string[] => {
    let Ls = [25,50,75];

    //Now we have 3 lightness values, pick a random hue and sat
    let h1 = rng.inInterval({ min: 0, max: 360 }),
    h2 = 360 * (((h1+angle1) / 360) % 1),
    h3 = 360 * (((180-h2) / 360) % 1);
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
}

function create3VColorSimple(rng: Random): string[] {
  let lowL_Mean = 25.0,
    medL_Mean = 50.0,
    hiL_Mean = 75,
    lowL_SD = 0,
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
  h2 = 360 * ((h1 + 30)/360 % 1),
  h3 = 360 * ((h1 + 195)/360 % 1);

  let Hs = [h1, h2, h3];

  let Ss = [
    rng.fromGaussian({ mean: 70, stddev: 60 }),
    rng.fromGaussian({ mean: 70, stddev: 60 }),
    rng.fromGaussian({ mean: 70, stddev: 60 }),
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
  threevals: createTriadPaletteGenerator(create3VColor),
  simple3v: createTriadPaletteGenerator(create3VColorSimple),
  huecontrast: createTriadPaletteGenerator(create3HColor),
  randgrey: createTriadPaletteGenerator(createRandGrey),
  3v15: createTriadPaletteGenerator(factory3V180(15)),
  3v30: createTriadPaletteGenerator(factory3V180(15)),
  3v45: createTriadPaletteGenerator(factory3V180(45)),
  3v60: createTriadPaletteGenerator(factory3V180(60)),
  3v75: createTriadPaletteGenerator(factory3V180(75)),
  3v90: createTriadPaletteGenerator(factory3V180(90))
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
