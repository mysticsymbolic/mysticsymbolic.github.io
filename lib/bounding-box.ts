import { Bezier, Point } from "../vendor/bezier-js";
import { SVGProps } from "react";

import type { SvgSymbolElement } from "./vocabulary";

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

function dilateBoundingBox(bbox: Bbox, amount: number): Bbox {
  return {
    minX: bbox.minX - amount,
    maxX: bbox.maxX + amount,
    minY: bbox.minY - amount,
    maxY: bbox.maxY + amount,
  };
}

function coalesceBoundingBoxes(bboxes: Bbox[]): Bbox {
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

function float(value: string | number | undefined): number {
  if (typeof value === "number") return value;
  if (value === undefined) value = "";

  const float = parseFloat(value);

  if (isNaN(float)) {
    throw new Error(`Expected '${value}' to be a float!`);
  }

  return float;
}

function pathToBeziers(path: string): Bezier[] {
  const parts = path.trim().split(" ");
  let x = 0;
  let y = 0;
  let i = 0;
  const beziers: Bezier[] = [];

  const chomp = () => {
    if (i >= parts.length) {
      throw new Error(`Ran out of path parts!`);
    }
    const val = parts[i];
    i++;
    return val;
  };

  while (i < parts.length) {
    const command = chomp();
    switch (command) {
      case "M":
        x = float(chomp());
        y = float(chomp());
        break;
      case "C":
        const x1 = float(chomp());
        const y1 = float(chomp());
        const x2 = float(chomp());
        const y2 = float(chomp());
        const endX = float(chomp());
        const endY = float(chomp());
        beziers.push(new Bezier(x, y, x1, y1, x2, y2, endX, endY));
        x = endX;
        y = endY;
        break;
      case "Z":
        break;
      default:
        throw new Error(`Unknown SVG path command: '${command}'`);
    }
  }

  return beziers;
}

function getBezierBoundingBox(bezier: Bezier): Bbox {
  const start = bezier.get(0.0);
  const end = bezier.get(1.0);
  const extrema = bezier.extrema().values.map((t) => bezier.get(t));

  return getBoundingBoxForPoints([start, end, ...extrema]);
}

function getPathBoundingBox(props: SVGProps<SVGPathElement>): Bbox {
  if (!props.d) {
    throw new Error(`SVG path has no 'd' attribute value!`);
  }
  const beziers = pathToBeziers(props.d);
  const bezierBboxes = beziers.map(getBezierBoundingBox);
  const bbox = coalesceBoundingBoxes(bezierBboxes);
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
