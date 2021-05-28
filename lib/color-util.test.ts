import { clampedBytesToRGBColor, clampedByteToHex } from "./color-util";

describe("clampedBytesToRGBColor", () => {
  it("works", () => {
    expect(clampedBytesToRGBColor([999, 5, 171])).toBe("#ff05ab");
  });
});

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
