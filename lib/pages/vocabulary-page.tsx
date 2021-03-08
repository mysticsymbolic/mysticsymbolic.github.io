import React, { useState } from "react";
import { dilateBoundingBox, getBoundingBoxSize } from "../bounding-box";
import {
  createSvgSymbolContext,
  SvgSymbolContent,
  SvgSymbolData,
} from "../svg-symbol";
import { SvgVocabulary } from "../svg-vocabulary";
import { SvgSymbolContext } from "../svg-symbol";
import { SymbolContextWidget } from "../symbol-context-widget";
import { HoverDebugHelper } from "../hover-debug-helper";

type SvgSymbolProps = {
  data: SvgSymbolData;
  scale?: number;
} & SvgSymbolContext;

const px = (value: number) => `${value}px`;

const BBOX_DILATION = 100;

const SvgSymbol: React.FC<SvgSymbolProps> = (props) => {
  const d = props.data;
  const bbox = dilateBoundingBox(d.bbox, BBOX_DILATION);
  const scale = props.scale || 1;
  const [width, height] = getBoundingBoxSize(bbox);

  return (
    <svg
      viewBox={`${bbox.x.min} ${bbox.y.min} ${width} ${height}`}
      width={px(width * scale)}
      height={px(height * scale)}
    >
      <SvgSymbolContent {...props} />
    </svg>
  );
};

export const VocabularyPage: React.FC<{}> = () => {
  const [ctx, setCtx] = useState(createSvgSymbolContext());

  return (
    <>
      <h1>Mystic Symbolic Vocabulary</h1>
      <SymbolContextWidget ctx={ctx} onChange={setCtx} />
      <HoverDebugHelper>
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
              <SvgSymbol data={symbolData} scale={0.25} {...ctx} />
            </div>
          </div>
        ))}
      </HoverDebugHelper>
    </>
  );
};
