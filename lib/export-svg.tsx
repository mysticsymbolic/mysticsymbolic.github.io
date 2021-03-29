import React from "react";

function getSvgMarkup(el: SVGSVGElement): string {
  return [
    `<?xml version="1.0" encoding="utf-8"?>`,
    "<!-- Generator: https://github.com/toolness/mystic-symbolic -->",
    '<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">',
    el.outerHTML,
  ].join("\n");
}

/**
 * Initiates a download on the user's browser which downloads the given
 * SVG element under the given filename.
 */
function exportSvg(filename: string, svgRef: React.RefObject<SVGSVGElement>) {
  const svgEl = svgRef.current;
  if (!svgEl) {
    alert("Oops, an error occurred! Please try again later.");
    return;
  }
  const dataURL = `data:image/svg+xml;utf8,${encodeURIComponent(
    getSvgMarkup(svgEl)
  )}`;
  const anchor = document.createElement("a");
  anchor.href = dataURL;
  anchor.download = filename;
  document.body.append(anchor);
  anchor.click();
  document.body.removeChild(anchor);
}

function exportPng(filename: string, svgRef: React.RefObject<SVGSVGElement>) {
  const canvas = document.createElement("canvas");
  const svgEl = svgRef.current;
  if (!svgEl) {
    alert("Oops, an error occurred! Please try again later.");
    return;
  }
  const dataURL = `data:image/svg+xml;utf8,${encodeURIComponent(
    getSvgMarkup(svgEl)
  )}`;
  const img = document.createElement("img");
  img.onload = () => {
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("blah");
    ctx.drawImage(img, 0, 0);
    const dataURL = canvas.toDataURL();
    const anchor = document.createElement("a");
    anchor.href = dataURL;
    anchor.download = filename;
    document.body.append(anchor);
    anchor.click();
    document.body.removeChild(anchor);
  };
  img.src = dataURL;
}

export const ExportWidget: React.FC<{
  svgRef: React.RefObject<SVGSVGElement>;
  basename: string;
}> = ({ svgRef, basename }) => (
  <>
    <button onClick={() => exportSvg(`${basename}.svg`, svgRef)}>
      Export SVG
    </button>{" "}
    <button onClick={() => exportPng(`${basename}.png`, svgRef)}>
      Export PNG
    </button>
  </>
);
