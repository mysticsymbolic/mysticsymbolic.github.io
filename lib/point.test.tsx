import { normalizedPoint2rad, normalizePoint } from "./point";

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

describe("normalizedPoint2rad()", () => {
  it("works for (1, 0)", () => {
    expect(normalizedPoint2rad({ x: 1, y: 0 })).toBe(0);
  });

  it("works for (0, 1)", () => {
    expect(normalizedPoint2rad({ x: 0, y: 1 })).toBe(Math.PI / 2);
  });

  it("works for (-1, 0)", () => {
    expect(normalizedPoint2rad({ x: -1, y: 0 })).toBe(Math.PI);
  });

  it("works for (-0.9999, 0.0499)", () => {
    expect(
      normalizedPoint2rad({ x: -0.9999875634527172, y: 0.0049872778043753814 })
    ).toBeCloseTo(Math.PI);
  });

  it("works for (-0.9999, -0.0499)", () => {
    expect(
      normalizedPoint2rad({ x: -0.9999875634527172, y: -0.0049872778043753814 })
    ).toBeCloseTo(Math.PI);
  });

  it("works for (0.9999, -0.0499)", () => {
    expect(
      normalizedPoint2rad({ x: 0.9999875634527172, y: -0.0049872778043753814 })
    ).toBeCloseTo(2 * Math.PI);
  });

  it("works for (0, -1)", () => {
    expect(normalizedPoint2rad({ x: 0, y: -1 })).toBe(Math.PI + Math.PI / 2);
  });
});
