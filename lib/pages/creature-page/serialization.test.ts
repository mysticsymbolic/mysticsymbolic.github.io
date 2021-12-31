import {
  serializeCreatureDesign,
  deserializeCreatureDesign,
} from "./serialization";
import { CREATURE_DESIGN_DEFAULTS } from "./core";

describe("Mandala design serialization/desrialization", () => {
  // Helper to make it easy for us to copy/paste from URLs.
  const decodeAndDeserialize = (s: string) =>
    deserializeCreatureDesign(decodeURIComponent(s));

  it("deserializes from v2", () => {
    const design = decodeAndDeserialize(
      "v2.gIiJA%2BqfB4bA0wwAAIA%2FABpleWVfc3RhcmJ1cnN0AAQKY2xvY2sAAAAIBAABEGluZmluaXR5AQAAAgIAAAIUc3Blcm1fdGFpbAEAAAIAAA%3D%3D"
    );
    expect(design.animatorName).toBe("none");
  });

  it("works", () => {
    const s = serializeCreatureDesign(CREATURE_DESIGN_DEFAULTS);
    expect(deserializeCreatureDesign(s)).toEqual(CREATURE_DESIGN_DEFAULTS);
  });
});
