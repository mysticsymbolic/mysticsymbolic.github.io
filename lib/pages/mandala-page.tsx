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

type ExtendedMandalaCircleParams = MandalaCircleParams & {
  scaling: number;
  rotation: number;
  symbolScaling: number;
  symbolRotation: number;
};

const CIRCLE_1_DEFAULTS: ExtendedMandalaCircleParams = {
  data: SvgVocabulary.get("eye"),
  radius: 300,
  numSymbols: 5,
  scaling: 1,
  rotation: 0,
  symbolScaling: 1,
  symbolRotation: 0,
};

const CIRCLE_2_DEFAULTS: ExtendedMandalaCircleParams = {
  data: SvgVocabulary.get("leg"),
  radius: 0,
  numSymbols: 3,
  scaling: 0.5,
  rotation: 0,
  symbolScaling: 1,
  symbolRotation: 0,
};

const RADIUS: NumericRange = {
  min: -500,
  max: 500,
  step: 1,
};

const NUM_SYMBOLS: NumericRange = {
  min: 1,
  max: 30,
  step: 1,
};

const SCALING: NumericRange = {
  min: 0.1,
  max: 1,
  step: 0.05,
};

const ROTATION: NumericRange = {
  min: 0,
  max: 359,
  step: 1,
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
  symbolTransforms?: SvgTransform[];
};

type MandalaCircleProps = MandalaCircleParams & SvgSymbolContext;

const MandalaCircle: React.FC<MandalaCircleProps> = (props) => {
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

const ExtendedMandalaCircle: React.FC<
  ExtendedMandalaCircleParams & SvgSymbolContext
> = ({ scaling, rotation, symbolScaling, symbolRotation, ...props }) => {
  props = {
    ...props,
    symbolTransforms: [svgScale(symbolScaling), svgRotate(symbolRotation)],
  };

  return (
    <SvgTransform transform={[svgScale(scaling), svgRotate(rotation)]}>
      <MandalaCircle {...props} />
    </SvgTransform>
  );
};

const ExtendedMandalaCircleParamsWidget: React.FC<{
  idPrefix: string;
  value: ExtendedMandalaCircleParams;
  onChange: (value: ExtendedMandalaCircleParams) => void;
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
      <NumericSlider
        id={`${idPrefix}scaling`}
        label="Scaling"
        value={value.scaling}
        onChange={(scaling) => onChange({ ...value, scaling })}
        {...SCALING}
      />
      <NumericSlider
        id={`${idPrefix}rotation`}
        label="Rotation"
        value={value.rotation}
        onChange={(rotation) => onChange({ ...value, rotation })}
        {...ROTATION}
      />
      <NumericSlider
        id={`${idPrefix}symbolScaling`}
        label="Symbol scaling"
        value={value.symbolScaling}
        onChange={(symbolScaling) => onChange({ ...value, symbolScaling })}
        {...SCALING}
      />
      <NumericSlider
        id={`${idPrefix}symbolRotation`}
        label="Symbol rotation"
        value={value.symbolRotation}
        onChange={(symbolRotation) => onChange({ ...value, symbolRotation })}
        {...ROTATION}
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
  const [circle1, setCircle1] = useState(CIRCLE_1_DEFAULTS);
  const [circle2, setCircle2] = useState(CIRCLE_2_DEFAULTS);
  const [symbolCtx, setSymbolCtx] = useState(createSvgSymbolContext());
  const [useTwoCircles, setUseTwoCircles] = useState(false);
  const [invertCircle2, setInvertCircle2] = useState(true);
  const [firstBehindSecond, setFirstBehindSecond] = useState(false);
  const randomize = () => {
    const rng = new Random(Date.now());
    setCircle1({ ...circle1, ...getRandomCircleParams(rng) });
    setCircle2({ ...circle2, ...getRandomCircleParams(rng) });
  };

  const circle2SymbolCtx = invertCircle2 ? swapColors(symbolCtx) : symbolCtx;

  const circles = [
    <ExtendedMandalaCircle key="first" {...circle1} {...symbolCtx} />,
  ];

  if (useTwoCircles) {
    circles.push(
      <ExtendedMandalaCircle key="second" {...circle2} {...circle2SymbolCtx} />
    );
    if (firstBehindSecond) {
      circles.reverse();
    }
  }

  return (
    <>
      <h1>Mandala!</h1>
      <SymbolContextWidget ctx={symbolCtx} onChange={setSymbolCtx}>
        <ColorWidget label="Background" value={bgColor} onChange={setBgColor} />{" "}
      </SymbolContextWidget>
      <fieldset>
        <legend>First circle</legend>
        <ExtendedMandalaCircleParamsWidget
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
          <ExtendedMandalaCircleParamsWidget
            idPrefix="c2"
            value={circle2}
            onChange={setCircle2}
          />
          <Checkbox
            label="Invert colors"
            value={invertCircle2}
            onChange={setInvertCircle2}
          />{" "}
          <Checkbox
            label="Place behind first circle"
            value={firstBehindSecond}
            onChange={setFirstBehindSecond}
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
          <SvgTransform transform={svgScale(0.5)}>{circles}</SvgTransform>
        </AutoSizingSvg>
      </HoverDebugHelper>
    </>
  );
};
