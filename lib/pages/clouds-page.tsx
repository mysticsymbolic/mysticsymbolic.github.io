/* 2021-05-31 Dave Weaver, @webaissance - based on waves-page.tsx */
/* IMPORTS */
import React, { useState } from "react";
import { Page } from "../page";
import {
  CompositionContextWidget,
  createSvgCompositionContext,
} from "../svg-composition-context";
import { Checkbox } from "../checkbox";
import { ColorWidget } from "../color-widget";
import { RandomizerWidget } from "../randomizer-widget";
import { VocabularyWidget } from "../vocabulary-widget";
import { SvgVocabulary, SvgVocabularyWithBlank } from "../svg-vocabulary";
import {
  EMPTY_SVG_SYMBOL_DATA,
  noFillIfShowingSpecs,
  SvgSymbolData,
} from "../svg-symbol";
import {
  CompositionContextWidget,
  createSvgCompositionContext,
} from "../svg-composition-context";

/* TO DO: Get symbols randomly or from a pulldown */
/* CLOUD SVG */
const Cloud: React.FC<{
  stroke: string;
  fill: string;
	strokewidth: string; 
}> = ({ stroke, fill, strokewidth}) => (
  <>
<path fill={fill} fillRule="evenodd" stroke="none" d="M 360.000 596.177 C 500.811 596.177 614.404 482.584 614.404 341.774 C 614.404 200.963 500.811 87.370 360.000 87.370 C 219.189 87.370 105.596 200.963 105.596 341.774 C 105.596 482.584 219.189 596.177 360.000 596.177 Z"/>
<path fill="none" stroke={stroke} strokeWidth={strokewidth} strokeLinecap="round" strokeLinejoin="round" d="M 604.098 371.149 C 602.507 412.416 597.237 433.275 575.983 476.189 M 530.256 180.457 C 583.769 228.655 607.192 290.877 604.098 371.149 M 212.437 216.472 C 280.858 106.327 437.914 97.287 530.256 180.457 M 208.196 406.565 C 175.078 346.560 176.784 273.866 212.437 216.472 M 437.019 451.501 C 365.701 513.810 255.178 491.691 208.196 406.565 M 479.177 353.518 C 480.210 390.509 464.892 427.148 437.019 451.501 M 383.232 252.404 C 437.329 252.139 477.731 301.781 479.177 353.518 M 315.724 293.646 C 329.002 268.221 355.037 252.543 383.232 252.404 M 324.498 355.831 C 305.359 339.494 306.332 311.630 315.724 293.646 M 347.839 363.173 C 337.678 362.940 332.207 362.412 324.498 355.831 M 366.134 334.409 C 377.849 347.389 363.196 363.525 347.839 363.173 M 354.460 336.520 C 354.806 332.878 362.306 330.168 366.134 334.409 M 105.596 341.774 C 105.596 482.584 219.189 596.177 360.000 596.177 C 500.811 596.177 614.404 482.584 614.404 341.774 C 614.404 200.963 500.811 87.370 360.000 87.370 C 219.189 87.370 105.596 200.963 105.596 341.774 "/>
  </>
);


/* INITIAL VALUES */
const CLOUD_STROKE = "#79beda";
const CLOUD_FILL = "#2b7c9e";
const CLOUD_STROKEWIDTH = 30;
const NUM_ELEMENTS = 7;
const NUM_CLOUDS = 12;
const MAX_CLOUDS = 12;
const CLOUD_DISTANCE = 5;
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

const NumericSlider: React.FC<{
  id: string;
  label: string;
  onChange: (value: number) => void;
  value: number;
  min: number;
  max: number;
  step: number;
  valueSuffix?: string;
}> = (props) => {
  return (
    <p>
      <label htmlFor={props.id}>{props.label}</label>
      <input
        type="range"
        id={props.id}
        min={props.min}
        max={props.max}
        value={props.value}
        step={props.step}
        onChange={(e) => props.onChange(parseFloat(e.target.value))}
      />
      <span>
        {" "}
        {props.value}
        {props.valueSuffix}
      </span>
    </p>
  );
};

