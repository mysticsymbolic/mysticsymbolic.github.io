import { getCirclesFromDesign, MANDALA_DESIGN_DEFAULTS } from "./core";

describe("getCirclesFromDesign()", () => {
  it("returns one circle when the second is disabled", () => {
    expect(getCirclesFromDesign(MANDALA_DESIGN_DEFAULTS)).toHaveLength(1);
  });

  it("returns two circles when the second is enabled", () => {
    expect(
      getCirclesFromDesign({
        ...MANDALA_DESIGN_DEFAULTS,
        useTwoCircles: true,
      })
    ).toHaveLength(2);
  });
});
