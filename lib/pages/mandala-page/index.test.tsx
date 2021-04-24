import {
  ColorPacker,
  serializeMandalaDesign,
  deserializeMandalaDesign,
} from "./";
import { MANDALA_DESIGN_DEFAULTS } from "./core";

describe("AvroColorConverter", () => {
  it("converts strings to numbers", () => {
    expect(ColorPacker.pack("#abcdef")).toEqual(0xabcdef);
  });

  it("converts numbers to strings", () => {
    expect(ColorPacker.unpack(0xabcdef)).toEqual("#abcdef");
  });
});

test("Mandala design serialization/desrialization works", () => {
  const s = serializeMandalaDesign(MANDALA_DESIGN_DEFAULTS);
  expect(deserializeMandalaDesign(s)).toEqual(MANDALA_DESIGN_DEFAULTS);
});
