import React, { useMemo, useRef, useState } from "react";
import { AutoSizingSvg } from "../auto-sizing-svg";
import { AnimationRenderer, ExportWidget } from "../export-svg";
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
import { isEvenNumber, NumericRange, secsToMsecs } from "../util";
import { Random } from "../random";
import { Checkbox } from "../checkbox";
import {
  CompositionContextWidget,
  createSvgCompositionContext,
  SvgCompositionContext,
} from "../svg-composition-context";
import { Page } from "../page";
import {
  MandalaCircle,
  MandalaCircleParams,
  MandalaCircleProps,
} from "../mandala-circle";
import { useAnimationPct } from "../animation";
import { RandomizerWidget } from "../randomizer-widget";
import { useDebouncedEffect } from "../use-debounced-effect";
import { createPageWithShareableState } from "../page-with-shareable-state";
import MandalaAvsc from "./mandala-page.avsc.json";
import type {
  AvroCircle,
  AvroMandalaDesign,
  AvroSvgCompositionContext,
} from "./mandala-page.avsc";
import { SlowBuffer } from "buffer";
import * as avro from "avro-js";

type CircleConfig = MandalaCircleParams & {
  scaling: number;
  rotation: number;
  symbolScaling: number;
  symbolRotation: number;
  animateSymbolRotation: boolean;
};

