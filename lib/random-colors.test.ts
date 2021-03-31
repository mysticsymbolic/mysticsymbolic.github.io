import { clampedByteToHex, createRandomColorPalette } from "./random-colors";

describe("clampedByteToHex", () => {
  it("clamps values over 255 to 255", () => {
    expect(clampedByteToHex(500)).toBe("ff");
  });

  it("clamps values under 0 to 0", () => {
    expect(clampedByteToHex(-50)).toBe("00");
  });

  it("zero-pads values", () => {
    expect(clampedByteToHex(10)).toBe("0a");
  });

  it("works with numbers that don't need zero-padding", () => {
    expect(clampedByteToHex(22)).toBe("16");
  });
});

test("createRandomColorPalette() works", () => {
  const palette = createRandomColorPalette(3);
  expect(palette).toHaveLength(3);
  for (let color of palette) {
    expect(color).toMatch(/^\#[0-9a-f]{6}$/);
  }
});
