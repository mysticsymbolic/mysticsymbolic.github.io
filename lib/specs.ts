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

export type Specs = {
  tail?: PointWithNormal[];
  leg?: PointWithNormal[];
  arm?: PointWithNormal[];
  horn?: PointWithNormal[];
  crown?: PointWithNormal[];
  nesting?: BBox[];
};
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

function updateSpecs(fill: string, path: string, specs: Specs): Specs {
  switch (fill) {
    case colors.TAIL_ATTACHMENT_COLOR:
      return {
        ...specs,
        tail: concat(specs.tail, getArrowPoints(path)),
      };
    case colors.LEG_ATTACHMENT_COLOR:
      return {
        ...specs,
        leg: concat(specs.leg, getArrowPoints(path)),
      };
    case colors.ARM_ATTACHMENT_COLOR:
      return {
        ...specs,
        arm: concat(specs.arm, getArrowPoints(path)),
      };
    case colors.HORN_ATTACHMENT_COLOR:
      return {
        ...specs,
        horn: concat(specs.horn, getArrowPoints(path)),
      };
    case colors.CROWN_ATTACHMENT_COLOR:
      return {
        ...specs,
        crown: concat(specs.crown, getArrowPoints(path)),
      };
    case colors.NESTING_BOUNDING_BOX_COLOR:
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
