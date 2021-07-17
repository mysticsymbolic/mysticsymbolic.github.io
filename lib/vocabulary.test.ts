import { Vocabulary } from "./vocabulary";

describe("Vocabulary", () => {
  type Thing = { name: string; freq: number };
  const one: Thing = { name: "one", freq: 1 };
  const two: Thing = { name: "two", freq: 2 };

  const v = new Vocabulary([one, two]);

  it("gets items", () => {
    expect(v.items).toEqual([one, two]);
    expect(v.get("one")).toBe(one);
    expect(v.get("two")).toBe(two);
  });

  it("raises exception on items not found", () => {
    expect(() => v.get("boop")).toThrow('Unable to find the item "boop"!');
  });
});
