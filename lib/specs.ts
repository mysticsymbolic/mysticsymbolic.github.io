import { Point, BBox, Bezier } from "../vendor/bezier-js";
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

function populateNormals(pwns: PointWithNormal[], beziers: Bezier[]) {
  if (beziers.length === 0) {
    throw new Error(`Expected beizers to be non-empty!`);
  }

  for (let pwn of pwns) {
    let minDistance = Infinity;
    let minDistanceNormal = pwn.normal;
    for (let bezier of beziers) {
      const { t, d } = bezier.project(pwn.point);
      if (d === undefined || t === undefined) {
        throw new Error(`Expected bezier.project() to return t and d!`);
      }
      if (d < minDistance) {
        minDistance = d;
        const n = bezier.normal(t);
        minDistanceNormal = { x: -n.x, y: -n.y };
      }
    }
    pwn.normal = minDistanceNormal;
  }
}

function populateSpecNormals(specs: Specs, layers: SvgSymbolElement[]): void {
  const beziers = getAllBeziers(layers);

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
