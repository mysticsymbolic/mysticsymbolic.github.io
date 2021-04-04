import React from "react";
import ReactDOMServer from "react-dom/server";

const SVG_PREAMBLE = [
  `<?xml version="1.0" encoding="utf-8"?>`,
  "<!-- Generator: https://github.com/toolness/mystic-symbolic -->",
  '<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">',
];

/**
 * Either a live reference to an SVG element, or a
 * function that returns the React element for one.
 */
export type SvgRefOrRenderProp =
  | React.RefObject<SVGSVGElement>
  | (() => JSX.Element);

type ImageExporter = (svgMarkup: string) => Promise<string>;

/**
 * Initiates a download on the user's browser which downloads the given
 * SVG under the given filename, using the given export algorithm.
 */
async function exportImage(
  svg: SvgRefOrRenderProp,
  basename: string,
  ext: string,
  exporter: ImageExporter
) {
  let baseSvgMarkup: string;
  if (typeof svg === "function") {
    baseSvgMarkup = ReactDOMServer.renderToStaticMarkup(svg());
  } else {
    const svgEl = svg.current;
    if (!svgEl) {
      alert("Oops, an error occurred! Please try again later.");
      return;
    }
    baseSvgMarkup = svgEl.outerHTML;
  }
  const fullSvgXml = [...SVG_PREAMBLE, baseSvgMarkup].join("\n");
  const url = await exporter(fullSvgXml);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${basename}.${ext}`;
  document.body.append(anchor);
  anchor.click();
  document.body.removeChild(anchor);
}

function getCanvasContext2D(
  canvas: HTMLCanvasElement
): CanvasRenderingContext2D {
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error(`Unable to get 2D context for canvas!`);
  return ctx;
}

/**
 * Exports the given SVG as an SVG in a data URL.
 */
const exportSvg: ImageExporter = async (svgMarkup) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(svgMarkup)}`;

/**
 * Exports the given SVG as a PNG in a data URL.
 */
const exportPng: ImageExporter = async (svgMarkup) => {
  const dataURL = await exportSvg(svgMarkup);

  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas");
    const img = document.createElement("img");

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = getCanvasContext2D(canvas);
      ctx.drawImage(img, 0, 0);
      resolve(canvas.toDataURL());
    };
    img.onerror = reject;
    img.src = dataURL;
  });
};

export const ExportWidget: React.FC<{
  svg: SvgRefOrRenderProp;
  basename: string;
}> = ({ svg: svgRef, basename }) => (
  <>
    <button onClick={() => exportImage(svgRef, basename, "svg", exportSvg)}>
      Export SVG
    </button>{" "}
    <button onClick={() => exportImage(svgRef, basename, "png", exportPng)}>
      Export PNG
    </button>
  </>
);