const CIRCLE_1_DEFAULTS: CircleConfig = {
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

const CIRCLE_2_DEFAULTS: CircleConfig = {
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

const ExtendedMandalaCircle: React.FC<CircleConfig & SvgSymbolContext> = ({
  scaling,
  rotation,
  symbolScaling,
  symbolRotation,
  ...props
}) => {
  const circleProps: MandalaCircleProps = {
    ...props,
    symbolTransforms: [svgScale(symbolScaling), svgRotate(symbolRotation)],
  };

  return (
    <SvgTransform transform={[svgScale(scaling), svgRotate(rotation)]}>
      <MandalaCircle {...circleProps} />
    </SvgTransform>
  );
};

function animateMandalaCircleParams(
  value: CircleConfig,
  animPct: number
): CircleConfig {
  if (value.animateSymbolRotation) {
    const direction = value.data.meta?.rotate_clockwise ? 1 : -1;
    value = {
      ...value,
      symbolRotation: direction * animPct * ROTATION.max,
    };
  }
  return value;
}

const ExtendedMandalaCircleParamsWidget: React.FC<{
  idPrefix: string;
  value: CircleConfig;
  onChange: (value: CircleConfig) => void;
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

function getRandomCircleParams(rng: Random): Partial<CircleConfig> {
  return {
    data: rng.choice(SvgVocabulary.items),
    radius: rng.inRange(RADIUS_RANDOM),
    numSymbols: rng.inRange(NUM_SYMBOLS),
    invertEveryOtherSymbol: rng.bool(),
  };
}

const DESIGN_DEFAULTS = {
  circle1: CIRCLE_1_DEFAULTS,
  circle2: CIRCLE_2_DEFAULTS,
  durationSecs: DEFAULT_DURATION_SECS,
  baseCompCtx: createSvgCompositionContext(),
  useTwoCircles: false,
  invertCircle2: true,
  firstBehind: false,
};

type DesignConfig = typeof DESIGN_DEFAULTS;

function isDesignAnimated({ circle1, circle2 }: DesignConfig): boolean {
  return [circle1, circle2].some((value) => value.animateSymbolRotation);
}

function createAnimationRenderer({
  baseCompCtx,
  invertCircle2,
  circle1,
  circle2,
  useTwoCircles,
  firstBehind,
}: DesignConfig): AnimationRenderer {
  const symbolCtx = noFillIfShowingSpecs(baseCompCtx);
  const circle2SymbolCtx = invertCircle2 ? swapColors(symbolCtx) : symbolCtx;

  return (animPct) => {
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
      if (firstBehind) {
        circles.reverse();
      }
    }

    return <SvgTransform transform={svgScale(0.5)}>{circles}</SvgTransform>;
  };
}

const AnimatedMandala: React.FC<{
  config: DesignConfig;
  render: AnimationRenderer;
}> = ({ config, render }) => {
  const animPct = useAnimationPct(
    isDesignAnimated(config) ? secsToMsecs(config.durationSecs) : 0
  );

  return <>{render(animPct)}</>;
};

const MandalaPageWithDefaults: React.FC<{
  defaults: DesignConfig;
  onChange: (defaults: DesignConfig) => void;
}> = ({ defaults, onChange }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const [circle1, setCircle1] = useState(defaults.circle1);
  const [circle2, setCircle2] = useState(defaults.circle2);
  const [durationSecs, setDurationSecs] = useState(defaults.durationSecs);
  const [baseCompCtx, setBaseCompCtx] = useState(defaults.baseCompCtx);
  const [useTwoCircles, setUseTwoCircles] = useState(defaults.useTwoCircles);
  const [invertCircle2, setInvertCircle2] = useState(defaults.invertCircle2);
  const [firstBehind, setFirstBehind] = useState(defaults.firstBehind);
  const design: DesignConfig = useMemo(
    () => ({
      circle1,
      circle2,
      durationSecs,
      baseCompCtx,
      useTwoCircles,
      invertCircle2,
      firstBehind,
    }),
    [
      circle1,
      circle2,
      durationSecs,
      baseCompCtx,
      useTwoCircles,
      invertCircle2,
      firstBehind,
    ]
  );
  const isAnimated = isDesignAnimated(design);
  const render = useMemo(() => createAnimationRenderer(design), [design]);

  useDebouncedEffect(250, () => onChange(design), [onChange, design]);

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
              value={firstBehind}
              onChange={setFirstBehind}
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
              isAnimated && { duration: secsToMsecs(durationSecs), render }
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
            <AnimatedMandala config={defaults} render={render} />
          </AutoSizingSvg>
        </HoverDebugHelper>
      </div>
    </Page>
  );
};

const avroType = avro.parse<AvroMandalaDesign>(MandalaAvsc);

interface Converter<A, B> {
  to(value: A): B;
  from(value: B): A;
}

const AvroCircleConverter: Converter<CircleConfig, AvroCircle> = {
  to: ({ data, ...circle }) => ({
    ...circle,
    symbol: data.name,
  }),
  from: ({ symbol, ...circle }) => ({
    ...circle,
    data: SvgVocabulary.get(symbol),
  }),
};

const AvroCompCtxConverter: Converter<
  SvgCompositionContext,
  AvroSvgCompositionContext
> = {
  to: (ctx) => ({
    ...ctx,
    uniformStrokeWidth: ctx.uniformStrokeWidth || 1,
  }),
  from: (ctx) => ({ ...ctx, showSpecs: false }),
};

const AvroDesignConverter: Converter<DesignConfig, AvroMandalaDesign> = {
  to: (value) => {
    const circles: AvroCircle[] = [AvroCircleConverter.to(value.circle1)];
    if (value.useTwoCircles) {
      circles.push(AvroCircleConverter.to(value.circle2));
    }
    return {
      ...value,
      circles,
      baseCompCtx: AvroCompCtxConverter.to(value.baseCompCtx),
    };
  },
  from: (value) => {
    if (value.circles.length === 0) {
      throw new Error(`Circles must have at least one item!`);
    }
    const useTwoCircles = value.circles.length > 1;
    const circle1 = AvroCircleConverter.from(value.circles[0]);
    const circle2 = useTwoCircles
      ? AvroCircleConverter.from(value.circles[1])
      : CIRCLE_2_DEFAULTS;
    return {
      ...value,
      baseCompCtx: AvroCompCtxConverter.from(value.baseCompCtx),
      circle1,
      circle2,
      useTwoCircles,
    };
  },
};

function serialize(value: DesignConfig): string {
  const buf = avroType.toBuffer(AvroDesignConverter.to(value));
  return btoa(String.fromCharCode(...buf));
}

function deserialize(value: string, defaultValue: DesignConfig): DesignConfig {
  try {
    const binaryString = atob(value);
    const view = new SlowBuffer(binaryString.length);

    for (let i = 0; i < binaryString.length; i++) {
      view[i] = binaryString.charCodeAt(i);
    }

    return AvroDesignConverter.from(avroType.fromBuffer(view));
  } catch (e) {
    console.error(e);
    return defaultValue;
  }
}

export const MandalaPage = createPageWithShareableState({
  defaultValue: DESIGN_DEFAULTS,
  serialize,
  deserialize,
  component: MandalaPageWithDefaults,
});
