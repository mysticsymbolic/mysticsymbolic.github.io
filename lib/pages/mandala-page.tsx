import React, { useRef, useState } from "react";
import { AutoSizingSvg } from "../auto-sizing-svg";
import { getBoundingBoxCenter } from "../bounding-box";
import { ColorWidget } from "../color-widget";
import { DEFAULT_BG_COLOR } from "../colors";
import { ExportSvgButton } from "../export-svg";
import { HoverDebugHelper } from "../hover-debug-helper";
import { NumericSlider } from "../numeric-slider";
import {
  createSvgSymbolContext,
  safeGetAttachmentPoint,
  SvgSymbolContent,
  SvgSymbolContext,
  SvgSymbolData,
  swapColors,
} from "../svg-symbol";
import { VocabularyWidget } from "../vocabulary-widget";
import {
  svgRotate,
  svgScale,
  SvgTransform,
  svgTranslate,
} from "../svg-transform";
import { SvgVocabulary } from "../svg-vocabulary";
import { SymbolContextWidget } from "../symbol-context-widget";
import { NumericRange, range } from "../util";
import { Random } from "../random";
import { PointWithNormal } from "../specs";
import { getAttachmentTransforms } from "../attach";
import { Checkbox } from "../checkbox";

const CIRCLE_1_DEFAULTS: MandalaCircleParams = {
  data: SvgVocabulary.get("eye_vertical"),
  radius: 50,
  numSymbols: 6,
};

const CIRCLE_2_DEFAULTS: MandalaCircleParams = {
  data: SvgVocabulary.get("leg"),
  radius: 0,
  numSymbols: 3,
};

const CIRCLE_2_DEFAULT_SCALE = 0.5;

const RADIUS: NumericRange = {
  min: -1000,
  max: 1000,
  step: 1,
};

const NUM_SYMBOLS: NumericRange = {
  min: 1,
  max: 30,
  step: 1,
};

const SCALE: NumericRange = {
  min: 0.1,
  max: 2,
  step: 0.1,
};

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

type MandalaCircleParams = {
  data: SvgSymbolData;
  radius: number;
  numSymbols: number;
};

const MandalaCircle: React.FC<MandalaCircleParams & SvgSymbolContext> = (
  props
) => {
  const degreesPerItem = 360 / props.numSymbols;
  const { translation, rotation } = getAttachmentTransforms(
    {
      point: { x: 0, y: 0 },
      normal: { x: 0, y: -1 },
    },
    getAnchorOrCenter(props.data)
  );

  const symbol = (
    <SvgTransform
      transform={[
        svgTranslate({ x: 0, y: -props.radius }),
        svgRotate(rotation),
        svgTranslate(translation),
      ]}
    >
      <SvgSymbolContent {...props} />
    </SvgTransform>
  );

  const symbols = range(props.numSymbols)
    .reverse()
    .map((i) => (
      <SvgTransform
        key={i}
        transform={svgRotate(degreesPerItem * i)}
        children={symbol}
      />
    ));

  return <>{symbols}</>;
};

const MandalaCircleParamsWidget: React.FC<{
  idPrefix: string;
  value: MandalaCircleParams;
  onChange: (value: MandalaCircleParams) => void;
}> = ({ idPrefix, value, onChange }) => {
  return (
    <div className="thingy">
      <VocabularyWidget
        id={`${idPrefix}symbol`}
        label="Symbol"
        value={value.data}
        onChange={(data) => onChange({ ...value, data })}
        choices={SvgVocabulary}
      />
      <NumericSlider
        id={`${idPrefix}radius`}
        label="Radius"
        value={value.radius}
        onChange={(radius) => onChange({ ...value, radius })}
        {...RADIUS}
      />
      <NumericSlider
        id={`${idPrefix}numSymbols`}
        label="Number of symbols"
        value={value.numSymbols}
        onChange={(numSymbols) => onChange({ ...value, numSymbols })}
        {...NUM_SYMBOLS}
      />
    </div>
  );
};

function getRandomCircleParams(rng: Random): MandalaCircleParams {
  return {
    data: rng.choice(SvgVocabulary.items),
    radius: rng.inRange(RADIUS),
    numSymbols: rng.inRange(NUM_SYMBOLS),
  };
}

export const MandalaPage: React.FC<{}> = () => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [bgColor, setBgColor] = useState(DEFAULT_BG_COLOR);
  const [circle1, setCircle1] = useState<MandalaCircleParams>(
    CIRCLE_1_DEFAULTS
  );
  const [circle2, setCircle2] = useState<MandalaCircleParams>(
    CIRCLE_2_DEFAULTS
  );
  const [symbolCtx, setSymbolCtx] = useState(createSvgSymbolContext());
  const [useTwoCircles, setUseTwoCircles] = useState(false);
  const [invertCircle2, setInvertCircle2] = useState(true);
  const [circle2Scale, setCircle2Scale] = useState(CIRCLE_2_DEFAULT_SCALE);
  const randomize = () => {
    const rng = new Random(Date.now());
    setCircle1(getRandomCircleParams(rng));
    setCircle2(getRandomCircleParams(rng));
    setCircle2Scale(rng.inRange(SCALE));
  };

  const circle2SymbolCtx = invertCircle2 ? swapColors(symbolCtx) : symbolCtx;

  return (
    <>
      <h1>Mandala!</h1>
      <SymbolContextWidget ctx={symbolCtx} onChange={setSymbolCtx}>
        <ColorWidget label="Background" value={bgColor} onChange={setBgColor} />{" "}
      </SymbolContextWidget>
      <fieldset>
        <legend>First circle</legend>
        <MandalaCircleParamsWidget
          idPrefix="c1"
          value={circle1}
          onChange={setCircle1}
        />
      </fieldset>
      <div className="thingy">
        <Checkbox
          label="Add a second circle"
          value={useTwoCircles}
          onChange={setUseTwoCircles}
        />
      </div>
      {useTwoCircles && (
        <fieldset>
          <legend>Second circle</legend>
          <MandalaCircleParamsWidget
            idPrefix="c2"
            value={circle2}
            onChange={setCircle2}
          />
          <NumericSlider
            label="Scale"
            value={circle2Scale}
            onChange={setCircle2Scale}
            {...SCALE}
          />
          <Checkbox
            label="Invert colors"
            value={invertCircle2}
            onChange={setInvertCircle2}
          />
        </fieldset>
      )}
      <div className="thingy">
        <button accessKey="r" onClick={randomize}>
          <u>R</u>andomize!
        </button>{" "}
        <ExportSvgButton filename="mandala.svg" svgRef={svgRef} />
      </div>
      <HoverDebugHelper>
        <AutoSizingSvg padding={20} ref={svgRef} bgColor={bgColor}>
          <SvgTransform transform={svgScale(0.5)}>
            <MandalaCircle {...circle1} {...symbolCtx} />
            {useTwoCircles && (
              <SvgTransform transform={svgScale(circle2Scale)}>
                <MandalaCircle {...circle2} {...circle2SymbolCtx} />
              </SvgTransform>
            )}
          </SvgTransform>
        </AutoSizingSvg>
      </HoverDebugHelper>
    </>
  );
};
