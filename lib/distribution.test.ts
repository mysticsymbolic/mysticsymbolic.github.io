import { createDistribution } from "./distribution";

test("createDistribution() works", () => {
  type Thing = { name: string; freq: number };
  const one: Thing = { name: "one", freq: 1 };
  const two: Thing = { name: "two", freq: 2 };

  const dist = createDistribution([one, two], (thing) => thing.freq);

  expect(dist).toEqual([one, two, two]);
});
