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
  tail?: Point[];
  leg?: Point[];
  arm?: PointWithNormal[];
  horn?: Point[];
  crown?: Point[];
  nesting?: BBox[];
};

function withEmptyNormals(points: Point[]): PointWithNormal[] {
  return points.map((point) => ({
    point,
    normal: { x: 0, y: 0 },
  }));
}

function getPoints(path: string): Point[] {
  const shapes = pathToShapes(path);
  const points: Point[] = [];

  for (let shape of shapes) {
    const bbox = getBoundingBoxForBeziers(shape);
    points.push(getBoundingBoxCenter(bbox));
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
      return { ...specs, tail: concat(specs.tail, getPoints(path)) };
    case colors.LEG_ATTACHMENT_COLOR:
      return { ...specs, leg: concat(specs.leg, getPoints(path)) };
    case colors.ARM_ATTACHMENT_COLOR:
      return {
        ...specs,
        arm: concat(specs.arm, withEmptyNormals(getPoints(path))),
      };
    case colors.HORN_ATTACHMENT_COLOR:
      return { ...specs, horn: concat(specs.horn, getPoints(path)) };
    case colors.CROWN_ATTACHMENT_COLOR:
      return { ...specs, crown: concat(specs.crown, getPoints(path)) };
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
        case "path":
          result.push(el);
      }
    }
  }

  return result;
}

function getAllBeziers(layers: SvgSymbolElement[]): Bezier[] {
  const beziers: Bezier[] = [];

  for (let layer of layers) {
    switch (layer.tagName) {
      case "g":
        beziers.push(...getAllBeziers(layer.children));
        break;
      case "path":
        if (!layer.props.d) {
          throw new Error(`<path> does not have a "d" attribute!`);
        }
        beziers.push(...flatten(pathToShapes(layer.props.d)));
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
      x: point.x,
      y: point.y + 100_000,
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

function populateNormals(pwns: PointWithNormal[], beziers: Bezier[]) {
  if (beziers.length === 0) {
    throw new Error(`Expected beizers to be non-empty!`);
  }

  for (let pwn of pwns) {
    let minDistance = Infinity;
    let minDistanceNormal = ORIGIN;
    let minDistancePoint = ORIGIN;
    for (let bezier of beziers) {
      const { t, d } = bezier.project(pwn.point);
      if (d === undefined || t === undefined) {
        throw new Error(`Expected bezier.project() to return t and d!`);
      }
      if (d < minDistance) {
        minDistance = d;
        minDistanceNormal = bezier.normal(t);
        minDistancePoint = bezier.get(t);
      }
    }
    if (
      isPointInsideShape(
        addPoints(minDistancePoint, minDistanceNormal),
        beziers
      )
    ) {
      invertVector(minDistanceNormal);
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
  const beziers = getAllBeziers(filterFilledShapes(layers));

  if (specs.arm) {
    populateNormals(specs.arm, beziers);
  }
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
    }
  }

  if (specs) {
    populateSpecNormals(specs, layersWithoutSpecs);
  }

  return [specs, layersWithoutSpecs];
}
