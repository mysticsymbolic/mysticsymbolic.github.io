import React from "react";
import { Point } from "../vendor/bezier-js";
import { reversePoint } from "./point";

type SvgTransform =
  | {
      kind: "translate";
      amount: Point;
    }
  | {
      kind: "rotate";
      degrees: number;
    }
  | {
      kind: "scale";
      amount: Point;
    }
  | {
      kind: "transformOrigin";
      amount: Point;
      transforms: SvgTransform[];
    };

function getSvgCodeForTransform(t: SvgTransform): string {
  switch (t.kind) {
    case "translate":
      return `translate(${t.amount.x} ${t.amount.y})`;

    case "scale":
      return `scale(${t.amount.x} ${t.amount.y})`;

    case "rotate":
      return `rotate(${t.degrees})`;

    case "transformOrigin":
      /**
       * We originally used the SVG "transform-origin" attribute here but
       * that's not currently supported by Safari. Instead, we'll set the origin
       * of our SVG to the transform origin, do the transform, and then move our
       * origin back to the original origin, which does the same thing.
       **/
      return getSvgCodeForTransforms([
        svgTranslate(t.amount),
        ...t.transforms,
        svgTranslate(reversePoint(t.amount)),
      ]);
  }
}

function getSvgCodeForTransforms(transforms: SvgTransform[]): string {
  return transforms.map(getSvgCodeForTransform).join(" ");
}

/**
 * Apply the given SVG transforms (e.g. rotate, scale)
 * centered at the given origin point.
 */
export function svgTransformOrigin(
  amount: Point,
  transforms: SvgTransform[]
): SvgTransform {
  return { kind: "transformOrigin", amount, transforms };
}

export function svgTranslate(amount: Point): SvgTransform {
  return { kind: "translate", amount };
}

export function svgScale(amount: Point | number): SvgTransform {
  if (typeof amount === "number") {
    amount = { x: amount, y: amount };
  }
  return { kind: "scale", amount };
}

export function svgRotate(degrees: number): SvgTransform {
  return { kind: "rotate", degrees };
}

/**
 * Creates a SVG `<g>` element with the given children and transforms.
 *
 * Like the SVG `transform` attribute, the transforms are applied in
 * the *reverse* order that they are specified.
 */
export const SvgTransforms: React.FC<{
  transforms: SvgTransform[];
  children: any;
}> = ({ transforms, children }) => {
  return <g transform={getSvgCodeForTransforms(transforms)}>{children}</g>;
};
