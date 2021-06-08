/* 2021-06-08 Dave Weaver, @webaissance - based on waves-page.tsx */
/* IMPORTS */
import React, { useState } from "react";
import { RandomizerWidget } from "../randomizer-widget";
import { NumericSlider } from "../numeric-slider";
import { Page } from "../page";
import {
  CompositionContextWidget,
  createSvgCompositionContext,
} from "../svg-composition-context";
import { Checkbox } from "../checkbox";
/* TO DO: Get symbols randomly or from a pulldown */

/* INITIAL VALUES */
const CLOUD_STROKE = "#79beda";
const CLOUD_FILL = "#2b7c9e";
const CLOUD_STROKEWIDTH = 30;
const CLOUD_STYLE = 1;
const GRADIENT_OFFSET1 = 43;
const GRADIENT_OFFSET2 = 96;
const NUM_ELEMENTS = 7;
const NUM_CLOUDS = 12;
//const MAX_CLOUDS = 12;
const CLOUD_DISTANCE = 9;
const NUM_ROWS = 3;
const ROW_DISTANCE = 5;
const CLOUD_SPEED = 3;
const PARALLAX_SPEED = 2;
const PARALLAX_SIZE = 1;
const ROTATION_SPEED = 6;
const CLOUD_SPACING = 0.5;
const CLOUD_SCALE = 0.8;
const CLOUD_PULSEMIN = 0.8;
const CLOUD_PULSE = 1.7;
const PULSE_DURATION = 2.6;
const BG_COLOR = "#FFFFFF";
const SCREEN_WIDTH = 12000;
const MASK_RADIUS = 2000;
const MASK_X = 4500;
const MASK_Y = 3000;

let screenWidth = SCREEN_WIDTH;

