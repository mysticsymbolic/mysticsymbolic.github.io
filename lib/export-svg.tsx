import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createGIF } from "./animated-gif";
import { getSvgMetadata, SvgWithBackground } from "./auto-sizing-svg";
import { inclusiveRange } from "./util";

function getSvgDocument(svgMarkup: string): string {
  return [
    `<?xml version="1.0" encoding="utf-8"?>`,
    "<!-- Generator: https://github.com/toolness/mystic-symbolic -->",
    '<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">',
    svgMarkup,
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

function getSvgUrl(svgMarkup: string): string {
  return `data:image/svg+xml;utf8,${encodeURIComponent(
    getSvgDocument(svgMarkup)
  )}`;
}

/**
 * Exports the given SVG as an SVG in a data URL.
 */
const exportSvg: ImageExporter = async (svgEl) => getSvgUrl(svgEl.outerHTML);

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

function drawImage(canvas: HTMLCanvasElement, dataURL: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = document.createElement("img");

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = getCanvasContext2D(canvas);
      ctx.drawImage(img, 0, 0);
      resolve();
    };
    img.onerror = reject;
    img.src = dataURL;
  });
}

/**
 * Exports the given SVG as a GIF in a data URL.
 */
async function exportGif(
  animate: ExportableAnimation,
  svgEl: SVGSVGElement
): Promise<string> {
  const fps = animate.fps || 15;
  const msecPerFrame = 1000 / fps;
  const numFrames = Math.floor(animate.duration / msecPerFrame);
  const svgMeta = getSvgMetadata(svgEl);
  const render = (animPct: number) => (
    <SvgWithBackground {...svgMeta}>
      {animate.render(animPct)}
    </SvgWithBackground>
  );
  const gif = createGIF();

  for (let i = 0; i < numFrames; i++) {
    const canvas = document.createElement("canvas");
    const animPct = i / numFrames;
    const markup = renderToStaticMarkup(render(animPct));
    const url = getSvgUrl(markup);
    await drawImage(canvas, url);
    if (i === 0) {
      gif.addFrame(canvas);
    } else {
      gif.addFrame(canvas, { delay: msecPerFrame });
    }
  }

  return new Promise((resolve, reject) => {
    gif.on("finished", function (blob) {
      resolve(URL.createObjectURL(blob));
    });
    gif.render();
  });
}

export type ExportableAnimation = {
  duration: number;
  fps?: number;
  render: (time: number) => JSX.Element;
};

export const ExportWidget: React.FC<{
  svgRef: React.RefObject<SVGSVGElement>;
  animate?: ExportableAnimation | false;
  basename: string;
}> = ({ svgRef, basename, animate }) => (
  <>
    <button onClick={() => exportImage(svgRef, basename, "svg", exportSvg)}>
      Export SVG
    </button>{" "}
    <button onClick={() => exportImage(svgRef, basename, "png", exportPng)}>
      Export PNG
    </button>{" "}
    {animate && (
      <button
        onClick={() =>
          exportImage(svgRef, basename, "gif", exportGif.bind(null, animate))
        }
      >
        Export GIF
      </button>
    )}
  </>
);
