import React, { useCallback, useEffect, useRef, useState } from "react";

type AutoSizingSvgProps = {
  padding?: number;
  bgColor?: string;

  /**
   * A ref to an element that we resize the SVG dimensions
   * to match. If not provided, we'll just use the bounding
   * box of the SVG itself.
   */
  sizeToElement?: React.RefObject<HTMLElement>;

  /**
   * Whenever this key changes, we'll resize the SVG. If
   * it's undefined, we will use `props.children` as
   * the key.
   */
  resizeKey?: any;

  children: JSX.Element | JSX.Element[];
};

function useResizeHandler(onResize: () => void) {
  useEffect(() => {
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
    };
  });
}

/**
 * An SVG element with an optional background color that
 * automatically sizes itself to either its contents, or
 * if the `sizeToElement` prop is provided, to the given
 * container.
 */
export const AutoSizingSvg = React.forwardRef(
  (props: AutoSizingSvgProps, ref: React.ForwardedRef<SVGSVGElement>) => {
    const { bgColor, sizeToElement } = props;
    const [x, setX] = useState(0);
    const [y, setY] = useState(0);
    const [width, setWidth] = useState(1);
    const [height, setHeight] = useState(1);
    const gRef = useRef<SVGGElement>(null);
    const resizeToElement = useCallback(() => {
      if (sizeToElement?.current) {
        const bbox = sizeToElement.current.getBoundingClientRect();
        setX(-bbox.width / 2);
        setY(-bbox.height / 2);
        setWidth(bbox.width);
        setHeight(bbox.height);
        return true;
      }
      return false;
    }, [sizeToElement]);

    useResizeHandler(resizeToElement);

    // This is an "artificial" effect dependency that isn't used anywhere in
    // our effect, but is used to determine when our effect is triggered.
    // By default, since any change to `props.children` may result in a
    // dimension change in the SVG element, we want it to trigger the effect,
    // but alternatively our caller can tell us when to resize via
    // `props.resizeKey` too.
    const resizeDependency = props.resizeKey ?? props.children;

    useEffect(() => {
      if (!resizeToElement()) {
        const svgEl = gRef.current;
        if (svgEl) {
          const bbox = svgEl.getBBox();
          const padding = props.padding || 0;
          setX(bbox.x - padding);
          setY(bbox.y - padding);
          setWidth(bbox.width + padding * 2);
          setHeight(bbox.height + padding * 2);
        }
      }
    }, [props.padding, resizeToElement, resizeDependency]);

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
          <rect
            x={x}
            y={y}
            width={width}
            height={height}
            fill={bgColor}
            data-is-background
          />
        )}
        <g ref={gRef}>{props.children}</g>
      </svg>
    );
  }
);

export function getSvgMetadata(svgEl: SVGSVGElement) {
  let bgColor: string | undefined = undefined;
  const backgroundEl = svgEl.querySelector("[data-is-background]");
  if (backgroundEl) {
    bgColor = backgroundEl.getAttribute("fill") ?? undefined;
  }
  const { x, y, width, height } = svgEl.viewBox.baseVal;
  return { x, y, width, height, bgColor };
}

export type SvgMetadata = ReturnType<typeof getSvgMetadata>;

export const SvgWithBackground: React.FC<SvgMetadata & { children?: any }> = ({
  x,
  y,
  width,
  height,
  bgColor,
  children,
}) => (
  <svg
    version="1.1"
    xmlns="http://www.w3.org/2000/svg"
    width={`${width}px`}
    height={`${height}px`}
    viewBox={`${x} ${y} ${width} ${height}`}
  >
    {bgColor && (
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill={bgColor}
        data-is-background
      />
    )}
    {children}
  </svg>
);
