import fs from "fs";
import path from "path";
import cheerio from "cheerio";
import { getSvgBoundingBox } from "./bounding-box";
import { extractSpecs } from "./specs";
import { SvgSymbolData, SvgSymbolElement } from "./svg-symbol";
import toml from "toml";
import { validateSvgSymbolMetadata } from "./svg-symbol-metadata";

const SUPPORTED_SVG_TAG_ARRAY: SvgSymbolElement["tagName"][] = ["g", "path"];
const SUPPORTED_SVG_TAGS = new Set(SUPPORTED_SVG_TAG_ARRAY);

const MY_DIR = __dirname;
const SVG_DIR = path.join(MY_DIR, "..", "svg");
const VOCAB_PATH = path.join(MY_DIR, "_svg-vocabulary.json");
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

export function convertSvgMarkupToSymbolData(
  filename: string,
  svgMarkup: string
): SvgSymbolData {
  const name = path.basename(filename, SVG_EXT).toLowerCase();
  const $ = cheerio.load(svgMarkup);
  const svgEl = $("svg");
  const rawLayers = onlyTags(svgEl.children()).map((ch) =>
    serializeSvgSymbolElement($, ch)
  );
  const [specs, layers] = extractSpecs(rawLayers);
  const bbox = getSvgBoundingBox(layers);

  const symbol: SvgSymbolData = {
    name,
    bbox,
    layers,
    specs,
  };
  return symbol;
}

export function build() {
  const filenames = fs.readdirSync(SVG_DIR);
  const vocab: SvgSymbolData[] = [];
  for (let filename of filenames) {
    if (path.extname(filename) === SVG_EXT) {
      let filenames = filename;
      let metaToml: string | null = null;
      const metaFilename = `${path.basename(filename, SVG_EXT)}.toml`;
      const metaFilepath = path.join(SVG_DIR, metaFilename);
      if (fs.existsSync(metaFilepath)) {
        filenames += ` and ${metaFilename}`;
        metaToml = fs.readFileSync(metaFilepath, {
          encoding: "utf-8",
        });
      }
      console.log(`Adding ${filenames} to vocabulary.`);
      const svgMarkup = fs.readFileSync(path.join(SVG_DIR, filename), {
        encoding: "utf-8",
      });
      const symbol = convertSvgMarkupToSymbolData(filename, svgMarkup);
      if (metaToml) {
        symbol.meta = validateSvgSymbolMetadata(toml.parse(metaToml));
      }
      vocab.push(symbol);
    }
  }

  console.log(`Writing ${VOCAB_PATH}.`);
  fs.writeFileSync(VOCAB_PATH, JSON.stringify(vocab, null, 2));
}
