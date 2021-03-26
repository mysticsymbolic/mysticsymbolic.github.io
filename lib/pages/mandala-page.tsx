import React, { useState } from "react";
import { AutoSizingSvg } from "../auto-sizing-svg";
import { getBoundingBoxCenter } from "../bounding-box";
import { HoverDebugHelper } from "../hover-debug-helper";
import { reversePoint } from "../point";
import {
  createSvgSymbolContext,
  SvgSymbolContent,
  SvgSymbolContext,
  SvgSymbolData,
} from "../svg-symbol";
import {
  svgRotate,
  svgScale,
  SvgTransforms,
  svgTranslate,
} from "../svg-transform";
import { getSvgSymbol } from "../svg-vocabulary";
import { SymbolContextWidget } from "../symbol-context-widget";
import { range } from "../util";

const EYE = getSvgSymbol("eye");

const MandalaCircle: React.FC<
  {
    data: SvgSymbolData;
    radius: number;
    numSymbols: number;
  } & SvgSymbolContext
> = (props) => {
  const center = getBoundingBoxCenter(props.data.bbox);
  const degreesPerItem = 360 / props.numSymbols;
  const symbol = (
    <SvgTransforms
      transforms={[
        svgTranslate({ x: props.radius, y: 0 }),
        svgTranslate(reversePoint(center)),
      ]}
    >
      <SvgSymbolContent {...props} />
    </SvgTransforms>
  );

  const symbols = range(props.numSymbols).map((i) => (
    <SvgTransforms
      key={i}
      transforms={[svgRotate(degreesPerItem * i)]}
      children={symbol}
    />
  ));

  return <>{symbols}</>;
};

export const MandalaPage: React.FC<{}> = () => {
  const [symbolCtx, setSymbolCtx] = useState(createSvgSymbolContext());

  return (
    <>
      <h1>Mandala!</h1>
      <SymbolContextWidget ctx={symbolCtx} onChange={setSymbolCtx} />
      <HoverDebugHelper>
        <AutoSizingSvg padding={20}>
          <SvgTransforms transforms={[svgScale(0.5)]}>
            <MandalaCircle
              data={EYE}
              radius={400}
              numSymbols={6}
              {...symbolCtx}
            />
          </SvgTransforms>
        </AutoSizingSvg>
      </HoverDebugHelper>
    </>
  );
};
