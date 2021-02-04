import React, { useState } from "react";
import ReactDOM from "react-dom";

import _SvgVocabulary from "./svg-vocabulary.json";
import type { SvgSymbolData } from "./vocabulary";

const APP_ID = "app";

const appEl = document.getElementById(APP_ID);

const SvgVocabulary: SvgSymbolData[] = _SvgVocabulary;

if (!appEl) {
  throw new Error(`Unable to find #${APP_ID}!`);
}

type SvgSymbolProps = {
  data: SvgSymbolData;
  scale?: number;
  stroke: string;
  fill: string;
};

const px = (value: number) => `${value}px`;

const SvgSymbol: React.FC<SvgSymbolProps> = (props) => {
  const d = props.data;
  const scale = props.scale || 1;

  return (
    <svg
      stroke={props.stroke}
      fill={props.fill}
      viewBox={`0 0 ${d.width} ${d.height}`}
      width={px(d.width * scale)}
      height={px(d.height * scale)}
      dangerouslySetInnerHTML={{ __html: d.svg }}
    ></svg>
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
        />
      </p>
      <p>
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
          style={{
            display: "inline-block",
          }}
        >
          <h2>{symbolData.name}</h2>
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
