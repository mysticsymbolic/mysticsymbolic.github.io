import React from "react";
import { Point } from "../vendor/bezier-js";

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
    };

function getSvgCodeForTransform(t: SvgTransform): string {
  switch (t.kind) {
    case "translate":
      return `translate(${t.amount.x} ${t.amount.y})`;

    case "scale":
      return `scale(${t.amount.x} ${t.amount.y})`;

    case "rotate":
      return `rotate(${t.degrees})`;
  }
}

export function svgTranslate(amount: Point): SvgTransform {
  return { kind: "translate", amount };
}

export function svgScale(amount: Point): SvgTransform {
  return { kind: "scale", amount };
}

export function svgRotate(degrees: number): SvgTransform {
  return { kind: "rotate", degrees };
}

export const SvgTransforms: React.FC<{
  transforms: SvgTransform[];
  children: any;
}> = ({ transforms, children }) => {
  return (
    <g transform={transforms.map(getSvgCodeForTransform).join(" ")}>
      {children}
    </g>
  );
};
