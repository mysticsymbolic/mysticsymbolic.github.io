import React, { useContext } from "react";
import { BBox, Point } from "../vendor/bezier-js";
import { getAttachmentTransforms } from "./attach";
import { getBoundingBoxCenter, uniformlyScaleToFit } from "./bounding-box";
import { scalePointXY, subtractPoints } from "./point";
import { AttachmentPointType } from "./specs";
import {
  createSvgSymbolContext,
  safeGetAttachmentPoint,
  SvgSymbolContent,
  SvgSymbolContext,
  SvgSymbolData,
  swapColors,
} from "./svg-symbol";
import {
  svgRotate,
  svgScale,
  svgTransformOrigin,
  SvgTransform,
  svgTranslate,
} from "./svg-transform";

const DEFAULT_ATTACHMENT_SCALE = 0.5;

export type CreatureContextType = SvgSymbolContext & {
  attachmentScale: number;
  parent: SvgSymbolData | null;
};

export const CreatureContext = React.createContext<CreatureContextType>({
  ...createSvgSymbolContext(),
  attachmentScale: DEFAULT_ATTACHMENT_SCALE,
  parent: null,
});

export type AttachedCreatureSymbol = CreatureSymbol & {
  attachTo: AttachmentPointType;
  indices: number[];
};

export type NestedCreatureSymbol = CreatureSymbol & {
  indices: number[];
};

export type CreatureSymbol = {
  data: SvgSymbolData;
  invertColors: boolean;
  attachments: AttachedCreatureSymbol[];
  nests: NestedCreatureSymbol[];
};

export type CreatureSymbolProps = CreatureSymbol;

type NestedCreatureSymbolProps = NestedCreatureSymbol & {
  parent: SvgSymbolData;
};

type AttachedCreatureSymbolProps = AttachedCreatureSymbol & {
  parent: SvgSymbolData;
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
  /**
   * Where to move the attachment once it has been
   * scaled and rotated.
   */
  translate: Point;

  /** The origin from which scaling and rotation are done. */
  transformOrigin: Point;

  /** How much to scale the attachment, relative to `transformOrigin`. */
  scale: Point;

  /** How much to rotate the attachment, relative to `transformOrigin`. */
  rotate?: number;

  /** The attachment. */
  children: JSX.Element;
};

/**
 * A wrapper for an attachment that rotates and/or scales it relative
 * to the given origin point, and then translates it the given amount.
 */
const AttachmentTransform: React.FC<AttachmentTransformProps> = (props) => (
  <SvgTransform
    transform={[
      // Remember that transforms are applied in reverse order,
      // so read the following from the end first!
      svgTranslate(props.translate),
      svgTransformOrigin(props.transformOrigin, [
        svgScale(props.scale),
        svgRotate(props.rotate ?? 0),
      ]),
    ]}
  >
    {props.children}
  </SvgTransform>
);

const AttachedCreatureSymbol: React.FC<AttachedCreatureSymbolProps> = ({
  indices,
  parent,
  attachTo,
  data,
  ...props
}) => {
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
          <CreatureSymbol data={data} {...props} />
        </g>
      </AttachmentTransform>
    );
  }

  return <>{children}</>;
};

const NestedCreatureSymbol: React.FC<NestedCreatureSymbolProps> = ({
  indices,
  parent,
  data,
  ...props
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
      >
        <g
          data-attach-parent={parent.name}
          data-attach-type="nesting"
          data-attach-index={nestIndex}
        >
          <CreatureSymbol data={data} {...props} />
        </g>
      </AttachmentTransform>
    );
  }

  return <>{children}</>;
};

export const CreatureSymbol: React.FC<CreatureSymbolProps> = (props) => {
  let ctx = useContext(CreatureContext);
  const { data, attachments, nests } = props;
  const attachmentCtx: CreatureContextType = { ...ctx, parent: data };

  if (props.invertColors) {
    ctx = swapColors(ctx);
  }

  // If we're inverted, then pass our inverted colors on to our
  // nested children, to maintain color balance in the composition.
  const nestedCtx: CreatureContextType = { ...ctx, parent: data };

  // The attachments should be before our symbol in the DOM so they
  // appear behind our symbol, while anything nested within our symbol
  // should be after our symbol so they appear in front of it.
  return (
    <>
      {attachments.length && (
        <CreatureContext.Provider value={attachmentCtx}>
          {attachments.map((a, i) => (
            <AttachedCreatureSymbol key={i} {...a} parent={data} />
          ))}
        </CreatureContext.Provider>
      )}
      <SvgSymbolContent data={data} {...ctx} />
      {nests.length && (
        <CreatureContext.Provider value={nestedCtx}>
          {nests.map((n, i) => (
            <NestedCreatureSymbol key={i} {...n} parent={data} />
          ))}
        </CreatureContext.Provider>
      )}
    </>
  );
};
