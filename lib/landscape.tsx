/* IMPORTS */
import React, { useState } from "react";
import { RandomizerWidget } from "./randomizer-widget";
import { NumericSlider } from "./numeric-slider";
import {
  CompositionContextWidget,
  createSvgCompositionContext,
} from "./svg-composition-context";
import { Checkbox } from "./checkbox";
/* TO DO: Get symbols randomly or from a pulldown */

/* INITIAL VALUES */
const LANDSCAPE_STROKE = "#006633";
const LANDSCAPE_FILL = "#33cc33";
const LANDSCAPE_STROKEWIDTH = 5;
const LANDSCAPE_STYLE = 12;
const GRADIENT_OFFSET1 = 43;
const GRADIENT_OFFSET2 = 96;
const NUM_ELEMENTS = 9;
const NUM_LANDSCAPES = 3;
const LANDSCAPE_DISTANCE = 3;
const MAX_LANDSCAPE_DISTANCE = 10;
const NUM_ROWS = 4;
const ROW_DISTANCE = 6;
const LANDSCAPE_SPEED = 0;
const PARALLAX_SPEED = 1;
const PARALLAX_SIZE = 1.4;
const LANDSCAPE_SPACING = 0.4;
const LANDSCAPE_SCALE = 1;
const LANDSCAPE_PULSEMIN = 1;
const LANDSCAPE_PULSE = 1;
const PULSE_DURATION = 2.6;
const BG_COLOR = "#FFFFFF00";
const SCREEN_WIDTH = 12000;
const MASK_RADIUS = 2000;
const MASK_X = 4500;
const MASK_Y = 3000;

let screenWidth = SCREEN_WIDTH;

/* LANDSCAPE SVG */

/* TREE 1 */
const Landscape1: React.FC<{
  stroke: string;
  fill: string;
  strokewidth: number;
  gradientOffset1: number;
  gradientOffset2: number;
}> = ({ stroke, fill, strokewidth, gradientOffset1, gradientOffset2 }) => (
  <>
    <radialGradient id="tree1" cx="49.99%" cy="71.26%" r="55.07%">
      <stop offset={gradientOffset1 + "%"} stopColor={fill}></stop>
      <stop offset={gradientOffset2 + "%"} stopColor={stroke}></stop>
    </radialGradient>
    <path
      id="S1"
      fill="url(#tree1)"
      fillRule="evenodd"
      stroke="none"
      d="M 360.000 9.479 C 360.022 9.523 639.277 216.190 579.984 446.590 C 545.544 580.416 439.312 626.576 360.000 626.576 C 280.688 626.576 174.456 580.416 140.016 446.590 C 80.723 216.190 359.978 9.523 360.000 9.479 Z"
    />
    <path
      id="S2"
      fill={fill}
      fillRule="evenodd"
      strokeWidth={strokewidth}
      stroke={stroke}
      d="M 343.817 530.987 C 345.366 464.010 346.915 397.033 348.463 330.056 C 303.242 281.968 211.489 187.166 212.798 185.791 C 213.978 184.552 349.015 303.092 349.028 303.103 C 349.029 303.077 356.928 40.000 360.000 40.000 C 363.125 40.000 367.314 215.402 370.972 303.103 C 370.985 303.092 506.021 184.552 507.202 185.791 C 508.513 187.165 416.822 281.902 371.632 329.957 C 373.279 396.842 374.927 463.727 376.575 530.611 C 376.594 530.594 569.667 356.489 571.381 358.264 C 573.262 360.212 377.200 564.739 377.181 564.759 C 377.181 564.773 380.000 699.986 380.000 700.000 C 379.996 700.000 340.004 700.000 340.000 700.000 C 340.000 699.986 342.219 610.194 343.329 565.292 C 278.426 496.282 146.739 360.213 148.619 358.264 C 150.352 356.467 343.798 530.970 343.817 530.987 Z"
    />
  </>
);

