import { Random } from "./random";
import { range } from "./util";
import * as colorspaces from 'colorspaces';

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

function createRandomColor(rng: Random): string {
    const max_luv_samples = 100;
    let luv_sample_failed = true;
    let rand_color_hex:string = "#000000";

    //See if we can pull out a sample inside the LUV solid
    for (let i=0; i<max_luv_samples; i++) {
	let L = rng.inRange({ min: 0, max: 100, step: 1 });
	let u = rng.inRange({ min: -128, max: 128, step: 1 });
	let v = rng.inRange({ min: -128, max: 128, step: 1 });
	let rand_color = colorspaces.make_color('CIELUV', [L, u, v]);
	
	if(rand_color.is_displayable()) {
	    rand_color_hex = rand_color.as('hex');
	    luv_sample_failed = false;
	    break;
	}
    }

    //just sample sRGB if I couldn't sample a random LUV color
    if(luv_sample_failed) {
	console.log("Sampling sRGB")
	let rgb = (new Array<number>(3)).map(() => rng.inRange({ min: 0, max: 255, step: 1 }));
	console.log(rgb)
	for(let i=0; i<rgb.length; i++) {
	    rgb[i] = rgb[i]/255.0;
	}
	console.log(rgb)
	let rand_color = colorspaces.make_color('sRGB',rgb);
	rand_color_hex = rand_color.as('hex');
    }

    return rand_color_hex;
}

/**
 * Create a random color palette with the given number of
 * entries, optionally using the given random number generator.
 *
 * The return value is an Array of strings, where each string is
 * a color hex hash (e.g. `#ff0000`).
 */
export function createRandomColorPalette(
  numEntries: number,
  rng: Random = new Random()
): string[] {
  return range(numEntries).map(() => createRandomColor(rng));
}
