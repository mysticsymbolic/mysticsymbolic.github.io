import { flatten, float } from "./util";

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
