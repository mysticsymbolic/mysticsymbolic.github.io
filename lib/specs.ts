import { Point, BBox } from "../vendor/bezier-js";
import { getBoundingBoxForBeziers } from "./bounding-box";
import * as colors from "./colors";
import { pathToShapes } from "./path";
import type { SvgSymbolElement } from "./vocabulary";

const SPEC_LAYER_ID_RE = /^specs.*/i;

export type PointWithNormal = {
  point: Point;
  normal: Point;
};

type AttachmentPointSpecs = {
  tail: PointWithNormal[];
  leg: PointWithNormal[];
  arm: PointWithNormal[];
  horn: PointWithNormal[];
  crown: PointWithNormal[];
};

type FullSpecs = AttachmentPointSpecs & {
  nesting: BBox[];
};

export type Specs = Partial<FullSpecs>;

export type AttachmentPointType = keyof AttachmentPointSpecs;

export type AttachmentPoint = PointWithNormal & {
  type: AttachmentPointType;
};

export const ATTACHMENT_POINT_TYPES: AttachmentPointType[] = [
  "tail",
  "leg",
  "arm",
  "horn",
  "crown",
];

export function* iterAttachmentPoints(specs: Specs): Iterable<AttachmentPoint> {
  for (let type of ATTACHMENT_POINT_TYPES) {
    const points = specs[type];
    if (points) {
      for (let point of points) {
        yield { ...point, type };
      }
    }
  }
}

const NUM_ARROW_POINTS = 4;
const ARROW_TOP_POINT_IDX = 0;
const ARROW_BOTTOM_POINT_IDX = 2;

function subtractPoints(p1: Point, p2: Point): Point {
  return {
    x: p1.x - p2.x,
    y: p1.y - p2.y,
  };
}

function normalizePoint(p: Point): Point {
  const len = Math.sqrt(Math.pow(p.x, 2) + Math.pow(p.y, 2));
  return {
    x: p.x / len,
    y: p.y / len,
  };
}

function getArrowPoints(path: string): PointWithNormal[] {
  const shapes = pathToShapes(path);
  const points: PointWithNormal[] = [];

  for (let shape of shapes) {
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
      [attachmentType]: concat(specs[attachmentType], getArrowPoints(path)),
    };
  }

  if (fill === colors.NESTING_BOUNDING_BOX_COLOR) {
    return {
      ...specs,
      nesting: concat(specs.nesting, getBoundingBoxes(path)),
    };
  }

  throw new Error(`Not sure what to do with specs path with fill "${fill}"!`);
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
