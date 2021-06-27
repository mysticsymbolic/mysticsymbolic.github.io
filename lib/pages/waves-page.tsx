import React, { useState } from "react";
import { Checkbox } from "../checkbox";
import { mixColor } from "../color-util";
import { ColorWidget } from "../color-widget";
import { NumericSlider } from "../numeric-slider";
import { Page } from "../page";
import { Random } from "../random";
import { lerp, range } from "../util";

const WAVE_STROKE = "#79beda";
const WAVE_FILL = "#2b7c9e";

const Wave: React.FC<{
  stroke: string;
  fill: string;
}> = ({ stroke, fill }) => (
  <>
    {/* Generator: Moho 13.0.3 build 635 */}
    <path
      fill={fill}
      fillRule="evenodd"
      stroke={stroke}
      strokeWidth="4"
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M 1272.978 220.566 C 1272.852 220.566 12.696 217.473 12.570 217.473 C 12.570 217.454 12.307 27.724 12.307 27.705 C 12.311 27.706 35.916 41.496 51.663 41.496 C 67.409 41.496 75.272 27.705 91.018 27.705 C 106.764 27.705 114.627 41.496 130.373 41.496 C 146.120 41.496 153.982 27.705 169.729 27.705 C 185.475 27.705 193.338 41.496 209.085 41.496 C 224.831 41.496 232.694 27.705 248.440 27.705 C 264.186 27.705 272.049 41.496 287.795 41.496 C 303.542 41.496 311.405 27.705 327.151 27.705 C 342.898 27.705 350.760 41.496 366.507 41.496 C 382.253 41.496 390.116 27.705 405.862 27.705 C 421.609 27.705 429.471 41.496 445.218 41.496 C 460.964 41.496 468.827 27.705 484.573 27.705 C 500.320 27.705 508.182 41.496 523.929 41.496 C 539.675 41.496 547.538 27.705 563.284 27.705 C 579.031 27.705 586.893 41.496 602.640 41.496 C 618.386 41.496 626.249 27.705 641.995 27.705 C 657.742 27.705 665.604 41.496 681.351 41.496 C 697.097 41.496 704.960 27.705 720.707 27.705 C 736.453 27.705 744.316 41.496 760.062 41.496 C 775.808 41.496 783.671 27.705 799.417 27.705 C 815.164 27.705 823.026 41.496 838.773 41.496 C 854.519 41.496 862.382 27.705 878.129 27.705 C 893.875 27.705 901.738 41.496 917.484 41.496 C 933.230 41.496 941.093 27.705 956.839 27.705 C 972.586 27.705 980.449 41.496 996.195 41.496 C 1011.942 41.496 1019.804 27.705 1035.551 27.705 C 1051.297 27.705 1059.160 41.496 1074.906 41.496 C 1090.652 41.496 1098.515 27.705 1114.261 27.705 C 1130.008 27.705 1137.871 41.496 1153.617 41.496 C 1169.364 41.496 1177.226 27.705 1192.973 27.705 C 1208.719 27.705 1216.582 41.496 1232.328 41.496 C 1248.075 41.496 1271.680 27.706 1271.684 27.705 C 1271.684 27.724 1272.978 220.547 1272.978 220.566 Z"
    />
    <path
      fill="none"
      stroke={stroke}
      strokeWidth="4"
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M 12.307 37.713 C 12.311 37.714 35.916 51.504 51.663 51.504 C 67.409 51.504 75.272 37.713 91.018 37.713 C 106.764 37.713 114.627 51.504 130.373 51.504 C 146.120 51.504 153.982 37.713 169.729 37.713 C 185.475 37.713 193.338 51.504 209.085 51.504 C 224.831 51.504 232.694 37.713 248.440 37.713 C 264.186 37.713 272.049 51.504 287.795 51.504 C 303.542 51.504 311.405 37.713 327.151 37.713 C 342.898 37.713 350.760 51.504 366.507 51.504 C 382.253 51.504 390.116 37.713 405.862 37.713 C 421.609 37.713 429.471 51.504 445.218 51.504 C 460.964 51.504 468.827 37.713 484.573 37.713 C 500.320 37.713 508.182 51.504 523.929 51.504 C 539.675 51.504 547.538 37.713 563.284 37.713 C 579.031 37.713 586.893 51.504 602.640 51.504 C 618.386 51.504 626.249 37.713 641.995 37.713 C 657.742 37.713 665.604 51.504 681.351 51.504 C 697.097 51.504 704.960 37.713 720.707 37.713 C 736.453 37.713 744.316 51.504 760.062 51.504 C 775.808 51.504 783.671 37.713 799.417 37.713 C 815.164 37.713 823.026 51.504 838.773 51.504 C 854.519 51.504 862.382 37.713 878.129 37.713 C 893.875 37.713 901.738 51.504 917.484 51.504 C 933.230 51.504 941.093 37.713 956.839 37.713 C 972.586 37.713 980.449 51.504 996.195 51.504 C 1011.942 51.504 1019.804 37.713 1035.551 37.713 C 1051.297 37.713 1059.160 51.504 1074.906 51.504 C 1090.652 51.504 1098.515 37.713 1114.261 37.713 C 1130.008 37.713 1137.871 51.504 1153.617 51.504 C 1169.364 51.504 1177.226 37.713 1192.973 37.713 C 1208.719 37.713 1216.582 51.504 1232.328 51.504 C 1248.075 51.504 1271.680 37.714 1271.684 37.713 "
    />
    <path
      fill="none"
      stroke={stroke}
      strokeWidth="4"
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M 12.307 47.544 C 12.311 47.546 35.916 61.335 51.663 61.335 C 67.409 61.335 75.272 47.544 91.018 47.544 C 106.764 47.544 114.627 61.335 130.373 61.335 C 146.120 61.335 153.982 47.544 169.729 47.544 C 185.475 47.544 193.338 61.335 209.085 61.335 C 224.831 61.335 232.694 47.544 248.440 47.544 C 264.186 47.544 272.049 61.335 287.795 61.335 C 303.542 61.335 311.405 47.544 327.151 47.544 C 342.898 47.544 350.760 61.335 366.507 61.335 C 382.253 61.335 390.116 47.544 405.862 47.544 C 421.609 47.544 429.471 61.335 445.218 61.335 C 460.964 61.335 468.827 47.544 484.573 47.544 C 500.320 47.544 508.182 61.335 523.929 61.335 C 539.675 61.335 547.538 47.544 563.284 47.544 C 579.031 47.544 586.893 61.335 602.640 61.335 C 618.386 61.335 626.249 47.544 641.995 47.544 C 657.742 47.544 665.604 61.335 681.351 61.335 C 697.097 61.335 704.960 47.544 720.707 47.544 C 736.453 47.544 744.316 61.335 760.062 61.335 C 775.808 61.335 783.671 47.544 799.417 47.544 C 815.164 47.544 823.026 61.335 838.773 61.335 C 854.519 61.335 862.382 47.544 878.129 47.544 C 893.875 47.544 901.738 61.335 917.484 61.335 C 933.230 61.335 941.093 47.544 956.839 47.544 C 972.586 47.544 980.449 61.335 996.195 61.335 C 1011.942 61.335 1019.804 47.544 1035.551 47.544 C 1051.297 47.544 1059.160 61.335 1074.906 61.335 C 1090.652 61.335 1098.515 47.544 1114.261 47.544 C 1130.008 47.544 1137.871 61.335 1153.617 61.335 C 1169.364 61.335 1177.226 47.544 1192.973 47.544 C 1208.719 47.544 1216.582 61.335 1232.328 61.335 C 1248.075 61.335 1271.680 47.546 1271.684 47.544 "
    />
    <path
      fill="none"
      stroke={stroke}
      strokeWidth="4"
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M 12.307 57.012 C 12.311 57.014 35.916 70.804 51.663 70.804 C 67.409 70.804 75.272 57.012 91.018 57.012 C 106.764 57.012 114.627 70.804 130.373 70.804 C 146.120 70.804 153.982 57.013 169.729 57.012 C 185.475 57.012 193.338 70.804 209.085 70.804 C 224.831 70.804 232.694 57.012 248.440 57.012 C 264.186 57.012 272.049 70.804 287.795 70.804 C 303.542 70.804 311.405 57.012 327.151 57.012 C 342.898 57.013 350.760 70.804 366.507 70.804 C 382.253 70.804 390.116 57.013 405.862 57.012 C 421.609 57.012 429.471 70.804 445.218 70.804 C 460.964 70.804 468.827 57.012 484.573 57.012 C 500.320 57.012 508.182 70.804 523.929 70.804 C 539.675 70.804 547.538 57.013 563.284 57.012 C 579.031 57.012 586.893 70.804 602.640 70.804 C 618.386 70.804 626.249 57.012 641.995 57.012 C 657.742 57.012 665.604 70.804 681.351 70.804 C 697.097 70.804 704.960 57.012 720.707 57.012 C 736.453 57.013 744.316 70.804 760.062 70.804 C 775.808 70.804 783.671 57.012 799.417 57.012 C 815.164 57.012 823.026 70.804 838.773 70.804 C 854.519 70.804 862.382 57.012 878.129 57.012 C 893.875 57.013 901.738 70.804 917.484 70.804 C 933.230 70.804 941.093 57.013 956.839 57.012 C 972.586 57.012 980.449 70.804 996.195 70.804 C 1011.942 70.804 1019.804 57.012 1035.551 57.012 C 1051.297 57.012 1059.160 70.804 1074.906 70.804 C 1090.652 70.804 1098.515 57.013 1114.261 57.012 C 1130.008 57.012 1137.871 70.804 1153.617 70.804 C 1169.364 70.804 1177.226 57.012 1192.973 57.012 C 1208.719 57.012 1216.582 70.804 1232.328 70.804 C 1248.075 70.804 1271.680 57.014 1271.684 57.012 "
    />
    <path
      fill="none"
      stroke={stroke}
      strokeWidth="4"
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M 12.307 66.844 C 12.311 66.845 35.916 80.635 51.663 80.635 C 67.409 80.635 75.272 66.844 91.018 66.844 C 106.764 66.844 114.627 80.635 130.373 80.635 C 146.120 80.635 153.982 66.844 169.729 66.844 C 185.475 66.844 193.338 80.635 209.085 80.635 C 224.831 80.635 232.694 66.844 248.440 66.844 C 264.186 66.844 272.049 80.635 287.795 80.635 C 303.542 80.635 311.405 66.844 327.151 66.844 C 342.898 66.844 350.760 80.635 366.507 80.635 C 382.253 80.635 390.116 66.844 405.862 66.844 C 421.609 66.844 429.471 80.635 445.218 80.635 C 460.964 80.635 468.827 66.844 484.573 66.844 C 500.320 66.844 508.182 80.635 523.929 80.635 C 539.675 80.635 547.538 66.844 563.284 66.844 C 579.031 66.844 586.893 80.635 602.640 80.635 C 618.386 80.635 626.249 66.844 641.995 66.844 C 657.742 66.844 665.604 80.635 681.351 80.635 C 697.097 80.635 704.960 66.844 720.707 66.844 C 736.453 66.844 744.316 80.635 760.062 80.635 C 775.808 80.635 783.671 66.844 799.417 66.844 C 815.164 66.844 823.026 80.635 838.773 80.635 C 854.519 80.635 862.382 66.844 878.129 66.844 C 893.875 66.844 901.738 80.635 917.484 80.635 C 933.230 80.635 941.093 66.844 956.839 66.844 C 972.586 66.844 980.449 80.635 996.195 80.635 C 1011.942 80.635 1019.804 66.844 1035.551 66.844 C 1051.297 66.844 1059.160 80.635 1074.906 80.635 C 1090.652 80.635 1098.515 66.844 1114.261 66.844 C 1130.008 66.844 1137.871 80.635 1153.617 80.635 C 1169.364 80.635 1177.226 66.844 1192.973 66.844 C 1208.719 66.844 1216.582 80.635 1232.328 80.635 C 1248.075 80.635 1271.680 66.845 1271.684 66.844 "
    />
  </>
);