/* TREE 2 */
const Landscape2: React.FC<{
  stroke: string;
  fill: string;
  strokewidth: number;
  gradientOffset1: number;
  gradientOffset2: number;
}> = ({ stroke, fill, strokewidth, gradientOffset1, gradientOffset2 }) => (
  <>
    <radialGradient id="tree2" cx="49.99%" cy="71.26%" r="55.07%">
      <stop offset={gradientOffset1 + "%"} stopColor={fill}></stop>
      <stop offset={gradientOffset2 + "%"} stopColor={stroke}></stop>
    </radialGradient>
    <path
      id="S1"
      fill="url(#tree2)"
      fillRule="evenodd"
      stroke="none"
      d="M 360.000 546.962 C 504.834 546.962 621.672 430.124 621.672 285.291 C 621.672 140.457 504.834 23.619 360.000 23.619 C 215.166 23.619 98.328 140.457 98.328 285.291 C 98.328 430.124 215.166 546.962 360.000 546.962 Z"
    />
    <path
      id="S2"
      fill={fill}
      fillRule="evenodd"
      strokeWidth={strokewidth}
      stroke={stroke}
      d="M 341.133 417.525 C 342.938 357.054 344.744 296.582 346.550 236.111 C 301.966 214.996 212.449 174.142 212.798 172.767 C 213.126 171.475 347.195 211.929 347.208 211.933 C 347.209 211.916 357.989 40.000 360.000 40.000 C 362.046 40.000 368.528 154.622 372.792 211.933 C 372.805 211.929 506.873 171.475 507.202 172.766 C 507.552 174.141 418.108 214.898 373.561 235.963 C 375.482 296.290 377.403 356.617 379.324 416.944 C 379.344 416.937 570.739 343.403 571.381 345.240 C 572.074 347.221 380.050 453.250 380.031 453.261 C 380.031 453.285 383.318 699.975 383.318 700.000 C 383.313 700.000 336.687 700.000 336.682 700.000 C 336.682 699.975 339.270 536.055 340.564 454.083 C 276.582 417.802 147.922 347.223 148.619 345.240 C 149.272 343.382 341.114 417.518 341.133 417.525 Z"
    />
  </>
);

/* TREE 3 */
const Landscape3: React.FC<{
  stroke: string;
  fill: string;
  strokewidth: number;
  gradientOffset1: number;
  gradientOffset2: number;
}> = ({ stroke, fill, strokewidth, gradientOffset1, gradientOffset2 }) => (
  <>
    <radialGradient id="tree3" cx="49.99%" cy="71.26%" r="55.07%">
      <stop offset={gradientOffset1 + "%"} stopColor={fill}></stop>
      <stop offset={gradientOffset2 + "%"} stopColor={stroke}></stop>
    </radialGradient>
    <path
      id="S1"
      fill="url(#tree3)"
      fillRule="evenodd"
      stroke="none"
      d="M 360.000 9.479 C 360.022 9.523 639.277 216.190 579.984 446.590 C 545.544 580.416 439.312 626.576 360.000 626.576 C 280.688 626.576 174.456 580.416 140.016 446.590 C 80.723 216.190 359.978 9.523 360.000 9.479 Z"
    />
    <path
      id="S2"
      fill={fill}
      fillRule="evenodd"
      strokeWidth={strokewidth}
      stroke={stroke}
      d="M 350.865 219.383 C 350.866 219.365 357.905 40.000 360.000 40.000 C 362.131 40.000 366.090 159.588 369.135 219.383 C 369.145 219.375 470.522 145.994 471.249 146.939 C 472.063 147.995 403.539 210.179 369.684 241.799 C 371.056 284.509 372.428 327.219 373.800 369.928 C 428.040 336.981 535.566 269.550 536.520 271.085 C 537.565 272.768 374.321 400.312 374.305 400.325 C 374.305 400.337 376.702 524.261 376.702 524.274 C 376.720 524.266 555.433 440.611 556.195 442.322 C 557.022 444.181 377.312 557.836 377.339 558.230 C 375.004 600.704 380.000 699.986 380.000 700.000 C 379.996 700.000 340.004 700.000 340.000 700.000 C 340.000 699.986 342.868 557.984 342.868 557.970 C 283.180 519.420 162.974 444.180 163.805 442.321 C 164.573 440.606 343.505 525.524 343.523 525.533 C 343.523 525.520 345.255 442.376 346.120 400.798 C 290.230 357.561 177.416 272.820 178.450 271.085 C 179.406 269.480 346.510 370.253 346.527 370.263 C 347.816 327.469 349.105 284.675 350.395 241.881 C 316.514 210.234 247.938 147.996 248.751 146.939 C 249.477 145.994 350.855 219.375 350.865 219.383 Z"
    />
  </>
);

