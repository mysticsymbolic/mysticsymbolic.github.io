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
import { VocabularyWidget } from "../vocabulary-widget";
import {
  svgRotate,
  svgScale,
  SvgTransforms,
  svgTranslate,
} from "../svg-transform";
import { SvgVocabulary } from "../svg-vocabulary";
import { SymbolContextWidget } from "../symbol-context-widget";
import { NumericRange, range } from "../util";
import { Random } from "../random";

const EYE = SvgVocabulary.get("eye");

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

type NumericParams = NumericRange & { default: number };

const RADIUS: NumericParams = {
  min: 0,
  max: 1000,
  step: 1,
  default: 400,
};

const NUM_SYMBOLS: NumericParams = {
  min: 1,
  max: 30,
  step: 1,
  default: 6,
};

export const MandalaPage: React.FC<{}> = () => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [bgColor, setBgColor] = useState(DEFAULT_BG_COLOR);
  const [symbol, setSymbol] = useState(EYE);
  const [symbolCtx, setSymbolCtx] = useState(createSvgSymbolContext());
  const [radius, setRadius] = useState(RADIUS.default);
  const [numSymbols, setNumSymbols] = useState(NUM_SYMBOLS.default);
  const randomize = () => {
    const rng = new Random(Date.now());
    setRadius(rng.inRange(RADIUS));
    setNumSymbols(rng.inRange(NUM_SYMBOLS));
    setSymbol(rng.choice(SvgVocabulary.items));
  };

  return (
    <>
      <h1>Mandala!</h1>
      <SymbolContextWidget ctx={symbolCtx} onChange={setSymbolCtx}>
        <ColorWidget label="Background" value={bgColor} onChange={setBgColor} />{" "}
      </SymbolContextWidget>
      <div className="thingy">
        <VocabularyWidget
          label="Symbol"
          value={symbol}
          onChange={setSymbol}
          choices={SvgVocabulary}
        />
        <NumericSlider
          label="Radius"
          value={radius}
          onChange={setRadius}
          {...RADIUS}
        />
        <NumericSlider
          label="Numer of symbols"
          value={numSymbols}
          onChange={setNumSymbols}
          {...NUM_SYMBOLS}
        />
      </div>
      <div className="thingy">
        <button accessKey="r" onClick={randomize}>
          <u>R</u>andomize!
        </button>{" "}
        <ExportSvgButton filename="mandala.svg" svgRef={svgRef} />
      </div>
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