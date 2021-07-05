import { Point, BBox, Bezier } from "../vendor/bezier-js";
import { getBoundingBoxForBeziers } from "./bounding-box";
import * as colors from "./colors";
import { pathToShapes } from "./path";
import { normalizePoint, subtractPoints } from "./point";
import type { SvgSymbolElement } from "./svg-symbol";

const SPEC_LAYER_ID_RE = /^specs.*/i;

export type PointWithNormal = {
  point: Point;
  normal: Point;
};

type AttachmentPointSpecs = {
  anchor: PointWithNormal[];
  tail: PointWithNormal[];
  leg: PointWithNormal[];
  arm: PointWithNormal[];
  horn: PointWithNormal[];
  crown: PointWithNormal[];
  wildcard: PointWithNormal[];
};

type FullSpecs = AttachmentPointSpecs & {
  nesting: BBox[];
};

export type Specs = Partial<FullSpecs>;

export type AttachmentPointType = keyof AttachmentPointSpecs;

export type AttachmentPoint = PointWithNormal & {
  type: AttachmentPointType;
  index: number;
};

export const ATTACHMENT_POINT_TYPES: AttachmentPointType[] = [
  "anchor",
  "tail",
  "leg",
  "arm",
  "horn",
  "crown",
  "wildcard",
];

const ATTACHMENT_POINT_SET = new Set(ATTACHMENT_POINT_TYPES);

export function isAttachmentPointType(
  value: any
): value is AttachmentPointType {
  return ATTACHMENT_POINT_SET.has(value);
}

export function* iterAttachmentPoints(specs: Specs): Iterable<AttachmentPoint> {
  for (let type of ATTACHMENT_POINT_TYPES) {
    const points = specs[type];
    if (points) {
      let index = 0;
      for (let point of points) {
        yield { ...point, type, index };
        index += 1;
      }
    }
  }
}

const NUM_FACING_ARROW_POINTS = 5;
const NUM_ARROW_POINTS = 4;
const ARROW_TOP_POINT_IDX = 0;
const ARROW_BOTTOM_POINT_IDX = 2;

function getAngleBetween(shape: Bezier[]): number {
  const oneToZero = normalizePoint(
    subtractPoints(shape[0].get(0.0), shape[1].get(0.0))
  );
  const oneToTwo = normalizePoint(
    subtractPoints(shape[2].get(0.0), shape[1].get(0.0))
  );
  const dotProduct = oneToZero.x * oneToTwo.x + oneToTwo.y * oneToTwo.y;
  return Math.acos(dotProduct);
}

function parseFacingArrow(shape: Bezier[]): [Bezier[], boolean] {
  const firstAngle = getAngleBetween([shape[0], shape[1], shape[2]]);
  const secondAngle = getAngleBetween([shape[3], shape[4], shape[0]]);
  let hFlip: boolean;
  if (firstAngle > secondAngle) {
    hFlip = false;
    shape = [shape[0], shape[1], shape[3], shape[4]];
  } else {
    hFlip = true;
    shape = [shape[0], shape[1], shape[2], shape[4]];
  }
  console.log("FOUND FACING ARROW WITH hFlip =", hFlip);
  return [shape, hFlip];
}

function getArrowPoints(path: string): PointWithNormal[] {
  const shapes = pathToShapes(path);
  const points: PointWithNormal[] = [];

  for (let shape of shapes) {
    if (shape.length === NUM_FACING_ARROW_POINTS) {
      const [arrow, _shouldFlip] = parseFacingArrow(shape);
      shape = arrow;
    }
    if (shape.length !== NUM_ARROW_POINTS) {
      throw new Error(
        `Expected arrow to have ${NUM_ARROW_POINTS} points, not ${shape.length}!`
      );
    }
    const point = shape[ARROW_BOTTOM_POINT_IDX].get(0.0);
    const normal = normalizePoint(
      subtractPoints(shape[ARROW_TOP_POINT_IDX].get(0.0), point)
    );
    points.push({
      point,
      normal,
    });
  }

  return points;
}

function getBoundingBoxes(path: string): BBox[] {
  const shapes = pathToShapes(path);
  const bboxes: BBox[] = [];

  for (let shape of shapes) {
    bboxes.push(getBoundingBoxForBeziers(shape));
  }

  return bboxes;
}

/**
 * Sort points from top to bottom, left to right.
 */
function sortPoints(a: PointWithNormal, b: PointWithNormal): number {
  if (a.point.y < b.point.y) return -1;
  if (a.point.y > b.point.y) return 1;
  if (a.point.x < b.point.x) return -1;
  if (a.point.x > b.point.x) return 1;
  return 0;
}

function sortedPoints(points: PointWithNormal[]): PointWithNormal[] {
  const copy = [...points];
  copy.sort(sortPoints);
  return copy;
}

function concat<T>(first: T[] | undefined, second: T[]): T[] {
  return first ? [...first, ...second] : second;
}

const ATTACHMENT_COLOR_MAP = new Map(
  ATTACHMENT_POINT_TYPES.map((type) => [
    colors.ATTACHMENT_POINT_COLORS[type],
    type,
  ])
);

function updateSpecs(fill: string, path: string, specs: Specs): Specs {
  const attachmentType = ATTACHMENT_COLOR_MAP.get(fill);

  if (attachmentType) {
    return {
      ...specs,
      [attachmentType]: sortedPoints(
        concat(specs[attachmentType], getArrowPoints(path))
      ),
    };
  }

  if (fill === colors.NESTING_BOUNDING_BOX_COLOR) {
    return {
      ...specs,
      nesting: concat(specs.nesting, getBoundingBoxes(path)),
    };
  }

  console.log(
    `Not sure what to do with specs path with fill "${fill}", ignoring it.`
  );

  return specs;
}

function getSpecs(layers: SvgSymbolElement[]): Specs {
  let specs: Specs = {};

  for (let layer of layers) {
    if (layer.tagName !== "path") {
      throw new Error(
        `Found an unexpected <${layer.tagName}> in the specs layer!`
      );
    }
    const { fill, d } = layer.props;
    if (!(fill && d)) {
      throw new Error(
        `Specs layer does not contain 'fill' and/or 'd' attributes!`
      );
    }
    specs = updateSpecs(fill, d, specs);
  }

  return specs;
}

export function extractSpecs(
  layers: SvgSymbolElement[]
): [Specs | undefined, SvgSymbolElement[]] {
  const layersWithoutSpecs: SvgSymbolElement[] = [];
  let specs: Specs | undefined = undefined;

  const setSpecs = (s: Specs | undefined) => {
    if (s) {
      if (specs) {
        throw new Error("Duplicate specs layers found!");
      }
      specs = s;
    }
  };

  for (let layer of layers) {
    switch (layer.tagName) {
      case "g":
        const { id } = layer.props;
        if (id && SPEC_LAYER_ID_RE.test(id)) {
          setSpecs(getSpecs(layer.children));
        } else {
          let [s, children] = extractSpecs(layer.children);
          setSpecs(s);
          layersWithoutSpecs.push({
            ...layer,
            children,
          });
        }
        break;
      case "path":
        layersWithoutSpecs.push(layer);
        break;
    }
  }

  return [specs, layersWithoutSpecs];
}