/* TREE 4 */
const Landscape4: React.FC<{
  stroke: string;
  fill: string;
  strokewidth: number;
  gradientOffset1: number;
  gradientOffset2: number;
}> = ({ stroke, fill, strokewidth, gradientOffset1, gradientOffset2 }) => (
  <>
    <radialGradient id="tree4" cx="49.99%" cy="71.26%" r="55.07%">
      <stop offset={gradientOffset1 + "%"} stopColor={fill}></stop>
      <stop offset={gradientOffset2 + "%"} stopColor={stroke}></stop>
    </radialGradient>
    <path
      id="S1"
      fill="url(#tree4)"
      fillRule="evenodd"
      stroke="none"
      d="M 341.764 570.226 C 341.767 570.226 378.233 570.226 378.236 570.226 C 378.236 570.237 378.236 683.405 378.236 683.416 C 378.233 683.416 341.767 683.416 341.764 683.416 C 341.764 683.405 341.764 570.237 341.764 570.226 Z"
    />
    <path
      id="S2"
      fill={fill}
      fillRule="evenodd"
      strokeWidth={strokewidth}
      stroke={stroke}
      d="M 360.000 36.584 C 360.004 36.593 400.495 129.642 400.499 129.651 C 400.497 129.651 383.186 124.454 383.184 124.454 C 383.189 124.464 430.140 230.254 430.145 230.265 C 430.142 230.264 407.433 224.632 407.430 224.632 C 407.437 224.645 476.901 358.533 476.908 358.547 C 476.904 358.546 442.488 346.631 442.485 346.630 C 442.493 346.645 523.663 499.391 523.671 499.406 C 523.666 499.405 480.648 489.179 480.644 489.178 C 480.652 489.195 557.319 659.658 557.326 659.675 C 557.307 659.670 360.020 605.055 360.000 605.050 C 359.980 605.055 162.693 659.670 162.674 659.675 C 162.681 659.658 239.348 489.195 239.356 489.178 C 239.352 489.179 196.334 499.405 196.329 499.406 C 196.337 499.391 277.507 346.645 277.515 346.630 C 277.512 346.631 243.096 358.546 243.093 358.547 C 243.099 358.533 312.563 224.645 312.570 224.632 C 312.567 224.632 289.858 230.264 289.855 230.265 C 289.860 230.254 336.811 124.464 336.816 124.454 C 336.814 124.454 319.503 129.651 319.501 129.651 C 319.505 129.642 359.996 36.593 360.000 36.584 Z"
    />
  </>
);

/* HILL 1 */
const Landscape5: React.FC<{
  stroke: string;
  fill: string;
  strokewidth: number;
  gradientOffset1: number;
  gradientOffset2: number;
}> = ({ stroke, fill, strokewidth, gradientOffset1, gradientOffset2 }) => (
  <>
    <radialGradient id="hill1" cx="49.99%" cy="71.26%" r="55.07%">
      <stop offset={gradientOffset1 + "%"} stopColor={fill}></stop>
      <stop offset={gradientOffset2 + "%"} stopColor={stroke}></stop>
    </radialGradient>
    <path
      id="S1"
      fill="url(#hill1)"
      fillRule="evenodd"
      strokeWidth={strokewidth}
      stroke="none"
      d="M 700.000 530.000 C 700.000 330.000 548.188 190.000 360.000 190.000 C 171.812 190.000 20.000 330.000 20.000 530.000 C 20.000 530.000 699.932 530.000 700.000 530.000 Z"
    />
  </>
);

