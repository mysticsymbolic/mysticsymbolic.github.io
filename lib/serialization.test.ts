import { ColorPacker } from "./serialization";

describe("ColorPacker", () => {
  it("converts strings to numbers", () => {
    expect(ColorPacker.pack("#abcdef")).toEqual(0xabcdef);
  });

  it("converts numbers to strings", () => {
    expect(ColorPacker.unpack(0xabcdef)).toEqual("#abcdef");
  });
});
