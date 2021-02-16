import { normalizePoint } from "./point";

describe("normalizePoint()", () => {
  it("Does nothing to points w/ length 1", () => {
    expect(normalizePoint({ x: 1, y: 0 })).toEqual({ x: 1, y: 0 });
    expect(normalizePoint({ x: 0, y: 1 })).toEqual({ x: 0, y: 1 });
  });

  it("Raises an exception on points w/ length 0", () => {
    expect(() => normalizePoint({ x: 0, y: 0 })).toThrow(
      "Unable to normalize point with length 0"
    );
  });

  it("Normalizes points", () => {
    expect(normalizePoint({ x: 1, y: 1 })).toEqual({
      x: 1 / Math.sqrt(2),
      y: 1 / Math.sqrt(2),
    });
  });
});