/* MOUNTAIN 1 */
const Landscape6: React.FC<{
  stroke: string;
  fill: string;
  strokewidth: number;
  gradientOffset1: number;
  gradientOffset2: number;
}> = ({ stroke, fill, strokewidth, gradientOffset1, gradientOffset2 }) => (
  <>
    <radialGradient id="mountain1" cx="49.99%" cy="71.26%" r="55.07%">
      <stop offset={gradientOffset1 + "%"} stopColor={fill}></stop>
      <stop offset={gradientOffset2 + "%"} stopColor={stroke}></stop>
    </radialGradient>
    <path
      id="S1"
      fill="url(#mountain1)"
      fillRule="evenodd"
      stroke="none"
      d="M 840.668 88.230 C 840.695 88.252 1109.610 316.905 1109.637 316.927 C 1109.583 316.927 571.753 316.927 571.699 316.927 C 571.726 316.905 840.641 88.252 840.668 88.230 Z"
    />
    <path
      id="S2"
      fill={fill}
      fillRule="evenodd"
      strokeWidth={strokewidth}
      stroke={stroke}
      d="M 736.785 176.561 C 736.795 176.552 840.658 88.240 840.668 88.231 C 840.678 88.240 944.541 176.552 944.551 176.561 C 944.547 176.560 902.822 163.594 902.817 163.593 C 902.817 163.596 900.734 191.856 900.733 191.859 C 900.730 191.856 865.403 167.382 865.399 167.379 C 865.397 167.382 840.671 196.748 840.668 196.751 C 840.665 196.748 812.924 168.490 812.921 168.487 C 812.918 168.489 781.881 192.964 781.878 192.966 C 781.877 192.964 773.420 165.258 773.420 165.255 C 773.416 165.256 736.788 176.560 736.785 176.561 Z"
    />
  </>
);