const BG_COLOR = "#FFFFFF";
const BG_MAX_BLEND = 0.33;
const NUM_WAVES = 10;
const WAVE_DURATION = 1;
const WAVE_PARALLAX_SCALE_START = 1.2;
const WAVE_PARALLAX_TRANSLATE_START = 10;
const WAVE_PARALLAX_SCALE_VELOCITY = 1.25;
const WAVE_PARALLAX_TRANSLATE_VELOCITY = 30;
const WAVE_PARALLAX_TRANSLATE_ACCEL = 10;

type HillProps = {
  idPrefix: string;
  xScale: number;
  yScale: number;
  cx: number;
  cy: number;
  r: number;
  highlight: string;
  shadow: string;
};

const DEFAULT_HILL_PROPS: HillProps = {
  idPrefix: "",
  xScale: 1,
  yScale: 1,
  cx: 50,
  cy: 50,
  r: 50,
  highlight: "#aeb762",
  shadow: "#616934",
};

const Hill: React.FC<Partial<HillProps>> = (props) => {
  const { idPrefix, xScale, yScale, cx, cy, r, highlight, shadow } = {
    ...DEFAULT_HILL_PROPS,
    ...props,
  };
  const gradientId = `${idPrefix}HillGradient`;
  const gradientUrl = `url(#${gradientId})`;

  return (
    <g transform={`translate(${cx} ${cy}) scale(${xScale} ${yScale})`}>
      <radialGradient id={gradientId}>
        <stop offset="75%" stopColor={highlight} />
        <stop offset="100%" stopColor={shadow} />
      </radialGradient>
      <circle cx={0} cy={0} r={r} fill={gradientUrl} />
    </g>
  );
};

