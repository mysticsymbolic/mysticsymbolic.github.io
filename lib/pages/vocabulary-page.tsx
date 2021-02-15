import React, { useState } from "react";
import { BBox } from "../../vendor/bezier-js";
import { dilateBoundingBox, getBoundingBoxSize } from "../bounding-box";
import { FILL_REPLACEMENT_COLOR, STROKE_REPLACEMENT_COLOR } from "../colors";
import * as colors from "../colors";
import { iterAttachmentPoints, AttachmentPoint, Specs } from "../specs";

import type { SvgSymbolData, SvgSymbolElement } from "../vocabulary";
import { SvgVocabulary } from "../svg-vocabulary";

type SvgSymbolContext = {
  stroke: string;
  fill: string;
  showSpecs: boolean;
};

type SvgSymbolProps = {
  data: SvgSymbolData;
  scale?: number;
} & SvgSymbolContext;

const px = (value: number) => `${value}px`;

function getColor(
  ctx: SvgSymbolContext,
  color: string | undefined
): string | undefined {
  switch (color) {
    case STROKE_REPLACEMENT_COLOR:
      return ctx.stroke;
    case FILL_REPLACEMENT_COLOR:
      return ctx.fill;
  }
  return color;
}

function reactifySvgSymbolElement(
  ctx: SvgSymbolContext,
  el: SvgSymbolElement,
  key: number
): JSX.Element {
  let { fill, stroke } = el.props;
  fill = getColor(ctx, fill);
  stroke = getColor(ctx, stroke);
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

const ATTACHMENT_POINT_RADIUS = 20;

const ATTACHMENT_POINT_NORMAL_LENGTH = 50;

const ATTACHMENT_POINT_NORMAL_STROKE = 4;

const VisibleAttachmentPoint: React.FC<{
  point: AttachmentPoint;
}> = ({ point: ap }) => {
  const { x, y } = ap.point;
  const x2 = x + ap.normal.x * ATTACHMENT_POINT_NORMAL_LENGTH;
  const y2 = y + ap.normal.y * ATTACHMENT_POINT_NORMAL_LENGTH;
  const color = colors.ATTACHMENT_POINT_COLORS[ap.type];

  return (
    <>
      <circle fill={color} r={ATTACHMENT_POINT_RADIUS} cx={x} cy={y} />
      <line
        x1={x}
        y1={y}
        x2={x2}
        y2={y2}
        stroke={color}
        strokeWidth={ATTACHMENT_POINT_NORMAL_STROKE}
      />
    </>
  );
};

const BoundingBoxes: React.FC<{ fill: string; bboxes: BBox[] }> = (props) => (
  <>
    {props.bboxes.map((b, i) => {
      const [width, height] = getBoundingBoxSize(b);
      return (
        <rect
          key={i}
          x={b.x.min}
          y={b.y.min}
          width={width}
          height={height}
          fill={props.fill}
        />
      );
    })}
  </>
);

const SvgSymbolSpecs: React.FC<{ specs: Specs }> = ({ specs }) => {
  return (
    <>
      {Array.from(iterAttachmentPoints(specs)).map((point, i) => (
        <VisibleAttachmentPoint key={i} point={point} />
      ))}
      {specs.nesting && (
        <BoundingBoxes
          fill={colors.NESTING_BOUNDING_BOX_COLOR}
          bboxes={specs.nesting}
        />
      )}
    </>
  );
};

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
      {props.data.layers.map(reactifySvgSymbolElement.bind(null, props))}
      {props.showSpecs && d.specs && <SvgSymbolSpecs specs={d.specs} />}
    </svg>
  );
};

export const VocabularyPage: React.FC<{}> = () => {
  const [stroke, setStroke] = useState("#000000");
  const [fill, setFill] = useState("#ffffff");
  const [showSpecs, setShowSpecs] = useState(false);

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
            <SvgSymbol
              data={symbolData}
              scale={0.25}
              stroke={stroke}
              fill={fill}
              showSpecs={showSpecs}
            />
          </div>
        </div>
      ))}
    </>
  );
};
