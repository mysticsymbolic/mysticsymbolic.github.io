import { flatten, float, inclusiveRange, rad2deg, range } from "./util";

describe("float", () => {
  it("converts strings", () => {
    expect(float("1.0")).toBe(1.0);
  });

  it("returns numbers as-is", () => {
    expect(float(1.0)).toBe(1.0);
  });

  it("throws errors on NaN", () => {
    expect(() => float("LOL")).toThrow("Expected 'LOL' to be a float!");
  });
});

test("flatten() works", () => {
  expect(flatten([[1], [2, 3], [4]])).toEqual([1, 2, 3, 4]);
});

test("rad2deg() works", () => {
  expect(rad2deg(0)).toBe(0);
  expect(rad2deg(-Math.PI)).toBe(-180);
  expect(rad2deg(Math.PI)).toBe(180);
  expect(rad2deg(Math.PI - 0.0000001)).toBeCloseTo(180);
  expect(rad2deg(2 * Math.PI)).toBe(360);
});

test("range() works", () => {
  expect(range(0)).toEqual([]);
  expect(range(1)).toEqual([0]);
  expect(range(5)).toEqual([0, 1, 2, 3, 4]);
});

test("inclusiveRange() works", () => {
  expect(inclusiveRange({ min: 0, max: 1, step: 0.5 })).toEqual([0, 0.5, 1]);
});
