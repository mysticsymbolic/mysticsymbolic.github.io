import { Point, BBox, Bezier, Line } from "../vendor/bezier-js";
import { getBoundingBoxCenter, getBoundingBoxForBeziers } from "./bounding-box";
import * as colors from "./colors";
import { pathToShapes } from "./path";
import { flatten } from "./util";
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

function getPointsWithEmptyNormals(path: string): PointWithNormal[] {
  const shapes = pathToShapes(path);
  const points: PointWithNormal[] = [];

  for (let shape of shapes) {
    const bbox = getBoundingBoxForBeziers(shape);
    const point = getBoundingBoxCenter(bbox);
    points.push({
      point,
      normal: ORIGIN,
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
        tail: concat(specs.tail, getPointsWithEmptyNormals(path)),
      };
    case colors.LEG_ATTACHMENT_COLOR:
      return {
        ...specs,
        leg: concat(specs.leg, getPointsWithEmptyNormals(path)),
      };
    case colors.ARM_ATTACHMENT_COLOR:
      return {
        ...specs,
        arm: concat(specs.arm, getPointsWithEmptyNormals(path)),
      };
    case colors.HORN_ATTACHMENT_COLOR:
      return {
        ...specs,
        horn: concat(specs.horn, getPointsWithEmptyNormals(path)),
      };
    case colors.CROWN_ATTACHMENT_COLOR:
      return {
        ...specs,
        crown: concat(specs.crown, getPointsWithEmptyNormals(path)),
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

function filterElements(
  elements: SvgSymbolElement[],
  filter: (el: SvgSymbolElement) => boolean
): SvgSymbolElement[] {
  const result: SvgSymbolElement[] = [];

  for (let el of elements) {
    if (filter(el)) {
      switch (el.tagName) {
        case "g":
          result.push({
            ...el,
            children: filterElements(el.children, filter),
          });
          break;
        case "path":
          result.push(el);
          break;
      }
    }
  }

  return result;
}

function getAllShapes(layers: SvgSymbolElement[]): Bezier[][] {
  const beziers: Bezier[][] = [];

  for (let layer of layers) {
    switch (layer.tagName) {
      case "g":
        beziers.push(...getAllShapes(layer.children));
        break;
      case "path":
        if (!layer.props.d) {
          throw new Error(`<path> does not have a "d" attribute!`);
        }
        beziers.push(...pathToShapes(layer.props.d));
        break;
    }
  }

  return beziers;
}

const ORIGIN: Point = { x: 0, y: 0 };

function invertVector(v: Point) {
  v.x = -v.x;
  v.y = -v.y;
}

const TO_INFINITY_AMOUNT = 2000;

/**
 * Return whether the given point is inside the given shape, assuming
 * the SVG "evenodd" fill rule:
 *
 *   https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/fill-rule#evenodd
 */
function isPointInsideShape(point: Point, beziers: Bezier[]): boolean {
  let intersections = 0;
  const line: Line = {
    p1: point,
    p2: {
      x: point.x + TO_INFINITY_AMOUNT,
      y: point.y + TO_INFINITY_AMOUNT,
    },
  };

  for (let bezier of beziers) {
    const points = bezier.lineIntersects(line);
    intersections += points.length;
  }

  const isOdd = intersections % 2 === 1;
  return isOdd;
}

function addPoints(p1: Point, p2: Point): Point {
  return {
    x: p1.x + p2.x,
    y: p1.y + p2.y,
  };
}

function populateNormals(pwns: PointWithNormal[], shapes: Bezier[][]) {
  if (shapes.length === 0) {
    throw new Error(`Expected beizers to be non-empty!`);
  }

  for (let pwn of pwns) {
    let minDistance = Infinity;
    let minDistanceNormal = ORIGIN;
    let minDistancePoint = ORIGIN;
    for (let shape of shapes) {
      let minDistanceChanged = false;
      for (let bezier of shape) {
        const { t, d } = bezier.project(pwn.point);
        if (d === undefined || t === undefined) {
          throw new Error(`Expected bezier.project() to return t and d!`);
        }
        if (d < minDistance) {
          minDistanceChanged = true;
          minDistance = d;
          minDistanceNormal = bezier.normal(t);
          minDistancePoint = bezier.get(t);
        }
      }
      if (minDistanceChanged) {
        const pointToNormal = addPoints(minDistancePoint, minDistanceNormal);
        if (isPointInsideShape(pointToNormal, shape)) {
          invertVector(minDistanceNormal);
        }
      }
    }
    pwn.normal = minDistanceNormal;
  }
}

function filterFilledShapes(elements: SvgSymbolElement[]): SvgSymbolElement[] {
  return filterElements(elements, (el) => {
    if (el.tagName === "path") {
      if (el.props.fill === "none") return false;
      if (el.props.fillRule !== "evenodd") {
        throw new Error(
          `Expected <path> to have fill-rule="evenodd" but it is "${el.props.fillRule}"!`
        );
      }
    }
    return true;
  });
}

function populateSpecNormals(specs: Specs, layers: SvgSymbolElement[]): void {
  const shapes = getAllShapes(filterFilledShapes(layers));

  if (specs.tail) {
    populateNormals(specs.tail, shapes);
  }
  if (specs.leg) {
    populateNormals(specs.leg, shapes);
  }
  if (specs.arm) {
    populateNormals(specs.arm, shapes);
  }
  if (specs.horn) {
    populateNormals(specs.horn, shapes);
  }
  if (specs.crown) {
    populateNormals(specs.crown, shapes);
  }
}

export function extractSpecs(
  layers: SvgSymbolElement[],
  populateNormals: boolean = true
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
          let [s, children] = extractSpecs(layer.children, false);
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

  if (populateNormals && specs) {
    populateSpecNormals(specs, layersWithoutSpecs);
  }

  return [specs, layersWithoutSpecs];
}
