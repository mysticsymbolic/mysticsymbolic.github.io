import React, { useState } from "react";
import ReactDOM from "react-dom";

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
  if (fill && fill !== "none") {
    fill = ctx.fill;
  }
  if (stroke && stroke !== "none") {
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

  return (
    <svg
      viewBox={`0 0 ${d.width} ${d.height}`}
      width={px(d.width * scale)}
      height={px(d.height * scale)}
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
      <h1>Mythic Symbolic Vocabulary</h1>
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
          <SvgSymbol
            data={symbolData}
            scale={0.25}
            stroke={stroke}
            fill={fill}
          />
        </div>
      ))}
    </>
  );
};

ReactDOM.render(<App />, appEl);
