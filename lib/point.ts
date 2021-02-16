import { Point } from "../vendor/bezier-js";

export function scalePointXY(p: Point, xScale: number, yScale: number): Point {
  return {
    x: p.x * xScale,
    y: p.y * yScale,
  };
}

export function subtractPoints(p1: Point, p2: Point): Point {
  return {
    x: p1.x - p2.x,
    y: p1.y - p2.y,
  };
}

export function normalizePoint(p: Point): Point {
  const len = Math.sqrt(Math.pow(p.x, 2) + Math.pow(p.y, 2));
  if (len === 0) {
    throw new Error(`Unable to normalize point with length 0`);
  }
  return {
    x: p.x / len,
    y: p.y / len,
  };
}

export function normalizedPoint2rad(p: Point): number {
  let result = Math.acos(p.x);
  if (p.y < 0) {
    result += (Math.PI - result) * 2;
  }
  return result;
}
