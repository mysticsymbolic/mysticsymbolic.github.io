import { BBox } from "../vendor/bezier-js";
import { uniformlyScaleToFit } from "./bounding-box";

describe("uniformlyScaleToFit()", () => {
  it("returns 1 for identical boxes", () => {
    const box: BBox = {
      x: { min: 0, max: 1 },
      y: { min: 0, max: 1 },
    };
    expect(uniformlyScaleToFit(box, box)).toBe(1.0);
  });

  it("returns 1 for identically-sized boxes", () => {
    const box1: BBox = {
      x: { min: 0, max: 1 },
      y: { min: 0, max: 1 },
    };
    const box2: BBox = {
      x: { min: -5, max: -4 },
      y: { min: -20, max: -19 },
    };
    expect(uniformlyScaleToFit(box1, box2)).toBe(1.0);
  });

  it("returns 2 when child is half the size of parent", () => {
    const parent: BBox = {
      x: { min: 0, max: 1 },
      y: { min: 0, max: 1 },
    };
    const child: BBox = {
      x: { min: 0, max: 0.5 },
      y: { min: 0, max: 0.5 },
    };
    expect(uniformlyScaleToFit(parent, child)).toBe(2.0);
  });

  it("returns 0.5 when child is twice the size of parent", () => {
    const parent: BBox = {
      x: { min: 0, max: 1 },
      y: { min: 0, max: 1 },
    };
    const child: BBox = {
      x: { min: 0, max: 2 },
      y: { min: 0, max: 2 },
    };
    expect(uniformlyScaleToFit(parent, child)).toBe(0.5);
  });

  it("returns 1 when child is same width as parent but shorter", () => {
    const parent: BBox = {
      x: { min: 0, max: 1 },
      y: { min: 0, max: 1 },
    };
    const child: BBox = {
      x: { min: 0, max: 1 },
      y: { min: 0, max: 0.1 },
    };
    expect(uniformlyScaleToFit(parent, child)).toBe(1);
  });

  it("returns 1 when child is same height as parent but thinner", () => {
    const parent: BBox = {
      x: { min: 0, max: 1 },
      y: { min: 0, max: 1 },
    };
    const child: BBox = {
      x: { min: 0, max: 0.1 },
      y: { min: 0, max: 1 },
    };
    expect(uniformlyScaleToFit(parent, child)).toBe(1);
  });
});
