import { Random } from "./random";
import { range, clamp } from "./util";
import * as colorspaces from "colorspaces";
import { ColorTuple, luvToLch, lchToHsluv, hsluvToHex } from "hsluv";
import { clampedBytesToRGBColor } from "./color-util";
import { getUVSliceGeometery, maxSafeChromaForL, maxChromaForLH } from "./chromatools";

type RandomPaletteGenerator = (numEntries: number, rng: Random) => string[];
//type ColorFunction = (rng: Random) => string[];

export type RandomPaletteAlgorithm =
  | "RGB"
  | "CIELUV"
  | "threevals"
  | "randhue"
  | "randLAlmostNeutralC"
  | "randLMinSafeC"
  | "randLMaxSafeC"
  | "midLMinSafeC"
  | "midLMaxC"
  | "chromaContrast"
  | "hiChroma";

export const DEFAULT_RANDOM_PALETTE_ALGORITHM: RandomPaletteAlgorithm =
  "hiChroma";

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
  let L1 = rng.inInterval({ min: 10, max: 25 }),
    L2 = rng.inInterval({ min: L1 + 25, max: 60 }),
    L3 = rng.inInterval({ min: L2 + 25, max: 85 });

  let Ls = [L1, L2, L3];

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

function clampHue(h: number): number {
  let hn = (h / 360) % 1;
  if (hn < 0.0) {
    hn = 1.0 - hn;
  }
  hn = 360 * hn;
  return hn;
}

function getMixedRGBs(hsluvs: ColorTuple[],rng: Random): ColorTuple[] {
  hsluvs = rng.uniqueChoices(hsluvs, hsluvs.length);
  let hexcolors = hsluvs.map((x) => hsluvToHex(x as ColorTuple));
  return hexcolors;
}

function randLAlmostNeutralC(rng: Random): string[] {
  let L = rng.inInterval({ min: 10, max: 90 });
  let hsluvs: ColorTuple[] = [];
  let C = maxSafeChromaForL(L) * 0.2;
  let h = rng.inInterval({min: 0, max: 360});
 
  for (let i = 0; i < 3; i++) {
    let lch = [L,C,clampHue(h+i*120)];
    let hsluv = lchToHsluv(lch);
    hsluvs.push(hsluv);
  }

  return getMixedRGBs(hsluvs,rng);
}


function randLMinSafeC(rng: Random): string[] {
  let L = rng.inInterval({ min: 10, max: 90 });
  let hsluvs: ColorTuple[] = [];
  let C = maxSafeChromaForL(L);
  let h = rng.inInterval({min: 0, max: 360});
 
  for (let i = 0; i < 3; i++) {
    let lch = [L,C,clampHue(h+i*120)];
    let hsluv = lchToHsluv(lch);
    hsluvs.push(hsluv);
  }

  return getMixedRGBs(hsluvs,rng);
}

function randLMaxSafeC(rng: Random): string[] {
  let L = rng.inInterval({ min: 10, max: 90 });
  let hs: number[] = [];
  let Cs: number[] = [];
  let hsluvs: ColorTuple[] = [];
  let h = rng.inInterval({min: 0, max: 360});

  for (let i = 0; i < 3; i++) {
    let h_i = clampHue(h+i*120)
    hs.push(h_i);
    Cs.push(maxChromaForLH(L, h_i));
  }

  let C =  Math.min( ...Cs );
    
  for (let i = 0; i < 3; i++) {                                 
    let lch = [L,C,hs[i]];
    let hsluv = lchToHsluv(lch);
    hsluvs.push(hsluv);
  }

  return getMixedRGBs(hsluvs,rng);
}

function hiChroma(rng: Random): string[] {
  let L1 = rng.inInterval({ min: 0, max: 25 });
  let L2 = rng.inInterval({ min: L1 + 25, max: 60 });
  let L3 = rng.inInterval({ min: L2 + 25, max: 100 });

  let Ls = [L1, L2, L3];

  let hsluvs: ColorTuple[] = [];

  for (let i = 0; i < Ls.length; i++) {
    let uvSlice = getUVSliceGeometery(Ls[i]);
    let uvVert = rng.uniqueChoices(uvSlice.verticies, 1)[0];
    let lch = luvToLch([Ls[i], uvVert.x, uvVert.y]);
    let hsluv = lchToHsluv(lch);

    //jitter hue
    hsluv[0] = clampHue(hsluv[0] + rng.fromGaussian({ mean: 0, stddev: 10 }));
    hsluvs.push(hsluv);
  }

  return getMixedRGBs(hsluvs,rng);
}

function midLMinSafeC(rng: Random): string[] {
  let L = 50;
  let hsluvs: ColorTuple[] = [];
  let C = maxSafeChromaForL(L);
 
  for (let i = 0; i < 3; i++) {
    let lch = [L,C,rng.inInterval({min: 0, max: 360})];
    let hsluv = lchToHsluv(lch);
    hsluvs.push(hsluv);
  }

  return getMixedRGBs(hsluvs,rng);
}


function midLMaxC(rng: Random): string[] {
  let L = 50;
  let hs: number[] = [];
  let hsluvs: ColorTuple[] = [];
  //let h = rng.inInterval({min: 0, max: 360});

  for (let i = 0; i < 3; i++) {
    let hsluv = [rng.inInterval({min: 0, max: 360}) ,100,L];
    hsluvs.push(hsluv);
  }

  return getMixedRGBs(hsluvs,rng);
}


function chromaContrast(rng: Random): string[] {
  let L = rng.inInterval({ min: 10, max: 90 });
  let h = rng.inInterval({min: 0, max: 360});
  let Ss = [20,60,100];
  let hsluvs: ColorTuple[] = [];
  
  for (let i = 0; i < 3; i++) {
    let hsluv = [h,Ss[i],L];
    hsluvs.push(hsluv);
  }

  return getMixedRGBs(hsluvs,rng);
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
  randhue: createTriadPaletteGenerator(randHue),
  randLAlmostNeutralC: createTriadPaletteGenerator(randLAlmostNeutralC),
  randLMinSafeC: createTriadPaletteGenerator(randLMinSafeC),
  randLMaxSafeC: createTriadPaletteGenerator(randLMaxSafeC),
  midLMinSafeC: createTriadPaletteGenerator(midLMinSafeC),
  midLMaxC: createTriadPaletteGenerator(midLMaxC),
  chromaContrast: createTriadPaletteGenerator(chromaContrast),
  hiChroma: createTriadPaletteGenerator(hiChroma)
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
