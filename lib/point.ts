import { Point } from "../vendor/bezier-js";

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