/* SETTERS AND VARIABLES */
const Clouds: React.FC<{}> = () => {
  const [stroke, setStroke] = useState(CLOUD_STROKE);
  let [strokewidth, setStrokewidth] = useState(CLOUD_STROKEWIDTH);
  const [fill, setFill] = useState(CLOUD_FILL);
  const [numElements, setnumElements] = useState(NUM_ELEMENTS);
  let [numClouds, setnumClouds] = useState(NUM_CLOUDS);
  const [cloudDistance, setcloudDistance] = useState(CLOUD_DISTANCE);
  let [numRows, setnumRows] = useState(NUM_ROWS);
  const [rowDistance, setrowDistance] = useState(ROW_DISTANCE);
  const [cloudSpeed, setcloudSpeed] = useState(CLOUD_SPEED);
  const [parallaxSpeed, setparallaxSpeed] = useState(PARALLAX_SPEED);
  const [parallaxSize, setparallaxSize] = useState(PARALLAX_SIZE);
  const [rotationSpeed, setRotationSpeed] = useState(ROTATION_SPEED);
  const [pulseDuration, setPulseDuration] = useState(PULSE_DURATION);
  let [spacing, setSpacing] = useState(CLOUD_SPACING);
  let [scaleValue, setScaleValue] = useState(CLOUD_SCALE); 
  const [pulseValue, setPulseValue] = useState(CLOUD_PULSE); 
  const [pulseminValue, setPulseminValue] = useState(CLOUD_PULSEMIN); 
  const [compCtx, setCompCtx] = useState(createSvgCompositionContext());
  const [useMask, setUseMask] = useState(false);
	let [maskRadius, setMaskRadius] = useState(MASK_RADIUS); 
	let [maskX, setMaskX] = useState(MASK_X); 
	let [maskY, setMaskY] = useState(MASK_Y); 

 
	let rotationDuration = 0; //default to 0
	if (rotationSpeed>0) {
		rotationDuration = 8.5 - rotationSpeed; 
	} else if (rotationSpeed<0) {
		rotationDuration = 8.5 - (rotationSpeed * -1); // if rotationSpeed is negative then reverse direction
	} 
	let rotationAngle = -360;
	if (rotationSpeed<0) {
   rotationAngle = 360;
	}

	let screenWidth = SCREEN_WIDTH;

	/* set default colors upon init */
	if ((compCtx.background=="#858585") && (compCtx.stroke=="#000000") && (compCtx.fill=="#ffffff")) {
	compCtx.background = BG_COLOR;
	compCtx.stroke = CLOUD_STROKE;
	compCtx.strokewidth = CLOUD_STROKEWIDTH;
	compCtx.fill = CLOUD_FILL;
	}

const newRandomSeed = () => setRandomSeed(Date.now());
function getDownloadBasename(randomSeed: number) {
  return `mystic-symbolic-creature-${randomSeed}`;
}
  const [alwaysInclude, setAlwaysInclude] = useState<SvgSymbolData>(
    EMPTY_SVG_SYMBOL_DATA
  );

/* CLOUD ELEMENTS: create an array for the position of each element */
	const cloudposx = [-400, 400, -900,   0,  900,  -400,    400, -1200, 1200, -900,   0,   900, -400,  400  ];
	const cloudposy = [   400,   400,  1000, 1000,  1000,   1600,  1600,  1600, 1600, 2200, 2200, 2200, 2800, 2800  ];

/* SET MORE VARIABLES */

  let clouds: JSX.Element[] = [];
	let maxClouds = MAX_CLOUDS; // max number of clouds
	let xpos = 0; // set x position of elements
	let xposbase = 0; // base for x pos
	let ypos = 0; // set y position of elements
	let thisscaleValue = scaleValue;
	let thisspacing = spacing;
	let speedindex = 500; // this is the basis for the cloud speed - the higher the number the slower
	let invertedcloudspeed = 0;  // this is for speed
	let loopfactor = 1.1;
	let keynum = 0; // to keep track of keys - to give each element a unique ID
	let keynumA = 0; 
	let keynumB = 0;
	let keynumC = 0;
  let adjustedY = 1200; // pushes down clouds on page
  let cloudW = 360;  // cloud width
  let cloudH = 360;  // cloud height
	let loopfromvalue = 0; // loop from value - where loop starts
	let looptovalue = 0; // loop to value - where the loop ends
	let thiscloudSpeed = 0; // thiscloudspeed is so that clouds can go in both directions. this is the absolute value of cloudspeed

	let showbackground = compCtx.background;
if (useMask) { showbackground = "#fff"; }  /* use white background when using mask - need to get mask bg working ... */


/* prevent overloading - maximum number of elements */
	while ((numElements * numRows * numClouds) > 430) {
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
	keynumA = keynum + "A";
	keynumB = keynum + "B";
	keynumC = keynum + "C";

	// clouds get bigger with each row
  thisscaleValue = scaleValue + (k * .6 * parallaxSize) ;
  thisspacing = spacing + (k * .3 * parallaxSize) ;

	thiscloudSpeed = Math.abs(cloudSpeed);



	// clouds get faster with each row
	if (cloudSpeed == 0) {
		 invertedcloudspeed = 2000;
	} else {
		invertedcloudspeed = speedindex / ((thiscloudSpeed +3) * (thiscloudSpeed +3) * ((k * parallaxSpeed * .2) + 1)); // the greater the speed the smaller the inverted cloud speed
	}


  let starttime = ((pulseDuration / numElements) * i) - 10; // creates the rhythmic pulsing effect


	// get negative values for cloud size - for offsets
	let cloudWneg = cloudW * -1;
	let cloudHneg = cloudH * -1;

/* LOCATIONS OF CLOUDS */
  xposbase  = 500 * thisscaleValue * cloudDistance; // basis for xpos
  let xpos = (cloudposx[i] * thisspacing) + (j * xposbase )  - cloudW;
  let ypos = (cloudposy[i] * thisspacing)  + (k * rowDistance * 100 * thisscaleValue) + adjustedY - cloudH;

	  // CALCULATE LOOPING
	// the fewer clouds the larger the loop value. 
	// this is tricky to make smooth without skipping...  this also affects the speed
	// make the calculations for the first cloud of each row - since that will determine the looping start and end points
if (j==0) {
	loopfromvalue =Math.round(xposbase * -1) ; // start of the loop is 2 clouds to the left
	looptovalue = 0; 
	//looptovalue = Math.round(xposbase * 5 * (Math.floor(maxClouds / numClouds / 2 )-1)) ; // end of loop - a bit tricky - some logic - some trial and error
	if (cloudSpeed<0) { // reverse direction
	  let newlooptovalue = loopfromvalue * -1;
	  let newloopfromvalue = looptovalue * -1;
		// these are tricky for some reason. add values to make it work right
		loopfromvalue = newlooptovalue - screenWidth + 600;  
		looptovalue = newloopfromvalue - screenWidth +600;
	} else if (cloudSpeed==0) { // if not moving then start on the screen (not off)
		loopfromvalue = Math.round(xposbase * 5 * -1) + 600;
		looptovalue = loopfromvalue;
	}
	if (cloudSpeed != 0) {
	//console.log('loopfromvalue:'+loopfromvalue);
  //console.log('looptovalue:'+looptovalue);
	}
}




  clouds.push(

<g key={`${keynumA}`} transform={`translate(${cloudWneg},${cloudHneg})`} >

			/* move */
			<animateTransform
				attributeName="transform"
				type="translate"
				from={`${loopfromvalue} 0`}
				to={`${looptovalue} 0`}
				begin = "0s"
				dur={`${invertedcloudspeed}s`}
				repeatCount="indefinite"  
				additive="sum" 
				fill="freeze"
			/>


    <g key={`${keynumB}`} transform={`translate(${xpos} ${ypos}) scale(${thisscaleValue} ${thisscaleValue})`}> 

   

       <g key={`${keynumC}`}  transform={`translate(${cloudWneg},${cloudHneg})`}>
		<Cloud fill={compCtx.fill} stroke={compCtx.stroke} strokewidth={strokewidth}  />
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
				values = {`${pulseminValue};${pulseValue};${pulseminValue};`}
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
 
	<div className="canvas clouds" style={{ backgroundColor: showbackground }}>
      <svg  viewBox={`-3000 -1000 ${screenWidth} 9000`}  >
			    {useMask ? (
					
            <>   
						  <circle stroke="2" cx={`${maskX-2000}`} cy={`${maskY}`} r={`${maskRadius}`}  fill={`${compCtx.background}`}></circle>
              <clipPath id="cloud-circle-mask" style={{ backgroundColor: compCtx.background }}>
              <circle cx={`${maskX-2000}`} cy={`${maskY}`} r={`${maskRadius}`}  />
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
          /* onSymbolsChange={newRandomSeed} */
        >
        </RandomizerWidget>
      <NumericSlider
        id="numElements"
        label="Number of elements"
        min={1}
        max={14}
        value={numElements}
        step={1}
        onChange={setnumElements}
      />

      <NumericSlider
        id="cloudDistance"
        label="Distance between clouds"
        min={3}
        max={14}
        value={cloudDistance}
        step={1}
        onChange={setcloudDistance}
      />
      <NumericSlider
        id="numRows"
        label="Number of rows"
        min={1}
        max={5}
        value={numRows}
        step={1}
        onChange={setnumRows}
      />
      <NumericSlider
        id="rowDistance"
        label="Distance between Rows"
        min={0}
        max={20}
        value={rowDistance}
        step={1}
        onChange={setrowDistance}
      />
      <NumericSlider
        id="cloudSpeed"
        label="Cloud speed"
        min={-20}
        max={20}
        value={cloudSpeed}
        step={1}
        onChange={setcloudSpeed}
      />
      <NumericSlider
        id="parallaxSpeed"
        label="Parallax speed"
        min={0.5}
        max={5}
        value={parallaxSpeed}
        step={0.1}
        onChange={setparallaxSpeed}
      />
      <NumericSlider
        id="parallaxSize"
        label="Parallax size"
        min={0.3}
        max={2}
        value={parallaxSize}
        step={0.1}
        onChange={setparallaxSize}
      />
      <NumericSlider
        id="rotationSpeed"
        label="Rotation speed"
        min={-8}
        max={8}
        value={rotationSpeed}
        step={0.5}
        onChange={setRotationSpeed}
        valueSuffix="s"
      />
      <NumericSlider
        id="spacing"
        label="Spacing"
        min={.2}
        max={1}
        value={spacing}
        step={.1}
        onChange={setSpacing}
      />
      <NumericSlider
        id="scaleValue"
        label="Scale"
        min={.3}
        max={1.5}
        value={scaleValue}
        step={0.1}
        onChange={setScaleValue}
      />
      <NumericSlider
        id="strokewidth"
        label="Stroke width"
        min={1}
        max={100}
        value={strokewidth}
        step={1}
        onChange={setStrokewidth}
      />
      <NumericSlider
        id="pulseminValue"
        label="Pulse Size Min"
        min={0.5}
        max={1}
        value={pulseminValue}
        step={0.1}
        onChange={setPulseminValue}
      />
      <NumericSlider
        id="pulseValue"
        label="Pulse Size Max"
        min={1}
        max={2.5}
        value={pulseValue}
        step={0.1}
        onChange={setPulseValue}
      />
      <NumericSlider
        id="pulseDuration"
        label="Pulse duration"
        min={0.8}
        max={8}
        value={pulseDuration}
        step={0.2}
        onChange={setPulseDuration}
        valueSuffix="s"
      />
        <Checkbox
          label="Mask with circle"
          value={useMask}
          onChange={setUseMask}
        />
      <NumericSlider
        id="maskRadius"
        label="Mask Radius"
        min={500}
        max={5000}
        value={maskRadius}
        step={500}
        onChange={setMaskRadius}
      />
      <NumericSlider
        id="maskY"
        label="Mask Top"
        min={-1000}
        max={7000}
        value={maskY}
        step={500}
        onChange={setMaskY}
      />
      <NumericSlider
        id="maskX"
        label="Mask Left"
        min={-2000}
        max={screenWidth}
        value={maskX}
        step={500}
        onChange={setMaskX}
      />

      </div>


    </>
  );
};

export const CloudsPage: React.FC<{}> = () => {

  const [randomSeed, setRandomSeed] = useState<number>(Date.now());
  const [compCtx, setCompCtx] = useState(createSvgCompositionContext());

  return (
  <Page title="Clouds">
    <Clouds />
  </Page>
  );
};
