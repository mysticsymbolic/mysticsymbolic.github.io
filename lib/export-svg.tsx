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
export function exportSvg(
  filename: string,
  svgRef: React.RefObject<SVGSVGElement>
) {
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

export const ExportSvgButton: React.FC<{
  svgRef: React.RefObject<SVGSVGElement>;
  filename: string;
}> = ({ svgRef, filename }) => (
  <button onClick={() => exportSvg(filename, svgRef)}>Export SVG</button>
);
