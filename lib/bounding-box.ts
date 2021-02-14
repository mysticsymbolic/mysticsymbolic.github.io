import { Bezier, Point } from "../vendor/bezier-js";
import { SVGProps } from "react";

import type { SvgSymbolElement } from "./vocabulary";
import { flatten, float } from "./util";
import { pathToShapes } from "./path";

export type Bbox = {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
};

export function getBoundingBoxSize(bbox: Bbox): [number, number] {
  const width = bbox.maxX - bbox.minX;
  const height = bbox.maxY - bbox.minY;

  return [width, height];
}

export function getBoundingBoxCenter(bbox: Bbox): Point {
  const [width, height] = getBoundingBoxSize(bbox);

  return {
    x: bbox.minX + width / 2,
    y: bbox.minY + height / 2,
  };
}

export function dilateBoundingBox(bbox: Bbox, amount: number): Bbox {
  return {
    minX: bbox.minX - amount,
    maxX: bbox.maxX + amount,
    minY: bbox.minY - amount,
    maxY: bbox.maxY + amount,
  };
}

export function coalesceBoundingBoxes(bboxes: Bbox[]): Bbox {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  if (bboxes.length === 0) {
    throw new Error(`Must have at least one bounding box!`);
  }

  for (let bbox of bboxes) {
    if (bbox.minX < minX) {
      minX = bbox.minX;
    }
    if (bbox.maxX > maxX) {
      maxX = bbox.maxX;
    }
    if (bbox.minY < minY) {
      minY = bbox.minY;
    }
    if (bbox.maxY > maxY) {
      maxY = bbox.maxY;
    }
  }

  return { minX, minY, maxX, maxY };
}

function getBoundingBoxForPoints(points: Point[]): Bbox {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  if (points.length === 0) {
    throw new Error(`Must have at least one point!`);
  }

  for (let point of points) {
    if (point.x < minX) {
      minX = point.x;
    }
    if (point.x > maxX) {
      maxX = point.x;
    }
    if (point.y < minY) {
      minY = point.y;
    }
    if (point.y > maxY) {
      maxY = point.y;
    }
  }

  return { minX, minY, maxX, maxY };
}

function getBezierBoundingBox(bezier: Bezier): Bbox {
  const start = bezier.get(0.0);
  const end = bezier.get(1.0);
  const extrema = bezier.extrema().values.map((t) => bezier.get(t));

  return getBoundingBoxForPoints([start, end, ...extrema]);
}

export function getBoundingBoxForBeziers(beziers: Bezier[]): Bbox {
  return coalesceBoundingBoxes(beziers.map(getBezierBoundingBox));
}

function getPathBoundingBox(props: SVGProps<SVGPathElement>): Bbox {
  if (!props.d) {
    throw new Error(`SVG path has no 'd' attribute value!`);
  }
  const beziers = flatten(pathToShapes(props.d));
  const bbox = getBoundingBoxForBeziers(beziers);
  return props.strokeWidth
    ? dilateBoundingBox(bbox, float(props.strokeWidth) / 2)
    : bbox;
}

export function getSvgBoundingBox(
  element: SvgSymbolElement | SvgSymbolElement[]
): Bbox {
  if (Array.isArray(element)) {
    return coalesceBoundingBoxes(element.map(getSvgBoundingBox));
  }
  switch (element.tagName) {
    case "g":
      return getSvgBoundingBox(element.children);
    case "path":
      return getPathBoundingBox(element.props);
  }
}
