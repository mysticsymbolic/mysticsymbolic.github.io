import {
  ColorPacker,
  serializeMandalaDesign,
  deserializeMandalaDesign,
} from "./serialization";
import { MANDALA_DESIGN_DEFAULTS } from "./core";

describe("AvroColorConverter", () => {
  it("converts strings to numbers", () => {
    expect(ColorPacker.pack("#abcdef")).toEqual(0xabcdef);
  });

  it("converts numbers to strings", () => {
    expect(ColorPacker.unpack(0xabcdef)).toEqual("#abcdef");
  });
});

describe("Mandala design serialization/desrialization", () => {
  // Helper to make it easy for us to copy/paste from URLs.
  const decodeAndDeserialize = (s: string) =>
    deserializeMandalaDesign(decodeURIComponent(s));

  it("deserializes from v1", () => {
    const design = decodeAndDeserialize(
      "AgZleWUAAB9DCAEAAIA%2FAAAAAAAAgD8AAAAAAADQlAKCjj3Ij%2F4PAACAPwAAQEABAA%3D%3D"
    );
    expect(design.baseCompCtx.disableGradients).toBe(false);
    expect(design.circle1.numSymbols).toBe(4);
  });

  it("works", () => {
    const s = serializeMandalaDesign(MANDALA_DESIGN_DEFAULTS);
    expect(deserializeMandalaDesign(s)).toEqual(MANDALA_DESIGN_DEFAULTS);
  });
});
