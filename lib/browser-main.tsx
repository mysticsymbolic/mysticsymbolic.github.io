import React, { useState } from "react";
import ReactDOM from "react-dom";
import { getBoundingBoxSize } from "./bounding-box";
import { FILL_REPLACEMENT_COLOR, STROKE_REPLACEMENT_COLOR } from "./colors";

import _SvgVocabulary from "./svg-vocabulary.json";
import type { SvgSymbolData, SvgSymbolElement } from "./vocabulary";

const APP_ID = "app";

const appEl = document.getElementById(APP_ID);

const SvgVocabulary: SvgSymbolData[] = _SvgVocabulary as any;

if (!appEl) {
  throw new Error(`Unable to find #${APP_ID}!`);
}

type SvgSymbolContext = {
  stroke: string;
  fill: string;
};

type SvgSymbolProps = {
  data: SvgSymbolData;
  scale?: number;
} & SvgSymbolContext;

const px = (value: number) => `${value}px`;

function reactifySvgSymbolElement(
  ctx: SvgSymbolContext,
  el: SvgSymbolElement,
  key: number
): JSX.Element {
  let { fill, stroke } = el.props;
  if (fill === STROKE_REPLACEMENT_COLOR) {
    // The fill represents a "shadow" area, so use our stroke color here.
    fill = ctx.stroke;
  } else if (fill === FILL_REPLACEMENT_COLOR) {
    fill = ctx.fill;
  }
  if (stroke === STROKE_REPLACEMENT_COLOR) {
    stroke = ctx.stroke;
  }
  return React.createElement(
    el.tagName,
    {
      ...el.props,
      id: undefined,
      fill,
      stroke,
      key,
    },
    el.children.map(reactifySvgSymbolElement.bind(null, ctx))
  );
}

const SvgSymbol: React.FC<SvgSymbolProps> = (props) => {
  const d = props.data;
  const scale = props.scale || 1;
  const [width, height] = getBoundingBoxSize(d.bbox);

  return (
    <svg
      viewBox={`${d.bbox.minX} ${d.bbox.minY} ${width} ${height}`}
      width={px(width * scale)}
      height={px(height * scale)}
      style={{ margin: "10px" }}
    >
      {props.data.layers.map(reactifySvgSymbolElement.bind(null, props))}
    </svg>
  );
};

const App: React.FC<{}> = () => {
  const [stroke, setStroke] = useState("#000000");
  const [fill, setFill] = useState("#ffffff");

  return (
    <>
      <h1>Mystic Symbolic Vocabulary</h1>
      <p>
        <label htmlFor="stroke">Stroke: </label>
        <input
          type="color"
          value={stroke}
          onChange={(e) => setStroke(e.target.value)}
          id="stroke"
        />{" "}
        <label htmlFor="fill">Fill: </label>
        <input
          type="color"
          value={fill}
          onChange={(e) => setFill(e.target.value)}
          id="fill"
        />
      </p>
      {SvgVocabulary.map((symbolData) => (
        <div
          key={symbolData.name}
          style={{
            display: "inline-block",
            border: "1px solid black",
            margin: "4px",
          }}
        >
          <div
            style={{
              backgroundColor: "black",
              color: "white",
              padding: "4px",
            }}
          >
            {symbolData.name}
          </div>
          <div className="checkerboard-bg" style={{ lineHeight: 0 }}>
            <SvgSymbol
              data={symbolData}
              scale={0.25}
              stroke={stroke}
              fill={fill}
            />
          </div>
        </div>
      ))}
    </>
  );
};

ReactDOM.render(<App />, appEl);
