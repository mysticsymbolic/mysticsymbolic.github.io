import React, { useEffect, useRef, useState } from "react";

/**
 * An SVG element with an optional background color that
 * automatically sizes itself to its contents.
 */
export const AutoSizingSvg = React.forwardRef(
  (
    props: {
      padding: number;
      bgColor?: string;
      children: JSX.Element | JSX.Element[];
    },
    ref: React.ForwardedRef<SVGSVGElement>
  ) => {
    const { bgColor, padding } = props;
    const [x, setX] = useState(0);
    const [y, setY] = useState(0);
    const [width, setWidth] = useState(1);
    const [height, setHeight] = useState(1);
    const gRef = useRef<SVGGElement>(null);

    useEffect(() => {
      const svgEl = gRef.current;
      if (svgEl) {
        const bbox = svgEl.getBBox();
        setX(bbox.x - padding);
        setY(bbox.y - padding);
        setWidth(bbox.width + padding * 2);
        setHeight(bbox.height + padding * 2);
      }
    });

    return (
      <svg
        version="1.1"
        xmlns="http://www.w3.org/2000/svg"
        width={`${width}px`}
        height={`${height}px`}
        viewBox={`${x} ${y} ${width} ${height}`}
        ref={ref}
      >
        {bgColor && (
          <rect x={x} y={y} width={width} height={height} fill={bgColor} />
        )}
        <g ref={gRef}>{props.children}</g>
      </svg>
    );
  }
);
