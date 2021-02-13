import fs from "fs";
import path from "path";
import cheerio from "cheerio";
import { SVGProps } from "react";
import { getSvgBoundingBox, Bbox } from "./bounding-box";

export type SvgSymbolData = {
  name: string;
  width: number;
  height: number;
  bbox: Bbox;
  layers: SvgSymbolElement[];
};

export type SvgSymbolElement = (
  | {
      tagName: "g";
      props: SVGProps<SVGGElement>;
    }
  | {
      tagName: "path";
      props: SVGProps<SVGPathElement>;
    }
) & {
  children: SvgSymbolElement[];
};

const SUPPORTED_SVG_TAG_ARRAY: SvgSymbolElement["tagName"][] = ["g", "path"];
const SUPPORTED_SVG_TAGS = new Set(SUPPORTED_SVG_TAG_ARRAY);

const MY_DIR = __dirname;
const SVG_DIR = path.join(MY_DIR, "..", "svg");
const VOCAB_PATH = path.join(MY_DIR, "svg-vocabulary.json");
const SVG_EXT = ".svg";

function onlyTags(
  elements: cheerio.Element[] | cheerio.Cheerio
): cheerio.TagElement[] {
  const result: cheerio.TagElement[] = [];

  for (let i = 0; i < elements.length; i++) {
    const el = elements[i];
    if (el.type === "tag") {
      result.push(el);
    }
  }

  return result;
}

function isSupportedSvgTag(
  tagName: string
): tagName is SvgSymbolElement["tagName"] {
  return SUPPORTED_SVG_TAGS.has(tagName as any);
}

const SVG_ATTRIB_TO_PROP_MAP: {
  [key: string]: keyof SvgSymbolElement["props"] | undefined;
} = {
  id: "id",
  fill: "fill",
  stroke: "stroke",
  d: "d",
  "stroke-linejoin": "strokeLinejoin",
  "stroke-linecap": "strokeLinecap",
  "stroke-width": "strokeWidth",
  "fill-rule": "fillRule",
};

function attribsToProps(el: cheerio.TagElement): any {
  const { attribs } = el;
  const result: any = {};

  for (let attrib of Object.keys(attribs)) {
    const prop = SVG_ATTRIB_TO_PROP_MAP[attrib];

    if (!prop) {
      throw new Error(`Unknown SVG attribute '${attrib}' in <${el.tagName}>!`);
    }

    result[prop] = attribs[attrib];
  }

  return result;
}

function serializeSvgSymbolElement(
  $: cheerio.Root,
  el: cheerio.TagElement
): SvgSymbolElement {
  let children = onlyTags(el.children).map((child) =>
    serializeSvgSymbolElement($, child)
  );
  const { tagName } = el;
  if (isSupportedSvgTag(tagName)) {
    return {
      tagName,
      props: attribsToProps(el) as any,
      children,
    };
  }
  throw new Error(`Unsupported SVG element: <${tagName}>`);
}

function getSvgPixelDimension($: cheerio.Root, attr: string): number {
  const value = $("svg").attr(attr);
  if (!value) {
    throw new Error(`<svg> ${attr} attribute is empty or missing!`);
  }
  const match = value.match(/^(\d+)px$/);
  if (!match) {
    throw new Error(
      `Unable to parse <svg> ${attr} attribute value '${value}'!`
    );
  }
  return parseInt(match[1]);
}

export function build() {
  const filenames = fs.readdirSync(SVG_DIR);
  const vocab: SvgSymbolData[] = [];
  for (let filename of filenames) {
    if (path.extname(filename) === SVG_EXT) {
      console.log(`Adding ${filename} to vocabulary.`);
      const svgMarkup = fs.readFileSync(path.join(SVG_DIR, filename), {
        encoding: "utf-8",
      });
      const $ = cheerio.load(svgMarkup);
      const width = getSvgPixelDimension($, "width");
      const height = getSvgPixelDimension($, "height");
      const svgEl = $("svg");
      const name = path.basename(filename, SVG_EXT);
      const layers = onlyTags(svgEl.children()).map((ch) =>
        serializeSvgSymbolElement($, ch)
      );
      const bbox = getSvgBoundingBox(layers);

      const symbol: SvgSymbolData = {
        name,
        width,
        height,
        bbox,
        layers,
      };
      vocab.push(symbol);
    }
  }

  console.log(`Writing ${VOCAB_PATH}.`);
  fs.writeFileSync(VOCAB_PATH, JSON.stringify(vocab, null, 2));
}
