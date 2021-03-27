import React, { useRef, useState } from "react";
import { AutoSizingSvg } from "../auto-sizing-svg";
import { getBoundingBoxCenter } from "../bounding-box";
import { ColorWidget } from "../color-widget";
import { DEFAULT_BG_COLOR } from "../colors";
import { ExportSvgButton } from "../export-svg";
import { HoverDebugHelper } from "../hover-debug-helper";
import { NumericSlider } from "../numeric-slider";
import { reversePoint } from "../point";
import {
  createSvgSymbolContext,
  SvgSymbolContent,
  SvgSymbolContext,
  SvgSymbolData,
} from "../svg-symbol";
import { SvgSymbolWidget } from "../svg-symbol-widget";
import {
  svgRotate,
  svgScale,
  SvgTransforms,
  svgTranslate,
} from "../svg-transform";
import { getSvgSymbol, SvgVocabulary } from "../svg-vocabulary";
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
  const svgRef = useRef<SVGSVGElement>(null);
  const [bgColor, setBgColor] = useState(DEFAULT_BG_COLOR);
  const [symbol, setSymbol] = useState(EYE);
  const [symbolCtx, setSymbolCtx] = useState(createSvgSymbolContext());
  const [radius, setRadius] = useState(400);
  const [numSymbols, setNumSymbols] = useState(6);

  return (
    <>
      <h1>Mandala!</h1>
      <SymbolContextWidget ctx={symbolCtx} onChange={setSymbolCtx}>
        <ColorWidget
          label="Background"
          id="bgColor"
          value={bgColor}
          onChange={setBgColor}
        />{" "}
      </SymbolContextWidget>
      <p>
        <SvgSymbolWidget
          label="Symbol"
          value={symbol}
          onChange={setSymbol}
          choices={SvgVocabulary}
        />
        <NumericSlider
          id="radius"
          label="Radius"
          value={radius}
          onChange={setRadius}
          min={0}
          max={1000}
          step={1}
        />
        <NumericSlider
          id="symbols"
          label="Numer of symbols"
          value={numSymbols}
          onChange={setNumSymbols}
          min={1}
          max={30}
          step={1}
        />
      </p>
      <p>
        <ExportSvgButton filename="mandala.svg" svgRef={svgRef} />
      </p>
      <HoverDebugHelper>
        <AutoSizingSvg padding={20} ref={svgRef} bgColor={bgColor}>
          <SvgTransforms transforms={[svgScale(0.5)]}>
            <MandalaCircle
              data={symbol}
              radius={radius}
              numSymbols={numSymbols}
              {...symbolCtx}
            />
          </SvgTransforms>
        </AutoSizingSvg>
      </HoverDebugHelper>
    </>
  );
};