const Waves: React.FC<{}> = () => {
  const [randomSeed, setRandomSeed] = useState<number>(Date.now());
  const newRandomSeed = () => setRandomSeed(Date.now());
  const rng = new Random(randomSeed);
  const [stroke, setStroke] = useState(WAVE_STROKE);
  const [fill, setFill] = useState(WAVE_FILL);
  const [numWaves, setNumWaves] = useState(NUM_WAVES);
  const [duration, setDuration] = useState(WAVE_DURATION);
  const [initialYVel, setInitialYVel] = useState(
    WAVE_PARALLAX_TRANSLATE_VELOCITY
  );
  const [yAccel, setYAccel] = useState(WAVE_PARALLAX_TRANSLATE_ACCEL);
  const [scaleVel, setScaleVel] = useState(WAVE_PARALLAX_SCALE_VELOCITY);
  const [useMask, setUseMask] = useState(false);

  let scale = WAVE_PARALLAX_SCALE_START;
  let y = WAVE_PARALLAX_TRANSLATE_START;
  let yVel = initialYVel;
  let waves: JSX.Element[] = [];

  for (let i = 0; i < numWaves; i++) {
    const numHills = Math.floor(rng.inInterval({ min: 0, max: numWaves - i }));
    const hazeAmt = lerp(
      0,
      BG_MAX_BLEND,
      // The furthest-away waves (the first ones we draw) should be the
      // most hazy. Scale the amount quadratically so that the waves in
      // front tend to be less hazy.
      Math.pow(1 - i / Math.max(numWaves - 1, 1), 2)
    );
    const blendedFill = mixColor(fill, BG_COLOR, hazeAmt);
    const blendedStroke = mixColor(stroke, BG_COLOR, hazeAmt);

    waves.push(
      <g key={i} transform={`translate(0 ${y}) scale(${scale} ${scale})`}>
        {range(numHills).map((j) => {
          return (
            <Hill
              key={j}
              idPrefix={`wave${i}_${j}_`}
              cx={rng.inInterval({ min: 0, max: 1280 / scale })}
              r={rng.inInterval({ min: 50, max: 100 })}
              xScale={rng.inInterval({ min: 1, max: 1.25 })}
              highlight={mixColor(
                DEFAULT_HILL_PROPS.highlight,
                BG_COLOR,
                hazeAmt
              )}
              shadow={mixColor(DEFAULT_HILL_PROPS.shadow, BG_COLOR, hazeAmt)}
            />
          );
        })}
        <g>
          <Wave fill={blendedFill} stroke={blendedStroke} />
          <animateTransform
            attributeName="transform"
            type="translate"
            from="-179 0"
            to="-100 0"
            dur={`${duration}s`}
            begin="0s"
            fill="freeze"
            repeatCount="indefinite"
          />
        </g>
      </g>
    );
    y += yVel;
    scale *= scaleVel;
    yVel += yAccel;
  }

  return (
    <>
      <div className="canvas">
        <svg width="1280px" height="720px" viewBox="0 0 1280 720">
          {useMask ? (
            <>
              <mask id="circle-mask">
                <circle cx="640" cy="360" r="300" fill="white" />
              </mask>
              <g mask="url(#circle-mask)">{waves}</g>
            </>
          ) : (
            waves
          )}
        </svg>
      </div>
      <div className="sidebar">
        <div className="thingy">
          <ColorWidget value={stroke} onChange={setStroke} label="Stroke" />{" "}
          <ColorWidget value={fill} onChange={setFill} label="Fill" />
        </div>
        <NumericSlider
          label="Number of waves"
          min={1}
          max={NUM_WAVES * 2}
          value={numWaves}
          step={1}
          onChange={setNumWaves}
        />
        <NumericSlider
          label="Cycle duration"
          min={0.1}
          max={3}
          value={duration}
          step={0.1}
          onChange={setDuration}
          valueSuffix="s"
        />
        <NumericSlider
          label="Initial y-velocity"
          min={1}
          max={WAVE_PARALLAX_TRANSLATE_VELOCITY * 4}
          value={initialYVel}
          step={1}
          onChange={setInitialYVel}
        />
        <NumericSlider
          label="Y-acceleration"
          min={1}
          max={WAVE_PARALLAX_TRANSLATE_ACCEL * 2}
          value={yAccel}
          step={1}
          onChange={setYAccel}
        />
        <NumericSlider
          label="Scale velocity"
          min={1.0}
          max={2}
          value={scaleVel}
          step={0.025}
          onChange={setScaleVel}
        />
        <Checkbox
          label="Mask with circle"
          value={useMask}
          onChange={setUseMask}
        />
        <button accessKey="r" onClick={newRandomSeed}>
          <u>R</u>andomize hills!
        </button>
      </div>
    </>
  );
};

export const WavesPage: React.FC<{}> = () => (
  <Page title="Waves!">
    <Waves />
  </Page>
);
