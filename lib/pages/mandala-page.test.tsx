import {
  AvroColorConverter,
  serializeMandalaDesign,
  deserializeMandalaDesign,
  MANDALA_DESIGN_DEFAULTS,
} from "./mandala-page";

describe("AvroColorConverter", () => {
  it("converts strings to numbers", () => {
    expect(AvroColorConverter.to("#abcdef")).toEqual(0xabcdef);
  });

  it("converts numbers to strings", () => {
    expect(AvroColorConverter.from(0xabcdef)).toEqual("#abcdef");
  });
});

test("Mandala design serialization/desrialization works", () => {
  const s = serializeMandalaDesign(MANDALA_DESIGN_DEFAULTS);
  expect(deserializeMandalaDesign(s)).toEqual(MANDALA_DESIGN_DEFAULTS);
});