/* CLOUD SVG */
const Cloud1: React.FC<{
  stroke: string;
  fill: string;
  strokewidth: number;
  gradientOffset1: number;
  gradientOffset2: number;
}> = ({ stroke, fill, strokewidth, gradientOffset1, gradientOffset2 }) => (
  <>
    <path
      fill={fill}
      fillRule="evenodd"
      stroke="none"
      d="M 360.000 596.177 C 500.811 596.177 614.404 482.584 614.404 341.774 C 614.404 200.963 500.811 87.370 360.000 87.370 C 219.189 87.370 105.596 200.963 105.596 341.774 C 105.596 482.584 219.189 596.177 360.000 596.177 Z"
    />
    <path
      fill="none"
      stroke={stroke}
      strokeWidth={strokewidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M 604.098 371.149 C 602.507 412.416 597.237 433.275 575.983 476.189 M 530.256 180.457 C 583.769 228.655 607.192 290.877 604.098 371.149 M 212.437 216.472 C 280.858 106.327 437.914 97.287 530.256 180.457 M 208.196 406.565 C 175.078 346.560 176.784 273.866 212.437 216.472 M 437.019 451.501 C 365.701 513.810 255.178 491.691 208.196 406.565 M 479.177 353.518 C 480.210 390.509 464.892 427.148 437.019 451.501 M 383.232 252.404 C 437.329 252.139 477.731 301.781 479.177 353.518 M 315.724 293.646 C 329.002 268.221 355.037 252.543 383.232 252.404 M 324.498 355.831 C 305.359 339.494 306.332 311.630 315.724 293.646 M 347.839 363.173 C 337.678 362.940 332.207 362.412 324.498 355.831 M 366.134 334.409 C 377.849 347.389 363.196 363.525 347.839 363.173 M 354.460 336.520 C 354.806 332.878 362.306 330.168 366.134 334.409 M 105.596 341.774 C 105.596 482.584 219.189 596.177 360.000 596.177 C 500.811 596.177 614.404 482.584 614.404 341.774 C 614.404 200.963 500.811 87.370 360.000 87.370 C 219.189 87.370 105.596 200.963 105.596 341.774 "
    />
  </>
);

const Cloud2: React.FC<{
  stroke: string;
  fill: string;
  strokewidth: number;
  gradientOffset1: number;
  gradientOffset2: number;
}> = ({ stroke, fill, strokewidth, gradientOffset1, gradientOffset2 }) => (
  <>
    <radialGradient id="uid_41" cx="50.00%" cy="50.00%" r="50.00%">
      <stop offset={gradientOffset1 + "%"} stopColor={fill}></stop>
      <stop offset={gradientOffset2 + "%"} stopColor={stroke}></stop>
    </radialGradient>
    <path
      fill="url(#uid_41)"
      fillRule="evenodd"
      stroke="none"
      d="M 360.000 596.472 C 500.986 596.472 614.721 482.737 614.721 341.751 C 614.721 200.765 500.986 87.030 360.000 87.030 C 219.014 87.030 105.279 200.765 105.279 341.751 C 105.279 482.737 219.014 596.472 360.000 596.472 Z"
    />
    <path
      fill="none"
      stroke={stroke}
      strokeWidth={strokewidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M 604.402 371.163 C 602.809 412.482 597.532 433.366 576.252 476.334 M 530.468 180.233 C 584.048 228.491 607.500 290.791 604.402 371.163 M 212.253 216.293 C 280.760 106.011 438.011 96.960 530.468 180.233 M 208.007 406.623 C 174.848 346.544 176.555 273.758 212.253 216.293 M 437.115 451.615 C 365.708 514.002 255.048 491.855 208.007 406.623 M 479.325 353.509 C 480.360 390.547 465.022 427.232 437.115 451.615 M 383.261 252.270 C 437.425 252.004 477.877 301.708 479.325 353.509 M 315.669 293.563 C 328.963 268.106 355.031 252.409 383.261 252.270 M 324.454 355.826 C 305.291 339.468 306.266 311.569 315.669 293.563 M 347.824 363.177 C 337.650 362.944 332.173 362.415 324.454 355.826 M 366.141 334.377 C 377.871 347.373 363.200 363.529 347.824 363.177 M 354.453 336.490 C 354.799 332.844 362.308 330.130 366.141 334.377 M 105.279 341.751 C 105.279 482.737 219.014 596.472 360.000 596.472 C 500.986 596.472 614.721 482.737 614.721 341.751 C 614.721 200.765 500.986 87.030 360.000 87.030 C 219.014 87.030 105.279 200.765 105.279 341.751 "
    />
  </>
);

const Cloud3: React.FC<{
  stroke: string;
  fill: string;
  strokewidth: number;
  gradientOffset1: number;
  gradientOffset2: number;
}> = ({ stroke, fill, strokewidth, gradientOffset1, gradientOffset2 }) => (
  <>
    <radialGradient id="uid_41" cx="50.00%" cy="50.00%" r="50.00%">
      <stop offset={gradientOffset1 + "%"} stopColor={stroke}></stop>
      <stop offset={gradientOffset2 + "%"} stopColor={fill}></stop>
    </radialGradient>
    <path
      fill="url(#uid_41)"
      fillRule="evenodd"
      stroke="none"
      d="M 360.000 596.472 C 500.986 596.472 614.721 482.737 614.721 341.751 C 614.721 200.765 500.986 87.030 360.000 87.030 C 219.014 87.030 105.279 200.765 105.279 341.751 C 105.279 482.737 219.014 596.472 360.000 596.472 Z"
    />
    <path
      fill="none"
      stroke={stroke}
      strokeWidth={strokewidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M 604.402 371.163 C 602.809 412.482 597.532 433.366 576.252 476.334 M 530.468 180.233 C 584.048 228.491 607.500 290.791 604.402 371.163 M 212.253 216.293 C 280.760 106.011 438.011 96.960 530.468 180.233 M 208.007 406.623 C 174.848 346.544 176.555 273.758 212.253 216.293 M 437.115 451.615 C 365.708 514.002 255.048 491.855 208.007 406.623 M 479.325 353.509 C 480.360 390.547 465.022 427.232 437.115 451.615 M 383.261 252.270 C 437.425 252.004 477.877 301.708 479.325 353.509 M 315.669 293.563 C 328.963 268.106 355.031 252.409 383.261 252.270 M 324.454 355.826 C 305.291 339.468 306.266 311.569 315.669 293.563 M 347.824 363.177 C 337.650 362.944 332.173 362.415 324.454 355.826 M 366.141 334.377 C 377.871 347.373 363.200 363.529 347.824 363.177 M 354.453 336.490 C 354.799 332.844 362.308 330.130 366.141 334.377 M 105.279 341.751 C 105.279 482.737 219.014 596.472 360.000 596.472 C 500.986 596.472 614.721 482.737 614.721 341.751 C 614.721 200.765 500.986 87.030 360.000 87.030 C 219.014 87.030 105.279 200.765 105.279 341.751 "
    />
  </>
);

const Cloud4: React.FC<{
  stroke: string;
  fill: string;
  strokewidth: number;
  gradientOffset1: number;
  gradientOffset2: number;
}> = ({ stroke, fill, strokewidth, gradientOffset1, gradientOffset2 }) => (
  <>
    <radialGradient id="uid_41" cx="50.00%" cy="50.00%" r="50.00%">
      <stop offset={gradientOffset1 + "%"} stopColor="#ffffff"></stop>
      <stop offset={gradientOffset2 + "%"} stopColor={fill}></stop>
    </radialGradient>
    <path
      fill="url(#uid_41)"
      fillRule="evenodd"
      stroke="none"
      d="M 360.000 596.472 C 500.986 596.472 614.721 482.737 614.721 341.751 C 614.721 200.765 500.986 87.030 360.000 87.030 C 219.014 87.030 105.279 200.765 105.279 341.751 C 105.279 482.737 219.014 596.472 360.000 596.472 Z"
    />
    <path
      fill="none"
      stroke={stroke}
      strokeWidth={strokewidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M 604.402 371.163 C 602.809 412.482 597.532 433.366 576.252 476.334 M 530.468 180.233 C 584.048 228.491 607.500 290.791 604.402 371.163 M 212.253 216.293 C 280.760 106.011 438.011 96.960 530.468 180.233 M 208.007 406.623 C 174.848 346.544 176.555 273.758 212.253 216.293 M 437.115 451.615 C 365.708 514.002 255.048 491.855 208.007 406.623 M 479.325 353.509 C 480.360 390.547 465.022 427.232 437.115 451.615 M 383.261 252.270 C 437.425 252.004 477.877 301.708 479.325 353.509 M 315.669 293.563 C 328.963 268.106 355.031 252.409 383.261 252.270 M 324.454 355.826 C 305.291 339.468 306.266 311.569 315.669 293.563 M 347.824 363.177 C 337.650 362.944 332.173 362.415 324.454 355.826 M 366.141 334.377 C 377.871 347.373 363.200 363.529 347.824 363.177 M 354.453 336.490 C 354.799 332.844 362.308 330.130 366.141 334.377 M 105.279 341.751 C 105.279 482.737 219.014 596.472 360.000 596.472 C 500.986 596.472 614.721 482.737 614.721 341.751 C 614.721 200.765 500.986 87.030 360.000 87.030 C 219.014 87.030 105.279 200.765 105.279 341.751 "
    />
  </>
);

const Cloud5: React.FC<{
  stroke: string;
  fill: string;
  strokewidth: number;
  gradientOffset1: number;
  gradientOffset2: number;
}> = ({ stroke, fill, strokewidth, gradientOffset1, gradientOffset2 }) => (
  <>
    <radialGradient id="uid_41" cx="50.00%" cy="50.00%" r="50.00%">
      <stop offset={gradientOffset1 + "%"} stopColor="#ffffff"></stop>
      <stop offset={gradientOffset2 + "%"} stopColor={stroke}></stop>
    </radialGradient>
    <path
      fill="url(#uid_41)"
      fillRule="evenodd"
      stroke="none"
      d="M 360.000 596.472 C 500.986 596.472 614.721 482.737 614.721 341.751 C 614.721 200.765 500.986 87.030 360.000 87.030 C 219.014 87.030 105.279 200.765 105.279 341.751 C 105.279 482.737 219.014 596.472 360.000 596.472 Z"
    />
    <path
      fill="none"
      stroke={stroke}
      strokeWidth={strokewidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M 604.402 371.163 C 602.809 412.482 597.532 433.366 576.252 476.334 M 530.468 180.233 C 584.048 228.491 607.500 290.791 604.402 371.163 M 212.253 216.293 C 280.760 106.011 438.011 96.960 530.468 180.233 M 208.007 406.623 C 174.848 346.544 176.555 273.758 212.253 216.293 M 437.115 451.615 C 365.708 514.002 255.048 491.855 208.007 406.623 M 479.325 353.509 C 480.360 390.547 465.022 427.232 437.115 451.615 M 383.261 252.270 C 437.425 252.004 477.877 301.708 479.325 353.509 M 315.669 293.563 C 328.963 268.106 355.031 252.409 383.261 252.270 M 324.454 355.826 C 305.291 339.468 306.266 311.569 315.669 293.563 M 347.824 363.177 C 337.650 362.944 332.173 362.415 324.454 355.826 M 366.141 334.377 C 377.871 347.373 363.200 363.529 347.824 363.177 M 354.453 336.490 C 354.799 332.844 362.308 330.130 366.141 334.377 M 105.279 341.751 C 105.279 482.737 219.014 596.472 360.000 596.472 C 500.986 596.472 614.721 482.737 614.721 341.751 C 614.721 200.765 500.986 87.030 360.000 87.030 C 219.014 87.030 105.279 200.765 105.279 341.751 "
    />
  </>
);

const Cloud6: React.FC<{
  stroke: string;
  fill: string;
  strokewidth: number;
  gradientOffset1: number;
  gradientOffset2: number;
}> = ({ stroke, fill, strokewidth, gradientOffset1, gradientOffset2 }) => (
  <>
    <radialGradient id="uid_41" cx="50.00%" cy="50.00%" r="50.00%">
      <stop offset={gradientOffset1 + "%"} stopColor="#ffffff"></stop>
      <stop offset={gradientOffset2 + "%"} stopColor="#000000"></stop>
    </radialGradient>
    <path
      fill="url(#uid_41)"
      fillRule="evenodd"
      stroke="none"
      d="M 360.000 596.472 C 500.986 596.472 614.721 482.737 614.721 341.751 C 614.721 200.765 500.986 87.030 360.000 87.030 C 219.014 87.030 105.279 200.765 105.279 341.751 C 105.279 482.737 219.014 596.472 360.000 596.472 Z"
    />
    <path
      fill="none"
      stroke={stroke}
      strokeWidth={strokewidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M 604.402 371.163 C 602.809 412.482 597.532 433.366 576.252 476.334 M 530.468 180.233 C 584.048 228.491 607.500 290.791 604.402 371.163 M 212.253 216.293 C 280.760 106.011 438.011 96.960 530.468 180.233 M 208.007 406.623 C 174.848 346.544 176.555 273.758 212.253 216.293 M 437.115 451.615 C 365.708 514.002 255.048 491.855 208.007 406.623 M 479.325 353.509 C 480.360 390.547 465.022 427.232 437.115 451.615 M 383.261 252.270 C 437.425 252.004 477.877 301.708 479.325 353.509 M 315.669 293.563 C 328.963 268.106 355.031 252.409 383.261 252.270 M 324.454 355.826 C 305.291 339.468 306.266 311.569 315.669 293.563 M 347.824 363.177 C 337.650 362.944 332.173 362.415 324.454 355.826 M 366.141 334.377 C 377.871 347.373 363.200 363.529 347.824 363.177 M 354.453 336.490 C 354.799 332.844 362.308 330.130 366.141 334.377 M 105.279 341.751 C 105.279 482.737 219.014 596.472 360.000 596.472 C 500.986 596.472 614.721 482.737 614.721 341.751 C 614.721 200.765 500.986 87.030 360.000 87.030 C 219.014 87.030 105.279 200.765 105.279 341.751 "
    />
  </>
);

const Cloud7: React.FC<{
  stroke: string;
  fill: string;
  strokewidth: number;
  gradientOffset1: number;
  gradientOffset2: number;
}> = ({ stroke, fill, strokewidth, gradientOffset1, gradientOffset2 }) => (
  <>
    <radialGradient id="uid_41" cx="50.00%" cy="50.00%" r="50.00%">
      <stop offset={gradientOffset1 + "%"} stopColor="#000000"></stop>
      <stop offset={gradientOffset2 + "%"} stopColor="#ffffff"></stop>
    </radialGradient>
    <path
      fill="url(#uid_41)"
      fillRule="evenodd"
      stroke="none"
      d="M 360.000 596.472 C 500.986 596.472 614.721 482.737 614.721 341.751 C 614.721 200.765 500.986 87.030 360.000 87.030 C 219.014 87.030 105.279 200.765 105.279 341.751 C 105.279 482.737 219.014 596.472 360.000 596.472 Z"
    />
    <path
      fill="none"
      stroke={stroke}
      strokeWidth={strokewidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M 604.402 371.163 C 602.809 412.482 597.532 433.366 576.252 476.334 M 530.468 180.233 C 584.048 228.491 607.500 290.791 604.402 371.163 M 212.253 216.293 C 280.760 106.011 438.011 96.960 530.468 180.233 M 208.007 406.623 C 174.848 346.544 176.555 273.758 212.253 216.293 M 437.115 451.615 C 365.708 514.002 255.048 491.855 208.007 406.623 M 479.325 353.509 C 480.360 390.547 465.022 427.232 437.115 451.615 M 383.261 252.270 C 437.425 252.004 477.877 301.708 479.325 353.509 M 315.669 293.563 C 328.963 268.106 355.031 252.409 383.261 252.270 M 324.454 355.826 C 305.291 339.468 306.266 311.569 315.669 293.563 M 347.824 363.177 C 337.650 362.944 332.173 362.415 324.454 355.826 M 366.141 334.377 C 377.871 347.373 363.200 363.529 347.824 363.177 M 354.453 336.490 C 354.799 332.844 362.308 330.130 366.141 334.377 M 105.279 341.751 C 105.279 482.737 219.014 596.472 360.000 596.472 C 500.986 596.472 614.721 482.737 614.721 341.751 C 614.721 200.765 500.986 87.030 360.000 87.030 C 219.014 87.030 105.279 200.765 105.279 341.751 "
    />
  </>
);

/* RETURN THE CLOUD STYLE WHICH WAS SELECTED */
const ElementSwitch: React.FC<{
  thisstyle: number;
  fill: string;
  stroke: string;
  strokewidth: number;
  gradientOffset1: number;
  gradientOffset2: number;
}> = (props) => {
  if (props.thisstyle == 2) {
    return (
      <Cloud2
        fill={props.fill}
        stroke={props.stroke}
        strokewidth={props.strokewidth}
        gradientOffset1={props.gradientOffset1}
        gradientOffset2={props.gradientOffset2}
      />
    );
  } else if (props.thisstyle == 3) {
    return (
      <Cloud3
        fill={props.fill}
        stroke={props.stroke}
        strokewidth={props.strokewidth}
        gradientOffset1={props.gradientOffset1}
        gradientOffset2={props.gradientOffset2}
      />
    );
  } else if (props.thisstyle == 4) {
    return (
      <Cloud4
        fill={props.fill}
        stroke={props.stroke}
        strokewidth={props.strokewidth}
        gradientOffset1={props.gradientOffset1}
        gradientOffset2={props.gradientOffset2}
      />
    );
  } else if (props.thisstyle == 5) {
    return (
      <Cloud5
        fill={props.fill}
        stroke={props.stroke}
        strokewidth={props.strokewidth}
        gradientOffset1={props.gradientOffset1}
        gradientOffset2={props.gradientOffset2}
      />
    );
  } else if (props.thisstyle == 6) {
    return (
      <Cloud6
        fill={props.fill}
        stroke={props.stroke}
        strokewidth={props.strokewidth}
        gradientOffset1={props.gradientOffset1}
        gradientOffset2={props.gradientOffset2}
      />
    );
  } else if (props.thisstyle == 7) {
    return (
      <Cloud7
        fill={props.fill}
        stroke={props.stroke}
        strokewidth={props.strokewidth}
        gradientOffset1={props.gradientOffset1}
        gradientOffset2={props.gradientOffset2}
      />
    );
  } else {
    return (
      <Cloud1
        fill={props.fill}
        stroke={props.stroke}
        strokewidth={props.strokewidth}
        gradientOffset1={props.gradientOffset1}
        gradientOffset2={props.gradientOffset2}
      />
    );
  }
};

/* SHOW THE SETTINGS */
const ShowSettings: React.FC<{
  numSettings: number;
  cS: { [key: string]: any };
}> = (props) => {
  let controls = [];
  for (let sN = 0; sN <= props.numSettings; sN++) {
    controls.push(
      <React.Fragment key={props.cS[sN]["id"]}>
        <NumericSlider
          id={props.cS[sN]["id"]}
          label={props.cS[sN]["label"]}
          min={props.cS[sN]["min"]}
          max={props.cS[sN]["max"]}
          value={props.cS[sN]["value"]}
          step={props.cS[sN]["step"]}
          valueSuffix={props.cS[sN]["suffix"]}
          onChange={props.cS[sN]["setter"]}
        />
      </React.Fragment>
    );
  }
  return <> {controls} </>;
};

/* SETTERS AND VARIABLES */
const Clouds: React.FC<{}> = () => {
  //const [stroke, setStroke] = useState(CLOUD_STROKE);
  let [strokewidth, setStrokewidth] = useState(CLOUD_STROKEWIDTH);
  //const [fill, setFill] = useState(CLOUD_FILL);
  let [cloudStyle, setcloudStyle] = useState(CLOUD_STYLE);
  let [gradientOffset1, setgradientOffset1] = useState(GRADIENT_OFFSET1);
  let [gradientOffset2, setgradientOffset2] = useState(GRADIENT_OFFSET2);
  let [numElements, setnumElements] = useState(NUM_ELEMENTS);
  //let [numClouds, setnumClouds] = useState(NUM_CLOUDS);
  let numClouds = NUM_CLOUDS;
  let [cloudDistance, setcloudDistance] = useState(CLOUD_DISTANCE);
  let [numRows, setnumRows] = useState(NUM_ROWS);
  let [rowDistance, setrowDistance] = useState(ROW_DISTANCE);
  let [cloudSpeed, setcloudSpeed] = useState(CLOUD_SPEED);
  let [parallaxSpeed, setparallaxSpeed] = useState(PARALLAX_SPEED);
  let [parallaxSize, setparallaxSize] = useState(PARALLAX_SIZE);
  let [rotationSpeed, setRotationSpeed] = useState(ROTATION_SPEED);
  let [pulseDuration, setPulseDuration] = useState(PULSE_DURATION);
  let [spacing, setSpacing] = useState(CLOUD_SPACING);
  let [scaleValue, setScaleValue] = useState(CLOUD_SCALE);
  let [pulseValue, setPulseValue] = useState(CLOUD_PULSE);
  let [pulseminValue, setPulseminValue] = useState(CLOUD_PULSEMIN);
  let [compCtx, setCompCtx] = useState(
    createSvgCompositionContext({
      background: BG_COLOR,
      stroke: CLOUD_STROKE,
      fill: CLOUD_FILL,
    })
  );
  let [useMask, setUseMask] = useState(false);
  let [maskRadius, setMaskRadius] = useState(MASK_RADIUS);
  let [maskX, setMaskX] = useState(MASK_X);
  let [maskY, setMaskY] = useState(MASK_Y);

  // cloud Settings - two dimensional object of settings
  let cS: { [key: string]: any } = {};
  let sN = 0; // setting number
  let numSettings = 0; // count the settings

  // SET UP THE SETTINS - with Min, Max and Step
  cS[sN] = [];
  cS[sN]["id"] = "cloudStyle";
  cS[sN]["label"] = "Cloud Style";
  cS[sN]["value"] = cloudStyle;
  cS[sN]["setter"] = setcloudStyle;
  cS[sN]["min"] = 1;
  cS[sN]["max"] = 7;
  cS[sN]["step"] = 1;
  cS[sN]["suffix"] = "";

  sN++;
  cS[sN] = [];
  cS[sN]["id"] = "gradientOffset1";
  cS[sN]["label"] = "Gradient Offset 1";
  cS[sN]["value"] = gradientOffset1;
  cS[sN]["setter"] = setgradientOffset1;
  cS[sN]["min"] = 1;
  cS[sN]["max"] = 50;
  cS[sN]["step"] = 1;
  cS[sN]["suffix"] = "%";

  sN++;
  cS[sN] = [];
  cS[sN]["id"] = "gradientOffset2";
  cS[sN]["label"] = "Gradient Offset 2";
  cS[sN]["value"] = gradientOffset2;
  cS[sN]["setter"] = setgradientOffset2;
  cS[sN]["min"] = 51;
  cS[sN]["max"] = 100;
  cS[sN]["step"] = 1;
  cS[sN]["suffix"] = "%";

  sN++;
  cS[sN] = [];
  cS[sN]["id"] = "strokewidth";
  cS[sN]["label"] = "Stroke width";
  cS[sN]["value"] = strokewidth;
  cS[sN]["setter"] = setStrokewidth;
  cS[sN]["min"] = 1;
  cS[sN]["max"] = 100;
  cS[sN]["step"] = 1;
  cS[sN]["suffix"] = "";

  sN++;
  cS[sN] = [];
  cS[sN]["id"] = "numElements";
  cS[sN]["label"] = "Number of elements";
  cS[sN]["value"] = numElements;
  cS[sN]["setter"] = setnumElements;
  cS[sN]["min"] = 1;
  cS[sN]["max"] = 14;
  cS[sN]["step"] = 1;
  cS[sN]["suffix"] = "";

  sN++;
  cS[sN] = [];
  cS[sN]["id"] = "cloudDistance";
  cS[sN]["label"] = "Distance between clouds";
  cS[sN]["value"] = cloudDistance;
  cS[sN]["setter"] = setcloudDistance;
  cS[sN]["min"] = 5;
  cS[sN]["max"] = 14;
  cS[sN]["step"] = 1;
  cS[sN]["suffix"] = sN++;
  cS[sN] = [];
  cS[sN]["id"] = "numRows";
  cS[sN]["label"] = "Number of rows";
  cS[sN]["value"] = numRows;
  cS[sN]["setter"] = setnumRows;
  cS[sN]["min"] = 1;
  cS[sN]["max"] = 5;
  cS[sN]["step"] = 1;
  cS[sN]["suffix"] = "";

  sN++;
  cS[sN] = [];
  cS[sN]["id"] = "rowDistance";
  cS[sN]["label"] = "Distance between Rows";
  cS[sN]["value"] = rowDistance;
  cS[sN]["setter"] = setrowDistance;
  cS[sN]["min"] = 0;
  cS[sN]["max"] = 20;
  cS[sN]["step"] = 1;
  cS[sN]["suffix"] = "";

  sN++;
  cS[sN] = [];
  cS[sN]["id"] = "cloudSpeed";
  cS[sN]["label"] = "Cloud speed";
  cS[sN]["value"] = cloudSpeed;
  cS[sN]["setter"] = setcloudSpeed;
  cS[sN]["min"] = -10;
  cS[sN]["max"] = 10;
  cS[sN]["step"] = 1;
  cS[sN]["suffix"] = "";

  sN++;
  cS[sN] = [];
  cS[sN]["id"] = "parallaxSpeed";
  cS[sN]["label"] = "Parallax speed";
  cS[sN]["value"] = parallaxSpeed;
  cS[sN]["setter"] = setparallaxSpeed;
  cS[sN]["min"] = 0.5;
  cS[sN]["max"] = 5;
  cS[sN]["step"] = 0.1;
  cS[sN]["suffix"] = "";

  sN++;
  cS[sN] = [];
  cS[sN]["id"] = "parallaxSize";
  cS[sN]["label"] = "Parallax size";
  cS[sN]["value"] = parallaxSize;
  cS[sN]["setter"] = setparallaxSize;
  cS[sN]["min"] = 0.3;
  cS[sN]["max"] = 2;
  cS[sN]["step"] = 0.1;
  cS[sN]["suffix"] = "";

  sN++;
  cS[sN] = [];
  cS[sN]["id"] = "rotationSpeed";
  cS[sN]["label"] = "Rotation speed";
  cS[sN]["value"] = rotationSpeed;
  cS[sN]["setter"] = setRotationSpeed;
  cS[sN]["min"] = -8;
  cS[sN]["max"] = 8;
  cS[sN]["step"] = 0.5;
  cS[sN]["suffix"] = "";

  sN++;
  cS[sN] = [];
  cS[sN]["id"] = "spacing";
  cS[sN]["label"] = "Spacing";
  cS[sN]["value"] = spacing;
  cS[sN]["setter"] = setSpacing;
  cS[sN]["min"] = 0.2;
  cS[sN]["max"] = 1;
  cS[sN]["step"] = 0.1;
  cS[sN]["suffix"] = "";

  sN++;
  cS[sN] = [];
  cS[sN]["id"] = "scaleValue";
  cS[sN]["label"] = "Scale";
  cS[sN]["value"] = scaleValue;
  cS[sN]["setter"] = setScaleValue;
  cS[sN]["min"] = 0.3;
  cS[sN]["max"] = 1.5;
  cS[sN]["step"] = 0.1;
  cS[sN]["suffix"] = "";

  sN++;
  cS[sN] = [];
  cS[sN]["id"] = "pulseminValue";
  cS[sN]["label"] = "Pulse Size Min";
  cS[sN]["value"] = pulseminValue;
  cS[sN]["setter"] = setPulseminValue;
  cS[sN]["min"] = 0.5;
  cS[sN]["max"] = 1;
  cS[sN]["step"] = 0.1;
  cS[sN]["suffix"] = "";

  sN++;
  cS[sN] = [];
  cS[sN]["id"] = "pulseValue";
  cS[sN]["label"] = "Pulse Size Max";
  cS[sN]["value"] = pulseValue;
  cS[sN]["setter"] = setPulseValue;
  cS[sN]["min"] = 1;
  cS[sN]["max"] = 2.5;
  cS[sN]["step"] = 0.1;
  cS[sN]["suffix"] = "";

  sN++;
  cS[sN] = [];
  cS[sN]["id"] = "pulseDuration";
  cS[sN]["label"] = "Pulse duration";
  cS[sN]["value"] = pulseDuration;
  cS[sN]["setter"] = setPulseDuration;
  cS[sN]["min"] = 0.8;
  cS[sN]["max"] = 8;
  cS[sN]["step"] = 0.2;
  cS[sN]["suffix"] = "s";

  sN++;
  cS[sN] = [];
  cS[sN]["id"] = "maskRadius";
  cS[sN]["label"] = "Mask Radius";
  cS[sN]["value"] = maskRadius;
  cS[sN]["setter"] = setMaskRadius;
  cS[sN]["min"] = 500;
  cS[sN]["max"] = 5000;
  cS[sN]["step"] = 500;
  cS[sN]["suffix"] = "";

  sN++;
  cS[sN] = [];
  cS[sN]["id"] = "maskY";
  cS[sN]["label"] = "Mask Top";
  cS[sN]["value"] = maskY;
  cS[sN]["setter"] = setMaskY;
  cS[sN]["min"] = -1000;
  cS[sN]["max"] = 7000;
  cS[sN]["step"] = 500;
  cS[sN]["suffix"] = "";

  sN++;
  cS[sN] = [];
  cS[sN]["id"] = "maskX";
  cS[sN]["label"] = "Mask Left";
  cS[sN]["value"] = maskX;
  cS[sN]["setter"] = setMaskX;
  cS[sN]["min"] = -2000;
  cS[sN]["max"] = screenWidth;
  cS[sN]["step"] = 500;
  cS[sN]["suffix"] = "";

  numSettings = sN; // number of settings

  function randomizestylesorcolors(mode: string): void {
    //console.log('randomize styles! num of settings:' + numSettings);
    for (let i = 0; i <= numSettings; i++) {
      let settingRange = cS[i]["max"] - cS[i]["min"]; // get the range of values
      let newsetting =
        Math.round((Math.random() * settingRange) / cS[i]["step"]) *
          cS[i]["step"] +
        cS[i]["min"];
      if (cS[i]["step"] < 1 && cS[i]["step"] >= 0.1) {
        newsetting = Math.round(newsetting * 10) / 10;
      } else if (cS[i]["step"] < 0.1) {
        newsetting = Math.round(newsetting * 100) / 100;
      }

      cS[i]["setter"](newsetting); // set the new setting
      //console.log(cS[i]['label'] + ' newsetting:' + newsetting +' max: '+cS[i]['max'] +' min: '+cS[i]['min']);
    }
    if (mode == "withcolors") {
      const colorButton = document.getElementById("colorButton");
      if (colorButton === null) {
        // if it can't find the button then nothing happens
      } else {
        colorButton.click(); // Click on the color button
      }
    }
  }

  // TRIGGER THE randomizestylesorcolors FUNCTION - WITH OR WITHOUT COLORS
  function randomizestyles() {
    randomizestylesorcolors("nocolors");
  }
  function randomizestylesandcolors() {
    randomizestylesorcolors("withcolors");
  }

  // simulate a Bezier pulse effect
  let pulse2Value = pulseminValue;
  let pulse3Value = pulseminValue;
  let pulse4Value = pulseValue;
  let pulseDiff = pulseValue - pulseminValue; // get the pulse difference
  // if there is a difference then calculate the simulated Bezier effect
  if (Math.abs(pulseDiff) > 0) {
    pulse2Value =
      pulseDiff / 7 + pulseminValue; /* pulse up to 1/7 difference  */
    pulse3Value =
      pulseDiff / 2 + pulseminValue; /* pulse up to 1/2 difference */
    pulse4Value = pulseValue - pulseDiff / 7; /* pulse up to 6/7 difference */

    pulse2Value = Math.round(pulse2Value * 100) / 100;
    pulse3Value = Math.round(pulse3Value * 100) / 100;
    pulse4Value = Math.round(pulse4Value * 100) / 100;
  }

  // ROTATION SETTINGS
  let rotationDuration = 0; //default to 0
  if (rotationSpeed > 0) {
    rotationDuration = 8.5 - rotationSpeed;
  } else if (rotationSpeed < 0) {
    rotationDuration = 8.5 - rotationSpeed * -1; // if rotationSpeed is negative then reverse direction
  }
  let rotationAngle = -360;
  if (rotationSpeed < 0) {
    rotationAngle = 360;
  }

  /* CLOUD ELEMENTS: create an array for the position of each element */
  let tempcloudposx = [
    -400, 400, -900, 0, 900, -400, 400, -1200, 1200, -900, 0, 900, -400, 400,
  ];
  let tempcloudposy = [
    400, 400, 1000, 1000, 1000, 1600, 1600, 1600, 1600, 2200, 2200, 2200, 2800,
    2800,
  ];
  //const cloudposx = [-400, 400, -900,   0,  900,  -400,    400, -1200, 1200, -900,   0,   900, -400,  400  ];
  //const cloudposy = [   400,   400,  1000, 1000,  1000,   1600,  1600,  1600, 1600, 2200, 2200, 2200, 2800, 2800  ];
  // rearrange them to provide the correct pulse:
  let cloudposx = new Array();
  let cloudposy = new Array();
  cloudposx[0] = tempcloudposx[0];
  cloudposy[0] = tempcloudposy[0];
  cloudposx[1] = tempcloudposx[1];
  cloudposy[1] = tempcloudposy[1];
  cloudposx[2] = tempcloudposx[3];
  cloudposy[2] = tempcloudposy[3];
  cloudposx[3] = tempcloudposx[2];
  cloudposy[3] = tempcloudposy[2];
  cloudposx[4] = tempcloudposx[4];
  cloudposy[4] = tempcloudposy[4];
  cloudposx[5] = tempcloudposx[6];
  cloudposy[5] = tempcloudposy[6];
  cloudposx[6] = tempcloudposx[5];
  cloudposy[6] = tempcloudposy[5];
  cloudposx[7] = tempcloudposx[7];
  cloudposy[7] = tempcloudposy[7];
  cloudposx[8] = tempcloudposx[8];
  cloudposy[8] = tempcloudposy[8];
  cloudposx[9] = tempcloudposx[10];
  cloudposy[9] = tempcloudposy[10];
  cloudposx[10] = tempcloudposx[9];
  cloudposy[10] = tempcloudposy[9];
  cloudposx[11] = tempcloudposx[11];
  cloudposy[11] = tempcloudposy[11];
  cloudposx[12] = tempcloudposx[13];
  cloudposy[12] = tempcloudposy[13];
  cloudposx[13] = tempcloudposx[12];
  cloudposy[13] = tempcloudposy[12];

  /* SET MORE VARIABLES */

  let clouds: JSX.Element[] = [];
  //let maxClouds = MAX_CLOUDS; // max number of clouds
  let thisscaleValue = scaleValue;
  let thisspacing = spacing;
  let speedindex = 1000; // this is the basis for the cloud speed - the higher the number the slower
  let invertedcloudspeed = 0; // this is for speed
  let keynum = 0; // to keep track of keys - to give each element a unique ID
  let keynumA = "";
  let keynumB = "";
  let keynumC = "";
  let adjustedY = 300; // pushes down clouds on page
  let cloudW = 360; // cloud width
  let cloudH = 360; // cloud height
  let loopfromvalue = 0; // loop from value - where loop starts
  let looptovalue = 0; // loop to value - where the loop ends
  let thiscloudSpeed = 0; // thiscloudspeed is so that clouds can go in both directions. this is the absolute value of cloudspeed

  let showbackground = compCtx.background;
  if (useMask) {
    showbackground = "#fff";
  } /* use white background when using mask - need to get mask bg working ... */

  /* prevent overloading - maximum number of elements */
  while (numElements * numRows * numClouds > 430) {
    numRows--;
    numClouds--;
  }

  /* BUILD THE CLOUDS */

  // cloud rows
  for (let k = 0; k < numRows; k++) {
    // clouds
    for (let j = 0; j < numClouds; j++) {
      // cloud elements
      for (let i = 0; i < numElements; i++) {
        keynum++; // keep track of the keys for unique elements
        keynumA = keynum.toString() + "A";
        keynumB = keynum.toString() + "B";
        keynumC = keynum.toString() + "C";

        // CLOUDS GET BIGGER WITH EACH ROW
        thisscaleValue = scaleValue + k * 0.6 * parallaxSize;
        thisspacing = spacing + k * 0.3 * parallaxSize;
        thiscloudSpeed = Math.abs(cloudSpeed);

        // CLOUDS GET FASTER WITH EACH ROW
        if (cloudSpeed == 0) {
          invertedcloudspeed = 2000;
        } else {
          invertedcloudspeed =
            speedindex /
            ((thiscloudSpeed + 3) *
              (thiscloudSpeed + 3) *
              (k * parallaxSpeed * 0.2 + 1)); // the greater the speed the smaller the inverted cloud speed
        }

        // CREATES THE RHYTHMIC PULSING EFFECT - WITH DIFFERENT STARTTIMES
        let starttime = (pulseDuration / numElements) * i - 10;

        // get negative values for cloud size - for offsets
        let cloudWneg = cloudW * -1;
        let cloudHneg = cloudH * -1;

        /* LOCATIONS OF CLOUDS */
        let xposbase = 700 * thisscaleValue * cloudDistance; // basis for xpos
        let xpos = cloudposx[i] * thisspacing + j * xposbase - cloudW;
        let ypos =
          cloudposy[i] * thisspacing +
          k * rowDistance * 100 * thisscaleValue +
          adjustedY -
          cloudH;

        // CALCULATE LOOPING
        // this is tricky to make smooth without skipping...  this also affects the speed
        // make the calculations for the first cloud of each row - since that will determine the looping start and end points
        if (j == 0) {
          loopfromvalue = Math.round(xposbase * -2); // start of the loop is 1 cloud to the left
          looptovalue = Math.round(xposbase * -1);
          if (cloudSpeed < 0) {
            // reverse direction
            //let newlooptovalue = loopfromvalue * -1;
            //let newloopfromvalue = looptovalue * -1;
            // these are tricky for some reason. add values to make it work right
            loopfromvalue = -screenWidth;
            looptovalue = Math.round(xposbase * -1) - screenWidth;
          } else if (cloudSpeed == 0) {
            // if not moving then start on the screen (not off)
            loopfromvalue = Math.round(xposbase * 5 * -1) + 600;
            looptovalue = loopfromvalue;
          }
          if (cloudSpeed != 0) {
            //console.log('loopfromvalue:'+loopfromvalue);
            //console.log('looptovalue:'+looptovalue);
          }
        }

        // CREATE THE CLOUDS
        clouds.push(
          <g
            key={`${keynumA}`}
            transform={`translate(${cloudWneg},${cloudHneg})`}
          >
            /* move */
            <animateTransform
              attributeName="transform"
              type="translate"
              from={`${loopfromvalue} 0`}
              to={`${looptovalue} 0`}
              begin="0s"
              dur={`${invertedcloudspeed}s`}
              repeatCount="indefinite"
              additive="sum"
              fill="freeze"
            />
            <g
              key={`${keynumB}`}
              transform={`translate(${xpos} ${ypos}) scale(${thisscaleValue} ${thisscaleValue})`}
            >
              <g
                key={`${keynumC}`}
                transform={`translate(${cloudWneg},${cloudHneg})`}
              >
                /* render the style of cloud */
                <ElementSwitch
                  thisstyle={cloudStyle}
                  fill={compCtx.fill}
                  stroke={compCtx.stroke}
                  strokewidth={strokewidth}
                  gradientOffset1={gradientOffset1}
                  gradientOffset2={gradientOffset2}
                />
                /* rotate */
                <animateTransform
                  attributeName="transform"
                  type="rotate"
                  from={`0 ${cloudW} ${cloudH}`}
                  to={`${rotationAngle} ${cloudW} ${cloudH}`}
                  dur={`${rotationDuration}s`}
                  repeatCount="indefinite"
                  additive="sum"
                />
              </g>
              /* pulse */
              <animateTransform
                attributeName="transform"
                type="scale"
                dur={`${pulseDuration}s`}
                values={`${pulseminValue};${pulse2Value};${pulse3Value};${pulse4Value};${pulseValue};${pulse4Value};${pulse3Value};${pulse2Value};${pulseminValue};`}
                begin={`${starttime}s`}
                repeatCount="indefinite"
                additive="sum"
              />
            </g>
          </g>
        );
      }
    }
  }

  return (
    <>
      <div
        className="canvas clouds"
        style={{ backgroundColor: showbackground }}
      >
        <svg viewBox="-3000 -1000 12000 9000" width="100%" height="100%">
          {useMask ? (
            <>
              <circle
                stroke="2"
                cx={`${maskX - 2000}`}
                cy={`${maskY}`}
                r={`${maskRadius}`}
                fill={`${compCtx.background}`}
              ></circle>
              <clipPath id="cloud-circle-mask">
                <circle
                  cx={`${maskX - 2000}`}
                  cy={`${maskY}`}
                  r={`${maskRadius}`}
                />
              </clipPath>
              <g clipPath="url(#cloud-circle-mask)">{clouds}</g>
            </>
          ) : (
            clouds
          )}
        </svg>
      </div>

      <div className="sidebar clouds">
        <CompositionContextWidget ctx={compCtx} onChange={setCompCtx} />

        <RandomizerWidget
          onColorsChange={(colors) => setCompCtx({ ...compCtx, ...colors })}
          onSymbolsChange={(rng) => {
            0;
          }}
        ></RandomizerWidget>

        <button
          accessKey="s"
          onClick={randomizestyles}
          className="clouds button"
        >
          Randomize <u>S</u>ettings
        </button>

        <button
          accessKey="c"
          onClick={randomizestylesandcolors}
          className="clouds button"
        >
          Randomize Settings and <u>C</u>olors
        </button>

        <Checkbox
          label="Mask with circle"
          value={useMask}
          onChange={setUseMask}
        />

        <div className="cloud-settings">
          <ShowSettings numSettings={numSettings} cS={cS} />
        </div>
      </div>
    </>
  );
};

export const CloudsPage: React.FC<{}> = () => {
  return (
    <Page title="Clouds">
      <Clouds />
    </Page>
  );
};
