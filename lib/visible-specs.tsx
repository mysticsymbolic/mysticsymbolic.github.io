import React from "react";
import { BBox } from "../vendor/bezier-js";
import { getBoundingBoxSize } from "./bounding-box";
import * as colors from "./colors";
import { AttachmentPoint, iterAttachmentPoints, Specs } from "./specs";

const ATTACHMENT_POINT_RADIUS = 20;

const ATTACHMENT_POINT_NORMAL_LENGTH = 50;

const ATTACHMENT_POINT_NORMAL_STROKE = 4;

const SPEC_OPACITY = 0.66;

const VisibleAttachmentPoint: React.FC<{
  point: AttachmentPoint;
}> = ({ point: ap }) => {
  const { x, y } = ap.point;
  const x2 = x + ap.normal.x * ATTACHMENT_POINT_NORMAL_LENGTH;
  const y2 = y + ap.normal.y * ATTACHMENT_POINT_NORMAL_LENGTH;
  const color = colors.ATTACHMENT_POINT_COLORS[ap.type];

  return (
    <g data-spec-type={ap.type} data-spec-index={ap.index}>
      <circle
        fill={color}
        r={ATTACHMENT_POINT_RADIUS}
        cx={x}
        cy={y}
        opacity={SPEC_OPACITY}
      />
      <line
        opacity={SPEC_OPACITY}
        x1={x}
        y1={y}
        x2={x2}
        y2={y2}
        stroke={color}
        strokeWidth={ATTACHMENT_POINT_NORMAL_STROKE}
      />
    </g>
  );
};

const BoundingBoxes: React.FC<{ fill: string; bboxes: BBox[] }> = (props) => (
  <>
    {props.bboxes.map((b, i) => {
      const [width, height] = getBoundingBoxSize(b);
      return (
        <rect
          data-spec-type="nesting"
          data-spec-index={i}
          opacity={SPEC_OPACITY}
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

export const VisibleSpecs: React.FC<{ specs: Specs }> = ({ specs }) => {
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
