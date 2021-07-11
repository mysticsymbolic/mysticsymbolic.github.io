import { Vocabulary } from "./vocabulary";

describe("Vocabulary", () => {
  it("calculates probability distributions", () => {
    type Thing = { name: string; freq: number };
    const one: Thing = { name: "one", freq: 1 };
    const two: Thing = { name: "two", freq: 2 };

    const v = new Vocabulary([one, two], (thing) => thing.freq);

    expect(v.items).toEqual([one, two]);
    expect(v.distribution).toEqual([one, two, two]);
    expect(v.getFilteredDistribution((thing) => thing.name === "two")).toEqual([
      two,
      two,
    ]);
  });
});
