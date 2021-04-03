import React from "react";

import { getAttachmentTransforms } from "./attach";
import { getBoundingBoxCenter } from "./bounding-box";
import { PointWithNormal } from "./specs";
import {
  safeGetAttachmentPoint,
  SvgSymbolContent,
  SvgSymbolContext,
  SvgSymbolData,
  swapColors,
} from "./svg-symbol";
import { svgRotate, SvgTransform, svgTranslate } from "./svg-transform";
import { range } from "./util";

/**
 * Returns the anchor point of the given symbol; if it doesn't have
 * an anchor point, return a reasonable default one by taking the
 * center of the symbol and having the normal point along the negative
 * y-axis (i.e., up).
 */
function getAnchorOrCenter(symbol: SvgSymbolData): PointWithNormal {
  return (
    safeGetAttachmentPoint(symbol, "anchor") || {
      point: getBoundingBoxCenter(symbol.bbox),
      normal: { x: 0, y: -1 },
    }
  );
}

export type MandalaCircleParams = {
  data: SvgSymbolData;
  radius: number;
  numSymbols: number;
  symbolTransforms?: SvgTransform[];
  invertEveryOtherSymbol: boolean;
};

export type MandalaCircleProps = MandalaCircleParams & SvgSymbolContext;

function isEvenNumber(value: number) {
  return value % 2 === 0;
}

export const MandalaCircle: React.FC<MandalaCircleProps> = (props) => {
  const degreesPerItem = 360 / props.numSymbols;
  const { translation, rotation } = getAttachmentTransforms(
    {
      point: { x: 0, y: 0 },
      normal: { x: 0, y: -1 },
    },
    getAnchorOrCenter(props.data)
  );
  const transform: SvgTransform[] = [
    // Remember that transforms are applied in reverse order,
    // so read the following from the end first!

    // Finally, move the symbol out along the radius of the circle.
    svgTranslate({ x: 0, y: -props.radius }),

    // Then apply any individual symbol transformations.
    ...(props.symbolTransforms || []),

    // First, re-orient the symbol so its anchor point is at
    // the origin and facing the proper direction.
    svgRotate(rotation),
    svgTranslate(translation),
  ];

  const invertEveryOtherSymbol =
    isEvenNumber(props.numSymbols) && props.invertEveryOtherSymbol;

  const symbols = range(props.numSymbols)
    .reverse()
    .map((i) => (
      <SvgTransform
        key={i}
        transform={[svgRotate(degreesPerItem * i), ...transform]}
      >
        {invertEveryOtherSymbol && isEvenNumber(i) ? (
          <SvgSymbolContent {...swapColors(props)} />
        ) : (
          <SvgSymbolContent {...props} />
        )}
      </SvgTransform>
    ));

  return <>{symbols}</>;
};
