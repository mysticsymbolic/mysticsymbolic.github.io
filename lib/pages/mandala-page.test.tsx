import { AvroColorConverter } from "./mandala-page";

describe("AvroColorConverter", () => {
  it("converts strings to numbers", () => {
    expect(AvroColorConverter.to("#abcdef")).toEqual(0xabcdef);
  });

  it("converts numbers to strings", () => {
    expect(AvroColorConverter.from(0xabcdef)).toEqual("#abcdef");
  });
});