/* RETURN THE LANDSCAPE STYLE WHICH WAS SELECTED */
const ElementSwitch: React.FC<{
  thisstyle: number;
  fill: string;
  stroke: string;
  strokewidth: number;
  gradientOffset1: number;
  gradientOffset2: number;
}> = (props) => {
  /* style 7 is random */

  let usethisstyle = props.thisstyle;
  if (props.thisstyle == 7) {
    usethisstyle = Math.floor(Math.random() * 6) + 1;
  } else if (props.thisstyle == 8) {
    usethisstyle = Math.floor(Math.random() * 6) + 1;
  } else if (props.thisstyle == 9) {
    usethisstyle = Math.floor(Math.random() * 6) + 1;
  } else if (props.thisstyle == 10) {
    usethisstyle = Math.floor(Math.random() * 6) + 1;
  } else if (props.thisstyle == 11) {
    usethisstyle = Math.floor(Math.random() * 4) + 1;
  } else if (props.thisstyle == 12) {
    usethisstyle = Math.floor(Math.random() * 4) + 2;
  } else if (props.thisstyle == 13) {
    usethisstyle = Math.floor(Math.random() * 2) + 5;
  }
  if (usethisstyle == 2) {
    return (
      <Landscape2
        fill={props.fill}
        stroke={props.stroke}
        strokewidth={props.strokewidth}
        gradientOffset1={props.gradientOffset1}
        gradientOffset2={props.gradientOffset2}
      />
    );
  } else if (usethisstyle == 3) {
    return (
      <Landscape3
        fill={props.fill}
        stroke={props.stroke}
        strokewidth={props.strokewidth}
        gradientOffset1={props.gradientOffset1}
        gradientOffset2={props.gradientOffset2}
      />
    );
  } else if (usethisstyle == 4) {
    return (
      <Landscape4
        fill={props.fill}
        stroke={props.stroke}
        strokewidth={props.strokewidth}
        gradientOffset1={props.gradientOffset1}
        gradientOffset2={props.gradientOffset2}
      />
    );
  } else if (usethisstyle == 5) {
    return (
      <Landscape5
        fill={props.fill}
        stroke={props.stroke}
        strokewidth={props.strokewidth}
        gradientOffset1={props.gradientOffset1}
        gradientOffset2={props.gradientOffset2}
      />
    );
  } else if (usethisstyle == 6) {
    return (
      <Landscape6
        fill={props.fill}
        stroke={props.stroke}
        strokewidth={props.strokewidth}
        gradientOffset1={props.gradientOffset1}
        gradientOffset2={props.gradientOffset2}
      />
    );
  } else {
    return (
      <Landscape1
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
const LandscapeRender: React.FC<{}> = () => {
  let [strokewidth, setStrokewidth] = useState(LANDSCAPE_STROKEWIDTH);
  let [landscapeStyle, setlandscapeStyle] = useState(LANDSCAPE_STYLE);
  let [gradientOffset1, setgradientOffset1] = useState(GRADIENT_OFFSET1);
  let [gradientOffset2, setgradientOffset2] = useState(GRADIENT_OFFSET2);
  let [numElements, setnumElements] = useState(NUM_ELEMENTS);
  //let [numLandscapes, setnumLandscapes] = useState(NUM_LANDSCAPES);
  let numLandscapes = NUM_LANDSCAPES;
  let [landscapeDistance, setlandscapeDistance] = useState(LANDSCAPE_DISTANCE);
  let [numRows, setnumRows] = useState(NUM_ROWS);
  let [rowDistance, setrowDistance] = useState(ROW_DISTANCE);
  let [landscapeSpeed] = useState(LANDSCAPE_SPEED);
  let [parallaxSpeed] = useState(PARALLAX_SPEED);
  let [parallaxSize, setparallaxSize] = useState(PARALLAX_SIZE);
  let [pulseDuration, setPulseDuration] = useState(PULSE_DURATION);
  let [spacing, setSpacing] = useState(LANDSCAPE_SPACING);
  let [scaleValue, setScaleValue] = useState(LANDSCAPE_SCALE);
  let [pulseValue, setPulseValue] = useState(LANDSCAPE_PULSE);
  let [pulseminValue, setPulseminValue] = useState(LANDSCAPE_PULSEMIN);
  let [compCtx, setCompCtx] = useState(
    createSvgCompositionContext({
      background: BG_COLOR,
      stroke: LANDSCAPE_STROKE,
      fill: LANDSCAPE_FILL,
    })
  );
  let [useMask, setUseMask] = useState(false);
  let [noBackground, setnoBackground] = useState(false);
  let [maskRadius, setMaskRadius] = useState(MASK_RADIUS);
  let [maskX, setMaskX] = useState(MASK_X);
  let [maskY, setMaskY] = useState(MASK_Y);

  // landscape Settings - two dimensional object of settings
  let cS: { [key: string]: any } = {};
  let sN = 0; // setting number
  let numSettings = 0; // count the settings

  // SET UP THE SETTINGS - with Min, Max and Step
  cS[sN] = [];
  cS[sN]["id"] = "landscapeStyle";
  cS[sN]["label"] = "Landscape Style";
  cS[sN]["value"] = landscapeStyle;
  cS[sN]["setter"] = setlandscapeStyle;
  cS[sN]["min"] = 1;
  cS[sN]["max"] = 13;
  cS[sN]["step"] = 1;
  cS[sN]["suffix"] = "";
  sN++;

  cS[sN] = [];
  cS[sN]["id"] = "gradientOffset1";
  cS[sN]["label"] = "Gradient Offset 1";
  cS[sN]["value"] = gradientOffset1;
  cS[sN]["setter"] = setgradientOffset1;
  cS[sN]["min"] = 1;
  cS[sN]["max"] = 70;
  cS[sN]["step"] = 1;
  cS[sN]["suffix"] = "%";

  sN++;
  cS[sN] = [];
  cS[sN]["id"] = "gradientOffset2";
  cS[sN]["label"] = "Gradient Offset 2";
  cS[sN]["value"] = gradientOffset2;
  cS[sN]["setter"] = setgradientOffset2;
  cS[sN]["min"] = 71;
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
  cS[sN]["max"] = 20;
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
  cS[sN]["id"] = "landscapeDistance";
  cS[sN]["label"] = "Distance between landscapes";
  cS[sN]["value"] = landscapeDistance;
  cS[sN]["setter"] = setlandscapeDistance;
  cS[sN]["min"] = 2;
  cS[sN]["max"] = MAX_LANDSCAPE_DISTANCE;
  cS[sN]["step"] = 1;
  cS[sN]["suffix"] = "";

  sN++;
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

  /*
  sN++;
  cS[sN] = [];
  cS[sN]["id"] = "landscapeSpeed";
  cS[sN]["label"] = "Landscape speed";
  cS[sN]["value"] = landscapeSpeed;
  cS[sN]["setter"] = setlandscapeSpeed;
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
  cS[sN]["min"] = 0.1;
  cS[sN]["max"] = 2;
  cS[sN]["step"] = 0.1;
  cS[sN]["suffix"] = "";
*/

  sN++;
  cS[sN] = [];
  cS[sN]["id"] = "parallaxSize";
  cS[sN]["label"] = "Parallax size";
  cS[sN]["value"] = parallaxSize;
  cS[sN]["setter"] = setparallaxSize;
  cS[sN]["min"] = 0.8;
  cS[sN]["max"] = 3;
  cS[sN]["step"] = 0.1;
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
  cS[sN]["min"] = 0.8;
  cS[sN]["max"] = 1.5;
  cS[sN]["step"] = 0.1;
  cS[sN]["suffix"] = "";

  sN++;
  cS[sN] = [];
  cS[sN]["id"] = "pulseminValue";
  cS[sN]["label"] = "Pulse Size Min";
  cS[sN]["value"] = pulseminValue;
  cS[sN]["setter"] = setPulseminValue;
  cS[sN]["min"] = 0.8;
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
  cS[sN]["max"] = 1.2;
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
  cS[sN]["max"] = 9000;
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

  function randomizesettingsorcolors(mode: string): void {
    //console.log('randomize styles! num of settings:' + numSettings);

    let startWithSetting = 0;

    if (mode == "exceptstyles") {
      startWithSetting = 1;
    }

    for (let i = startWithSetting; i <= numSettings; i++) {
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
  function randomizesettings() {
    randomizesettingsorcolors("nocolors");
  }
  function randomizesettingsexceptstyles() {
    randomizesettingsorcolors("exceptstyles");
  }
  function randomizesettingsandcolors() {
    randomizesettingsorcolors("withcolors");
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

  /* LANDSCAPE ELEMENTS: create an array for the position of each element */
  let templandscapeposx = [
    -400, 400, -900, 0, 900, -400, 400, -1200, 1200, -900, 0, 900, -400, 400,
  ];
  let templandscapeposy = [
    400, 400, 1000, 1000, 1000, 1600, 1600, 1600, 1600, 2200, 2200, 2200, 2800,
    2800,
  ];
  //const landscapeposx = [-400, 400, -900,   0,  900,  -400,    400, -1200, 1200, -900,   0,   900, -400,  400  ];
  //const landscapeposy = [   400,   400,  1000, 1000,  1000,   1600,  1600,  1600, 1600, 2200, 2200, 2200, 2800, 2800  ];
  // rearrange them to provide the correct pulse:
  let landscapeposx = new Array();
  let landscapeposy = new Array();
  landscapeposx[0] = templandscapeposx[0];
  landscapeposy[0] = templandscapeposy[0];
  landscapeposx[1] = templandscapeposx[1];
  landscapeposy[1] = templandscapeposy[1];
  landscapeposx[2] = templandscapeposx[3];
  landscapeposy[2] = templandscapeposy[3];
  landscapeposx[3] = templandscapeposx[2];
  landscapeposy[3] = templandscapeposy[2];
  landscapeposx[4] = templandscapeposx[4];
  landscapeposy[4] = templandscapeposy[4];
  landscapeposx[5] = templandscapeposx[6];
  landscapeposy[5] = templandscapeposy[6];
  landscapeposx[6] = templandscapeposx[5];
  landscapeposy[6] = templandscapeposy[5];
  landscapeposx[7] = templandscapeposx[7];
  landscapeposy[7] = templandscapeposy[7];
  landscapeposx[8] = templandscapeposx[8];
  landscapeposy[8] = templandscapeposy[8];
  landscapeposx[9] = templandscapeposx[10];
  landscapeposy[9] = templandscapeposy[10];
  landscapeposx[10] = templandscapeposx[9];
  landscapeposy[10] = templandscapeposy[9];
  landscapeposx[11] = templandscapeposx[11];
  landscapeposy[11] = templandscapeposy[11];
  landscapeposx[12] = templandscapeposx[13];
  landscapeposy[12] = templandscapeposy[13];
  landscapeposx[13] = templandscapeposx[12];
  landscapeposy[13] = templandscapeposy[12];

  /* SET MORE VARIABLES */

  let landscapes: JSX.Element[] = [];
  //let maxLandscapes = MAX_LANDSCAPES; // max number of landscapes
  let thisscaleValue = scaleValue;
  let thisspacing = spacing;
  let speedindex = 4000; // this is the basis for the landscape speed - the higher the number the slower
  let invertedlandscapespeed = 0; // this is for speed
  let keynum = 0; // to keep track of keys - to give each element a unique ID
  let keynumA = "";
  let keynumB = "";
  let keynumC = "";
  let adjustedY = 300; // pushes down landscapes on page
  let landscapeW = 360; // landscape width
  let landscapeH = 360; // landscape height
  let landscapeWneg = landscapeW * -1; // get negative values for landscape size - for offsets
  let landscapeHneg = landscapeH * -1;
  let loopfromvalue = 0; // loop from value - where loop starts.
  let looptovalue = 0; // loop to value - where the loop ends.
  let loopstartadjust = -8; // adjust the loopstart based on distance between landscapes.
  //The smaller the space between landscapes the farther to the left it needs to start
  let loopendadjust = -7; // adjust the loopend based on distance between landscapes.
  // The bigger the space between landscapes the farther to the right it needs to end
  let thislandscapeSpeed = 0; // thislandscapespeed is so that landscapes can go in both directions.  This is the absolute value of landscapespeed

  let showbackground = compCtx.background;
  if (useMask) {
    showbackground = "#FFFFFF00";
  } /* use white background when using mask - need to get mask bg working ... */

  if (noBackground) {
    showbackground = "#FFFFFF00";
  }

  /* Adjust the number of landscapes based on landscape distance, scale and spacing  */
  numLandscapes =
    Math.round(
      (MAX_LANDSCAPE_DISTANCE + 14) /
        landscapeDistance /
        (scaleValue / 3 + spacing / 2)
    ) + 14;

  /* prevent overloading - maximum number of elements */
  while (numElements * numRows * numLandscapes > 1500) {
    while (numElements * numRows * numLandscapes > 3000) {
      numRows--;
    }
    numElements--;
  }

  /* Adjust the speed based on number of landscapes. Needs to speed up as numLandscapes increases */
  speedindex = Math.round(speedindex * (landscapeDistance / 100));

  /* Adjust the loop start and end based on number of landscapes */
  loopstartadjust =
    loopstartadjust -
    Math.round(MAX_LANDSCAPE_DISTANCE / landscapeDistance / (3 * scaleValue));
  loopendadjust = loopstartadjust + 1;
  //loopendadjust = loopendadjust - Math.round(MAX_LANDSCAPE_DISTANCE / landscapeDistance / 3);

  /* BUILD THE LANDSCAPES */

  // landscape rows
  for (let k = 0; k < numRows; k++) {
    // landscapes
    for (let j = 0; j < numLandscapes; j++) {
      // landscape elements
      for (let i = 0; i < numElements; i++) {
        keynum++; // keep track of the keys for unique elements
        keynumA = keynum.toString() + "A";
        keynumB = keynum.toString() + "B";
        keynumC = keynum.toString() + "C";

        // LANDSCAPES GET BIGGER WITH EACH ROW
        thisscaleValue = scaleValue + k * 0.6 * parallaxSize;
        thisspacing = spacing + k * 0.3 * parallaxSize;
        thislandscapeSpeed = Math.abs(landscapeSpeed);

        // LANDSCAPES GET FASTER WITH EACH ROW
        if (landscapeSpeed == 0) {
          invertedlandscapespeed = 2000;
        } else {
          invertedlandscapespeed =
            speedindex /
            ((thislandscapeSpeed + 3) *
              (thislandscapeSpeed + 3) *
              (k * parallaxSpeed * 0.08 + 1)); // the greater the speed the smaller the inverted landscape speed
        }

        // CREATES THE RHYTHMIC PULSING EFFECT - WITH DIFFERENT STARTTIMES
        let starttime = (pulseDuration / numElements) * i - 10;

        /* LOCATIONS OF LANDSCAPES */
        let xposbase = 500 * thisscaleValue * landscapeDistance; // basis for xpos
        let xpos = landscapeposx[i] * thisspacing + j * xposbase - landscapeW;
        let ypos =
          landscapeposy[i] * thisspacing +
          k * rowDistance * 100 * thisscaleValue +
          adjustedY -
          landscapeH;

        // CALCULATE LOOPING
        // this is tricky to make smooth without skipping...  this also affects the speed
        // make the calculations for the first landscape of each row - since that will determine the looping start and end points
        if (j == 0) {
          loopfromvalue = Math.round(xposbase * loopstartadjust); // start of the loop is 5 landscapes to the left
          looptovalue = Math.round(xposbase * loopendadjust);
          if (landscapeSpeed < 0) {
            // reverse direction
            // these are tricky for some reason. add values to make it work right
            let temploopfromvalue = loopfromvalue;
            let templooptovalue = looptovalue;
            loopfromvalue = templooptovalue;
            looptovalue = temploopfromvalue;
            //loopfromvalue = -screenWidth;
            //looptovalue = Math.round(xposbase * (loopstartadjust + 3)) - screenWidth;
          } else if (landscapeSpeed == 0) {
            // if not moving then start on the screen (not off)
            loopfromvalue =
              Math.round(
                xposbase * (MAX_LANDSCAPE_DISTANCE / landscapeDistance / 1) * -4
              ) + 600;
            looptovalue = loopfromvalue;
          }
          if (landscapeSpeed != 0) {
            //console.log('loopfromvalue:'+loopfromvalue);
            //console.log('looptovalue:'+looptovalue);
          }
        }

        // CREATE THE LANDSCAPES
        landscapes.push(
          <g
            key={`${keynumA}`}
            transform={`translate(${landscapeWneg},${landscapeHneg})`}
          >
            /* move */
            <animateTransform
              attributeName="transform"
              type="translate"
              from={`${loopfromvalue} 0`}
              to={`${looptovalue} 0`}
              begin="0s"
              dur={`${invertedlandscapespeed}s`}
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
                transform={`translate(${landscapeWneg},${landscapeHneg})`}
              >
                /* render the style of landscape */
                <ElementSwitch
                  thisstyle={landscapeStyle}
                  fill={compCtx.fill}
                  stroke={compCtx.stroke}
                  strokewidth={strokewidth}
                  gradientOffset1={gradientOffset1}
                  gradientOffset2={gradientOffset2}
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
        className="canvas landscape"
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
              <clipPath id="landscape-circle-mask">
                <circle
                  cx={`${maskX - 2000}`}
                  cy={`${maskY}`}
                  r={`${maskRadius}`}
                />
              </clipPath>
              <g clipPath="url(#landscape-circle-mask)">{landscapes}</g>
            </>
          ) : (
            landscapes
          )}
        </svg>
      </div>
      <div className="sidebar landscape">
        <div className="sidebarTitle">Landscape Settings</div>
        <button
          accessKey="c"
          onClick={randomizesettingsandcolors}
          className="landscapes button"
        >
          Randomize Settings and <u>C</u>olors
        </button>

        <button
          accessKey="s"
          onClick={randomizesettings}
          className="landscapes button"
        >
          Randomize <u>S</u>ettings
        </button>

        <button
          accessKey="x"
          onClick={randomizesettingsexceptstyles}
          className="landscapes button"
        >
          Randomize Settings e<u>x</u>cept Styles
        </button>

        <RandomizerWidget
          onColorsChange={(colors) => setCompCtx({ ...compCtx, ...colors })}
          onSymbolsChange={(rng) => {
            0;
          }}
        ></RandomizerWidget>

        <CompositionContextWidget ctx={compCtx} onChange={setCompCtx} />

        <Checkbox
          label="No background"
          value={noBackground}
          onChange={setnoBackground}
        />

        <Checkbox
          label="Mask with circle"
          value={useMask}
          onChange={setUseMask}
        />

        <div className="landscape-settings">
          <ShowSettings numSettings={numSettings} cS={cS} />
        </div>
      </div>
    </>
  );
};

export const Landscape: React.FC<{}> = () => {
  return <LandscapeRender />;
};
