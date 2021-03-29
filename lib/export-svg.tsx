import React from "react";

function getSvgMarkup(el: SVGSVGElement): string {
  return [
    `<?xml version="1.0" encoding="utf-8"?>`,
    "<!-- Generator: https://github.com/toolness/mystic-symbolic -->",
    '<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">',
    el.outerHTML,
  ].join("\n");
}

type ImageExporter = (svgEl: SVGSVGElement) => Promise<string>;

/**
 * Initiates a download on the user's browser which downloads the given
 * SVG element under the given filename, using the given export algorithm.
 */
async function exportImage(
  svgRef: React.RefObject<SVGSVGElement>,
  basename: string,
  ext: string,
  exporter: ImageExporter
) {
  const svgEl = svgRef.current;
  if (!svgEl) {
    alert("Oops, an error occurred! Please try again later.");
    return;
  }
  const url = await exporter(svgEl);
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
const exportSvg: ImageExporter = async (svgEl) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(getSvgMarkup(svgEl))}`;

/**
 * Exports the given SVG as a PNG in a data URL.
 */
const exportPng: ImageExporter = async (svgEl) => {
  const dataURL = await exportSvg(svgEl);

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
  svgRef: React.RefObject<SVGSVGElement>;
  basename: string;
}> = ({ svgRef, basename }) => (
  <>
    <button onClick={() => exportImage(svgRef, basename, "svg", exportSvg)}>
      Export SVG
    </button>{" "}
    <button onClick={() => exportImage(svgRef, basename, "png", exportPng)}>
      Export PNG
    </button>
  </>
);
