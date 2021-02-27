import React, { useContext } from "react";
import { getAttachmentTransforms } from "./attach";
import { scalePointXY, subtractPoints } from "./point";
import { BBox, Point } from "../vendor/bezier-js";
import { getBoundingBoxCenter, uniformlyScaleToFit } from "./bounding-box";
import { AttachmentPointType, PointWithNormal } from "./specs";
import {
  createSvgSymbolContext,
  SvgSymbolContent,
  SvgSymbolContext,
  SvgSymbolData,
} from "./svg-symbol";

const DEFAULT_ATTACHMENT_SCALE = 0.5;

function getAttachmentPoint(
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

class AttachmentPointError extends Error {}

function safeGetAttachmentPoint(
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

type AttachmentChildren = JSX.Element | JSX.Element[];

export type CreatureContextType = SvgSymbolContext & {
  attachmentScale: number;
  parent: SvgSymbolData | null;
};

export const CreatureContext = React.createContext<CreatureContextType>({
  ...createSvgSymbolContext(),
  attachmentScale: DEFAULT_ATTACHMENT_SCALE,
  parent: null,
});

type AttachmentIndices = {
  left?: boolean;
  right?: boolean;
};

export type AttachedNormalizedCreatureSymbol = NormalizedCreatureSymbol & {
  attachTo: AttachmentPointType;
  indices: number[];
};

export type NestedNormalizedCreatureSymbol = NormalizedCreatureSymbol & {
  indices: number[];
};

export type NormalizedCreatureSymbol = {
  data: SvgSymbolData;
  attachments: AttachedNormalizedCreatureSymbol[];
  nesting: NestedNormalizedCreatureSymbol[];
};

export type CreatureSymbolProps = AttachmentIndices & {
  data: SvgSymbolData;
  nestInside?: boolean;
  children?: AttachmentChildren;
  attachTo?: AttachmentPointType;
  indices?: number[];
};

function getAttachmentIndices(ai: AttachmentIndices): number[] {
  const result: number[] = [];

  if (ai.left) {
    result.push(0);
  }
  if (ai.right) {
    result.push(1);
  }
  if (result.length === 0) {
    result.push(0);
  }
  return result;
}

type SplitCreatureSymbolChildren = {
  attachments: JSX.Element[];
  nests: JSX.Element[];
};

function splitCreatureSymbolChildren(
  children?: AttachmentChildren
): SplitCreatureSymbolChildren {
  const result: SplitCreatureSymbolChildren = {
    attachments: [],
    nests: [],
  };
  if (!children) return result;

  React.Children.forEach(children, (child) => {
    if (child.props.nestInside) {
      result.nests.push(child);
    } else {
      result.attachments.push(child);
    }
  });

  return result;
}

type ChildCreatureSymbolProps = {
  symbol: JSX.Element;
  data: SvgSymbolData;
  parent: SvgSymbolData;
  indices: number[];
};

const NestedCreatureSymbol: React.FC<ChildCreatureSymbolProps> = ({
  symbol,
  data,
  parent,
  indices,
}) => {
  const children: JSX.Element[] = [];

  for (let nestIndex of indices) {
    const parentNest = (parent.specs?.nesting ?? [])[nestIndex];
    if (!parentNest) {
      console.log(
        `Parent symbol ${parent.name} has no nesting index ${nestIndex}.`
      );
      continue;
    }
    const t = getNestingTransforms(parentNest, data.bbox);
    children.push(
      <AttachmentTransform
        key={nestIndex}
        transformOrigin={t.transformOrigin}
        translate={t.translation}
        scale={t.scaling}
        rotate={0}
      >
        <g
          data-attach-parent={parent.name}
          data-attach-type="nesting"
          data-attach-index={nestIndex}
        >
          {symbol}
        </g>
      </AttachmentTransform>
    );
  }

  return <>{children}</>;
};

const AttachedCreatureSymbol: React.FC<
  ChildCreatureSymbolProps & {
    attachTo: AttachmentPointType;
  }
> = ({ symbol, data, parent, indices, attachTo }) => {
  const ctx = useContext(CreatureContext);
  const children: JSX.Element[] = [];

  for (let attachIndex of indices) {
    const parentAp = safeGetAttachmentPoint(parent, attachTo, attachIndex);
    const ourAp = safeGetAttachmentPoint(data, "anchor");

    if (!parentAp || !ourAp) {
      continue;
    }

    // If we're attaching something oriented towards the left, horizontally flip
    // the attachment image.
    let xFlip = parentAp.normal.x < 0 ? -1 : 1;

    // Er, things look weird if we don't inverse the flip logic for
    // the downward-facing attachments, like legs...
    if (parentAp.normal.y > 0) {
      xFlip *= -1;
    }

    const t = getAttachmentTransforms(parentAp, {
      point: ourAp.point,
      normal: scalePointXY(ourAp.normal, xFlip, 1),
    });

    children.push(
      <AttachmentTransform
        key={attachIndex}
        transformOrigin={ourAp.point}
        translate={t.translation}
        scale={{ x: ctx.attachmentScale * xFlip, y: ctx.attachmentScale }}
        rotate={xFlip * t.rotation}
      >
        <g
          data-attach-parent={parent.name}
          data-attach-type={attachTo}
          data-attach-index={attachIndex}
        >
          {symbol}
        </g>
      </AttachmentTransform>
    );
  }

  return <>{children}</>;
};

export const CreatureSymbol: React.FC<CreatureSymbolProps> = (props) => {
  const ctx = useContext(CreatureContext);
  const { data, attachTo, nestInside } = props;
  const childCtx: CreatureContextType = { ...ctx, parent: data };
  const { nests, attachments } = splitCreatureSymbolChildren(props.children);

  // The attachments should be before our symbol in the DOM so they
  // appear behind our symbol, while anything nested within our symbol
  // should be after our symbol so they appear in front of it.
  const symbol = (
    <>
      {attachments.length && (
        <CreatureContext.Provider value={childCtx}>
          {attachments}
        </CreatureContext.Provider>
      )}
      <SvgSymbolContent data={data} {...ctx} />
      {nests.length && (
        <CreatureContext.Provider value={childCtx}>
          {nests}
        </CreatureContext.Provider>
      )}
    </>
  );

  if (!(attachTo || nestInside)) {
    return symbol;
  }

  const parent = ctx.parent;
  if (!parent) {
    throw new Error(
      `Cannot attach/nest ${props.data.name} because it has no parent!`
    );
  }

  const childProps: ChildCreatureSymbolProps = {
    parent,
    symbol,
    data,
    indices: props.indices || getAttachmentIndices(props),
  };

  if (attachTo) {
    return <AttachedCreatureSymbol {...childProps} attachTo={attachTo} />;
  }

  return <NestedCreatureSymbol {...childProps} />;
};

function getNestingTransforms(parent: BBox, child: BBox) {
  const parentCenter = getBoundingBoxCenter(parent);
  const childCenter = getBoundingBoxCenter(child);
  const translation = subtractPoints(parentCenter, childCenter);
  const uniformScaling = uniformlyScaleToFit(parent, child);
  const scaling: Point = { x: uniformScaling, y: uniformScaling };

  return { translation, transformOrigin: childCenter, scaling };
}

type AttachmentTransformProps = {
  transformOrigin: Point;
  translate: Point;
  scale: Point;
  rotate: number;
  children: JSX.Element;
};

const AttachmentTransform: React.FC<AttachmentTransformProps> = (props) => (
  <g transform={`translate(${props.translate.x} ${props.translate.y})`}>
    {/**
     * We originally used "transform-origin" here but that's not currently
     * supported by Safari. Instead, we'll set the origin of our symbol to
     * the transform origin, do the transform, and then move our origin back to
     * the original origin, which is equivalent to setting "transform-origin".
     **/}
    <g
      transform={`translate(${props.transformOrigin.x} ${props.transformOrigin.y})`}
    >
      <g
        transform={`scale(${props.scale.x} ${props.scale.y}) rotate(${props.rotate})`}
      >
        <g
          transform={`translate(-${props.transformOrigin.x} -${props.transformOrigin.y})`}
        >
          {props.children}
        </g>
      </g>
    </g>
  </g>
);

export type SimpleCreatureSymbolProps = Omit<CreatureSymbolProps, "data">;

/**
 * Create a factory that can be used to return React components to
 * render a `<CreatureSymbol>`.
 */
export function createCreatureSymbolFactory(
  getSymbol: (name: string) => SvgSymbolData
) {
  /**
   * Returns a React component that renders a `<CreatureSymbol>`, using the symbol
   * with the given name as its default data.
   */
  return function createCreatureSymbol(
    name: string
  ): React.FC<SimpleCreatureSymbolProps> {
    const data = getSymbol(name);
    const Component: React.FC<SimpleCreatureSymbolProps> = (props) => (
      <CreatureSymbol data={data} {...props} />
    );
    (Component as any)._isCreatedCreatureSymbol = true;
    Component.defaultProps = {
      data,
    };
    return Component;
  };
}

function normalizeNestedCreatureSymbol(
  el: JSX.Element
): NestedNormalizedCreatureSymbol {
  const base = normalizeCreatureSymbol(el);
  const props: SimpleCreatureSymbolProps = el.props;
  const indices = props.indices || getAttachmentIndices(props);
  const result: NestedNormalizedCreatureSymbol = {
    ...base,
    indices,
  };
  return result;
}

function normalizeAttachedCreatureSymbol(
  el: JSX.Element
): AttachedNormalizedCreatureSymbol {
  const base = normalizeNestedCreatureSymbol(el);
  const props: SimpleCreatureSymbolProps = el.props;
  const { attachTo } = props;
  if (!attachTo) {
    throw new Error("Expected attachment to have `attachTo` prop!");
  }
  const result: AttachedNormalizedCreatureSymbol = {
    ...base,
    attachTo,
  };
  return result;
}

export function normalizeCreatureSymbol(
  el: JSX.Element
): NormalizedCreatureSymbol {
  let data: SvgSymbolData;
  let props: SimpleCreatureSymbolProps;

  if (el.type === CreatureSymbol) {
    const eProps: CreatureSymbolProps = el.props;
    data = eProps.data;
    props = eProps;
  } else if (el.type._createdCreatureSymbolData) {
    const eProps: SimpleCreatureSymbolProps = el.props;
    data = el.type._createdCreatureSymbolData;
    props = eProps;
  } else {
    throw new Error("Found unknown component type!");
  }

  const { attachments, nests } = splitCreatureSymbolChildren(props.children);
  const result: NormalizedCreatureSymbol = {
    data,
    attachments: attachments.map(normalizeAttachedCreatureSymbol),
    nesting: nests.map(normalizeNestedCreatureSymbol),
  };
  return result;
}
