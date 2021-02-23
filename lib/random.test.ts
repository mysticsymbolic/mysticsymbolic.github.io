import { Random } from "./random";

describe("choice()", () => {
  it("works", () => {
    expect(new Random().choice([1])).toBe(1);
    expect(new Random(134).choice([1, 5, 9, 7])).toBe(5);
  });

  it("throws an error if passed an empty array", () => {
    expect(() => new Random().choice([])).toThrow(
      /Cannot choose randomly from an empty array/
    );
  });
});

describe("uniqueChoices()", () => {
  it("works", () => {
    expect(new Random(3).uniqueChoices([1, 2, 3], 2)).toEqual([1, 3]);
  });

  it("returns fewer choices than asked if necessary", () => {
    expect(new Random().uniqueChoices([1, 1, 1], 5)).toEqual([1]);
  });

  it("returns an empty array if needed", () => {
    expect(new Random().uniqueChoices([], 5)).toEqual([]);
  });
});
