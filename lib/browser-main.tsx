import React from "react";
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
};

const px = (value: number) => `${value}px`;

const SvgSymbol: React.FC<SvgSymbolProps> = (props) => {
  const d = props.data;

  return (
    <svg
      stroke="#000000"
      fill="#ffffff"
      width={px(d.width)}
      height={px(d.height)}
      dangerouslySetInnerHTML={{ __html: d.svg }}
    ></svg>
  );
};

const App: React.FC<{}> = () => (
  <>
    <h1>Mythic Symbolic</h1>
    {SvgVocabulary.map((symbolData) => (
      <>
        <h2>{symbolData.name}</h2>
        <SvgSymbol data={symbolData} />
      </>
    ))}
  </>
);

ReactDOM.render(<App />, appEl);
