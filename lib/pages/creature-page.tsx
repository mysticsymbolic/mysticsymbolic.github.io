import React from "react";
import { Random } from "../random";
import { SvgVocabulary } from "../svg-vocabulary";
import {
  createSvgSymbolContext,
  SvgSymbolContent,
  SvgSymbolData,
} from "../svg-symbol";

const SYMBOL_MAP = new Map(
  SvgVocabulary.map((symbol) => [symbol.name, symbol])
);

function getSymbol(name: string): SvgSymbolData {
  const symbol = SYMBOL_MAP.get(name);
  if (!symbol) {
    throw new Error(`Unable to find the symbol "${name}"!`);
  }
  return symbol;
}

export const CreaturePage: React.FC<{}> = () => {
  const rand = new Random(1);
  const parts: string[] = [];
  const ctx = createSvgSymbolContext();
  const eye = getSymbol("eye");
  const hand = getSymbol("hand");

  for (let i = 0; i < 5; i++) {
    parts.push(rand.choice(SvgVocabulary).name);
  }

  return (
    <>
      <h1>Creature!</h1>
      <svg width="1280px" height="720px">
        <SvgSymbolContent data={eye} {...ctx} />
        <g transform="scale(0.25 0.25) translate(1075 1075)">
          <SvgSymbolContent data={hand} {...ctx} />
        </g>
      </svg>
      <p>TODO: Make a creature with maybe the following parts:</p>
      <ul>
        {parts.map((name, i) => (
          <li key={i}>{name}</li>
        ))}
      </ul>
    </>
  );
};
