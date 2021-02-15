import React, { useState } from "react";
import { dilateBoundingBox, getBoundingBoxSize } from "../bounding-box";
import {
  createSvgSymbolContext,
  SvgSymbolContent,
  SvgSymbolData,
} from "../svg-symbol";
import { SvgVocabulary } from "../svg-vocabulary";
import { SvgSymbolContext } from "../svg-symbol";

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
  const [stroke, setStroke] = useState("#000000");
  const [fill, setFill] = useState("#ffffff");
  const [showSpecs, setShowSpecs] = useState(false);
  const ctx = createSvgSymbolContext({ stroke, fill, showSpecs });

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
        />{" "}
        <label>
          <input
            type="checkbox"
            checked={showSpecs}
            onChange={(e) => setShowSpecs(e.target.checked)}
          />{" "}
          Show specs
        </label>
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
            <SvgSymbol data={symbolData} scale={0.25} {...ctx} />
          </div>
        </div>
      ))}
    </>
  );
};
