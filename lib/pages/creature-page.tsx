import React from "react";
import { Random } from "../random";
import { SvgVocabulary } from "../svg-vocabulary";
import {
  createSvgSymbolContext,
  SvgSymbolContent,
  SvgSymbolData,
} from "../svg-symbol";
import { AttachmentPointType, PointWithNormal } from "../specs";
import { subtractPoints } from "../point";

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

function getAttachmentPoint(
  s: SvgSymbolData,
  type: AttachmentPointType,
  idx: number = 0
): PointWithNormal {
  const { specs } = s;
  if (!specs) {
    throw new Error(`Symbol ${s.name} has no specs!`);
  }
  const points = specs[type];
  if (!(points && points.length > idx)) {
    throw new Error(
      `Symbol ${s.name} must have at least ${
        idx + 1
      } ${type} attachment point(s)!`
    );
  }

  return points[idx];
}

export const CreaturePage: React.FC<{}> = () => {
  const rand = new Random(1);
  const parts: string[] = [];
  const ctx = createSvgSymbolContext({ showSpecs: false });
  const eye = getSymbol("eye");
  const hand = getSymbol("hand");

  for (let i = 0; i < 5; i++) {
    parts.push(rand.choice(SvgVocabulary).name);
  }

  const handTail = getAttachmentPoint(hand, "tail");
  const eyeCrown = getAttachmentPoint(eye, "crown");

  const dist = subtractPoints(eyeCrown.point, handTail.point);

  return (
    <>
      <h1>Creature!</h1>
      <svg width="1280px" height="720px">
        <SvgSymbolContent data={eye} {...ctx} />
        <g transform={`translate(${dist.x} ${dist.y})`}>
          <g
            transform-origin={`${handTail.point.x} ${handTail.point.y}`}
            transform={`scale(0.25 0.25)`}
          >
            <SvgSymbolContent data={hand} {...ctx} />
          </g>
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
