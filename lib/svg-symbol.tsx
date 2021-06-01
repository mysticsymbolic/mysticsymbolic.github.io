import React, { useMemo } from "react";
import { SVGProps } from "react";
import { BBox } from "../vendor/bezier-js";
import { FILL_REPLACEMENT_COLOR, STROKE_REPLACEMENT_COLOR } from "./colors";
import { AttachmentPointType, PointWithNormal, Specs } from "./specs";
import type { SvgSymbolMetadata } from "./svg-symbol-metadata";
import { UniqueIdMap, useUniqueIdMap } from "./unique-id";
import { VisibleSpecs } from "./visible-specs";

const DEFAULT_UNIFORM_STROKE_WIDTH = 1;

export type SvgSymbolData = {
  name: string;
  bbox: BBox;
  layers: SvgSymbolElement[];
  defs?: SvgSymbolDef[];
  meta?: SvgSymbolMetadata;
  specs?: Specs;
};

export type SvgSymbolGradientStop = {
  offset: string;
  color: string;
};

/**
 * This represents a definition that will be referenced
 * from elsewhere in an SVG, such as a radial gradient.
 */
export type SvgSymbolDef =
  | {
      type: "radialGradient";
      id: string;
      cx: string;
      cy: string;
      r: string;
      stops: SvgSymbolGradientStop[];
    }
  | {
      type: "linearGradient";
      id: string;
      x1: string;
      y1: string;
      x2: string;
      y2: string;
      stops: SvgSymbolGradientStop[];
    };

export const EMPTY_SVG_SYMBOL_DATA: SvgSymbolData = {
  name: "",
  bbox: {
    x: { min: 0, max: 0 },
    y: { min: 0, max: 0 },
  },
  layers: [],
};

export type SvgSymbolElement = (
  | {
      tagName: "g";
      props: SVGProps<SVGGElement>;
    }
  | {
      tagName: "path";
      props: SVGProps<SVGPathElement>;
    }
) & {
  children: SvgSymbolElement[];
};

export type SvgSymbolContext = {
  /** The stroke color of the symbol, as a hex hash (e.g. '#ff0000'). */
  stroke: string;

  /** The fill color of the symbol, as a hex hash (e.g. '#ff0000'). */
  fill: string;

  /**
   * Whether or not to visibly show the specifications for the symbol,
   * e.g. its attachment points, nesting boxes, and so on.
   */
  showSpecs: boolean;

  /**
   * Whether or not to forcibly apply a uniform stroke width to all
   * the shapes in the symbol.  If defined, the stroke width will
   * *not* vary as the symbol is scaled.
   */
  uniformStrokeWidth?: number;
};

const DEFAULT_CONTEXT: SvgSymbolContext = {
  stroke: "#000000",
  fill: "#ffffff",
  showSpecs: false,
  uniformStrokeWidth: DEFAULT_UNIFORM_STROKE_WIDTH,
};

/**
 * If the given symbol context is visibly showing its specifications,
 * return one with its fill color set to "none" so that the specs can
 * be seen more easily.
 */
export function noFillIfShowingSpecs<T extends SvgSymbolContext>(ctx: T): T {
  return {
    ...ctx,
    fill: ctx.showSpecs ? "none" : ctx.fill,
  };
}

/**
 * Return a symbol context with the stroke and fill colors swapped.
 */
export function swapColors<T extends SvgSymbolContext>(ctx: T): T {
  return {
    ...ctx,
    fill: ctx.stroke,
    stroke: ctx.fill,
  };
}

export function createSvgSymbolContext(
  ctx: Partial<SvgSymbolContext> = {}
): SvgSymbolContext {
  return {
    ...DEFAULT_CONTEXT,
    ...ctx,
  };
}

function getColor(
  ctx: SvgSymbolContext,
  color: string | undefined
): string | undefined {
  switch (color) {
    case STROKE_REPLACEMENT_COLOR:
      return ctx.stroke;
    case FILL_REPLACEMENT_COLOR:
      return ctx.fill;
  }
  return color;
}

function reactifySvgSymbolElement(
  ctx: SvgSymbolContext,
  uidMap: UniqueIdMap,
  el: SvgSymbolElement,
  key: number
): JSX.Element {
  let { fill, stroke, strokeWidth } = el.props;
  let vectorEffect;
  fill = getColor(ctx, fill);
  stroke = getColor(ctx, stroke);
  if (fill) {
    fill = uidMap.rewriteUrl(fill);
  }
  if (strokeWidth !== undefined && typeof ctx.uniformStrokeWidth === "number") {
    strokeWidth = ctx.uniformStrokeWidth;
    vectorEffect = "non-scaling-stroke";
  }
  const props: typeof el.props = {
    ...el.props,
    id: undefined,
    vectorEffect,
    strokeWidth,
    fill,
    stroke,
    key,
  };
  return React.createElement(
    el.tagName,
    props,
    el.children.map(reactifySvgSymbolElement.bind(null, ctx, uidMap))
  );
}

const SvgSymbolDef: React.FC<
  { def: SvgSymbolDef; uidMap: UniqueIdMap } & SvgSymbolContext
> = ({ def, uidMap, ...ctx }) => {
  const id = uidMap.getStrict(def.id);
  const stops = def.stops.map((stop, i) => (
    <stop key={i} offset={stop.offset} stopColor={getColor(ctx, stop.color)} />
  ));
  switch (def.type) {
    case "radialGradient":
      return (
        <radialGradient id={id} cx={def.cx} cy={def.cy} r={def.r}>
          {stops}
        </radialGradient>
      );
    case "linearGradient":
      return (
        <linearGradient id={id} x1={def.x1} y1={def.y1} x2={def.x2} y2={def.y2}>
          {stops}
        </linearGradient>
      );
  }
};

export const SvgSymbolContent: React.FC<
  { data: SvgSymbolData } & SvgSymbolContext
> = (props) => {
  const d = props.data;
  const origIds = useMemo(() => d.defs?.map((def) => def.id) ?? [], [d.defs]);
  const uidMap = useUniqueIdMap(origIds);

  return (
    <g data-symbol-name={d.name}>
      {d.defs &&
        d.defs.map((def, i) => (
          <SvgSymbolDef key={i} {...props} def={def} uidMap={uidMap} />
        ))}
      {props.data.layers.map(
        reactifySvgSymbolElement.bind(null, props, uidMap)
      )}
      {props.showSpecs && d.specs && <VisibleSpecs specs={d.specs} />}
    </g>
  );
};

export class AttachmentPointError extends Error {}

export function getAttachmentPoint(
  s: SvgSymbolData,
  type: AttachmentPointType,
  idx: number = 0
): PointWithNormal {
  const { specs } = s;
  if (!specs) {
    throw new AttachmentPointError(`Symbol ${s.name} has no specs.`);
  }
  const points = specs[type];
  if (!(points && points.length > idx)) {
    throw new AttachmentPointError(
      `Expected symbol ${s.name} to have at least ${
        idx + 1
      } ${type} attachment point(s).`
    );
  }

  return points[idx];
}

export function safeGetAttachmentPoint(
  s: SvgSymbolData,
  type: AttachmentPointType,
  idx: number = 0
): PointWithNormal | null {
  try {
    return getAttachmentPoint(s, type, idx);
  } catch (e) {
    if (e instanceof AttachmentPointError) {
      console.log(e.message);
    } else {
      throw e;
    }
  }

  return null;
}
