import React, { useRef, useState } from "react";
import { AutoSizingSvg } from "../auto-sizing-svg";
import { ExportWidget } from "../export-svg";
import { HoverDebugHelper } from "../hover-debug-helper";
import { NumericSlider } from "../numeric-slider";
import {
  noFillIfShowingSpecs,
  SvgSymbolContext,
  swapColors,
} from "../svg-symbol";
import { VocabularyWidget } from "../vocabulary-widget";
import { svgRotate, svgScale, SvgTransform } from "../svg-transform";
import { SvgVocabulary } from "../svg-vocabulary";
import { isEvenNumber, NumericRange } from "../util";
import { Random } from "../random";
import { Checkbox } from "../checkbox";
import {
  CompositionContextWidget,
  createSvgCompositionContext,
} from "../svg-composition-context";
import { Page } from "../page";
import { MandalaCircle, MandalaCircleParams } from "../mandala-circle";
import { useAnimationPct } from "../animation";
import { RandomizerWidget } from "../randomizer-widget";

type ExtendedMandalaCircleParams = MandalaCircleParams & {
  scaling: number;
  rotation: number;
  symbolScaling: number;
  symbolRotation: number;
  animateSymbolRotation: boolean;
};

const CIRCLE_1_DEFAULTS: ExtendedMandalaCircleParams = {
  data: SvgVocabulary.get("eye"),
  radius: 300,
  numSymbols: 5,
  scaling: 1,
  rotation: 0,
  symbolScaling: 1,
  symbolRotation: 0,
  invertEveryOtherSymbol: false,
  animateSymbolRotation: false,
};

const CIRCLE_2_DEFAULTS: ExtendedMandalaCircleParams = {
  data: SvgVocabulary.get("leg"),
  radius: 0,
  numSymbols: 3,
  scaling: 0.5,
  rotation: 0,
  symbolScaling: 1,
  symbolRotation: 0,
  invertEveryOtherSymbol: false,
  animateSymbolRotation: false,
};

const RADIUS: NumericRange = {
  min: -500,
  max: 500,
  step: 1,
};

const RADIUS_RANDOM: NumericRange = {
  min: 100,
  max: RADIUS.max,
  step: 1,
};

const NUM_SYMBOLS: NumericRange = {
  min: 1,
  max: 20,
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

const DURATION_SECS: NumericRange = {
  min: 0.5,
  max: 10,
  step: 0.1,
};

const DEFAULT_DURATION_SECS = 3;

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

function animateMandalaCircleParams(
  value: ExtendedMandalaCircleParams,
  animPct: number
): ExtendedMandalaCircleParams {
  if (value.animateSymbolRotation) {
    value = {
      ...value,
      symbolRotation: animPct * ROTATION.max,
    };
  }
  return value;
}

function isAnyMandalaCircleAnimated(
  values: ExtendedMandalaCircleParams[]
): boolean {
  return values.some((value) => value.animateSymbolRotation);
}

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
        disabled={value.animateSymbolRotation}
        value={value.symbolRotation}
        onChange={(symbolRotation) => onChange({ ...value, symbolRotation })}
        {...ROTATION}
      />
      <Checkbox
        label="Animate symbol rotation"
        value={value.animateSymbolRotation}
        onChange={(animateSymbolRotation) =>
          onChange({ ...value, animateSymbolRotation })
        }
      />
      <Checkbox
        label="Invert every other symbol (applies only to circles with an even number of symbols)"
        disabled={!isEvenNumber(value.numSymbols)}
        value={value.invertEveryOtherSymbol}
        onChange={(invertEveryOtherSymbol) =>
          onChange({ ...value, invertEveryOtherSymbol })
        }
      />
    </div>
  );
};

function getRandomCircleParams(rng: Random): MandalaCircleParams {
  return {
    data: rng.choice(SvgVocabulary.items),
    radius: rng.inRange(RADIUS_RANDOM),
    numSymbols: rng.inRange(NUM_SYMBOLS),
    invertEveryOtherSymbol: rng.bool(),
  };
}

export const MandalaPage: React.FC<{}> = () => {
  const svgRef = useRef<SVGSVGElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const [circle1, setCircle1] = useState(CIRCLE_1_DEFAULTS);
  const [circle2, setCircle2] = useState(CIRCLE_2_DEFAULTS);
  const [durationSecs, setDurationSecs] = useState(DEFAULT_DURATION_SECS);
  const [baseCompCtx, setBaseCompCtx] = useState(createSvgCompositionContext());
  const [useTwoCircles, setUseTwoCircles] = useState(false);
  const [invertCircle2, setInvertCircle2] = useState(true);
  const [firstBehindSecond, setFirstBehindSecond] = useState(false);
  const durationMsecs = durationSecs * 1000;
  const isAnimated = isAnyMandalaCircleAnimated([circle1, circle2]);
  const animPct = useAnimationPct(isAnimated ? durationMsecs : 0);
  const symbolCtx = noFillIfShowingSpecs(baseCompCtx);

  const circle2SymbolCtx = invertCircle2 ? swapColors(symbolCtx) : symbolCtx;

  const makeMandala = (animPct: number): JSX.Element => {
    const circles = [
      <ExtendedMandalaCircle
        key="first"
        {...animateMandalaCircleParams(circle1, animPct)}
        {...symbolCtx}
      />,
    ];

    if (useTwoCircles) {
      circles.push(
        <ExtendedMandalaCircle
          key="second"
          {...animateMandalaCircleParams(circle2, animPct)}
          {...circle2SymbolCtx}
        />
      );
      if (firstBehindSecond) {
        circles.reverse();
      }
    }

    return <SvgTransform transform={svgScale(0.5)}>{circles}</SvgTransform>;
  };

  return (
    <Page title="Mandala!">
      <div className="sidebar">
        <CompositionContextWidget ctx={baseCompCtx} onChange={setBaseCompCtx} />
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
        {isAnimated && (
          <NumericSlider
            label="Animation loop duration"
            valueSuffix="s"
            value={durationSecs}
            onChange={(duration) => setDurationSecs(duration)}
            {...DURATION_SECS}
          />
        )}
        <RandomizerWidget
          onColorsChange={(colors) =>
            setBaseCompCtx({ ...baseCompCtx, ...colors })
          }
          onSymbolsChange={(rng) => {
            setCircle1({ ...circle1, ...getRandomCircleParams(rng) });
            setCircle2({ ...circle2, ...getRandomCircleParams(rng) });
          }}
        />
        <div className="thingy">
          <ExportWidget
            basename="mandala"
            svgRef={svgRef}
            animate={
              isAnimated && { duration: durationMsecs, render: makeMandala }
            }
          />
        </div>
      </div>
      <div
        className="canvas"
        style={{ backgroundColor: baseCompCtx.background }}
        ref={canvasRef}
      >
        <HoverDebugHelper>
          <AutoSizingSvg
            ref={svgRef}
            bgColor={baseCompCtx.background}
            sizeToElement={canvasRef}
          >
            {makeMandala(animPct)}
          </AutoSizingSvg>
        </HoverDebugHelper>
      </div>
    </Page>
  );
};
