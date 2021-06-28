import {
  createRandomColorPalette,
  RANDOM_PALETTE_ALGORITHMS,
} from "./random-colors";

describe("createRandomColorPalette()", () => {
  for (let alg of RANDOM_PALETTE_ALGORITHMS) {
    it(`works using the '${alg}' algorithm`, () => {
      const palette = createRandomColorPalette(3, undefined, alg);
      expect(palette).toHaveLength(3);
      for (let color of palette) {
        expect(color).toMatch(/^\#[0-9a-f]{6}$/);
      }
    });
  }
});
