import { normalToAttachmentSpaceDegrees } from "./attach";

describe("normalToAttachmentSpaceDegrees()", () => {
  it("Treats 'up' in canvas space as 0 degrees", () => {
    expect(normalToAttachmentSpaceDegrees({ x: 0, y: -1 })).toBe(0);
  });

  it("Treats 'right' in canvas space as 90 degrees", () => {
    expect(normalToAttachmentSpaceDegrees({ x: 1, y: 0 })).toBe(90);
  });

  it("Treats 'left' in canvas space as 270 degrees", () => {
    expect(normalToAttachmentSpaceDegrees({ x: -1, y: 0 })).toBe(270);
  });

  it("Treats 'almost left' in canvas space as ~270 degrees", () => {
    expect(
      normalToAttachmentSpaceDegrees({ x: -0.9999, y: 0.004 })
    ).toBeCloseTo(269.189);
  });

  it("Treats 'down' in canvas space as 180 degrees", () => {
    expect(normalToAttachmentSpaceDegrees({ x: 0, y: 1 })).toBe(180);
  });
});
