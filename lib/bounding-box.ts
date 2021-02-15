import { Bezier, Point, BBox, MinMax } from "../vendor/bezier-js";
import { SVGProps } from "react";

import type { SvgSymbolElement } from "./svg-symbol";
import { flatten, float } from "./util";
import { pathToShapes } from "./path";

export function getBoundingBoxSize(bbox: BBox): [number, number] {
  const width = bbox.x.max - bbox.x.min;
  const height = bbox.y.max - bbox.y.min;

  return [width, height];
}

export function getBoundingBoxCenter(bbox: BBox): Point {
  const [width, height] = getBoundingBoxSize(bbox);

  return {
    x: bbox.x.min + width / 2,
    y: bbox.y.min + height / 2,
  };
}

function dilateMinMax(minmax: MinMax, amount: number): MinMax {
  return {
    min: minmax.min - amount,
    max: minmax.max + amount,
  };
}

export function dilateBoundingBox(bbox: BBox, amount: number): BBox {
  return {
    x: dilateMinMax(bbox.x, amount),
    y: dilateMinMax(bbox.y, amount),
  };
}

export function coalesceBoundingBoxes(bboxes: BBox[]): BBox {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  if (bboxes.length === 0) {
    throw new Error(`Must have at least one bounding box!`);
  }

  for (let bbox of bboxes) {
    if (bbox.x.min < minX) {
      minX = bbox.x.min;
    }
    if (bbox.x.max > maxX) {
      maxX = bbox.x.max;
    }
    if (bbox.y.min < minY) {
      minY = bbox.y.min;
    }
    if (bbox.y.max > maxY) {
      maxY = bbox.y.max;
    }
  }

  return { x: { min: minX, max: maxX }, y: { min: minY, max: maxY } };
}

export function getBoundingBoxForBeziers(beziers: Bezier[]): BBox {
  return coalesceBoundingBoxes(beziers.map((b) => b.bbox()));
}

function getPathBoundingBox(props: SVGProps<SVGPathElement>): BBox {
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
): BBox {
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
