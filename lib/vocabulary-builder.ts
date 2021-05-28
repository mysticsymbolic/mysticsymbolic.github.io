import fs from "fs";
import path from "path";
import cheerio from "cheerio";
import { getSvgBoundingBox } from "./bounding-box";
import { extractSpecs } from "./specs";
import {
  SvgSymbolData,
  SvgSymbolDef,
  SvgSymbolElement,
  SvgSymbolGradientStop,
} from "./svg-symbol";
import toml from "toml";
import { validateSvgSymbolMetadata } from "./svg-symbol-metadata";
import { withoutNulls } from "./util";
import { clampedBytesToRGBColor } from "./color-util";

const SUPPORTED_SVG_TAG_ARRAY: SvgSymbolElement["tagName"][] = ["g", "path"];
const SUPPORTED_SVG_TAGS = new Set(SUPPORTED_SVG_TAG_ARRAY);

const MY_DIR = __dirname;
export const SVG_SYMBOLS_DIR = path.join(MY_DIR, "..", "assets", "symbols");
const VOCAB_JSON_PATH = path.join(
  MY_DIR,
  "_svg-vocabulary-pretty-printed.json"
);
const VOCAB_TS_PATH = path.join(MY_DIR, "_svg-vocabulary.ts");
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

function getNonEmptyAttrib(el: cheerio.TagElement, attr: string): string {
  const result = el.attribs[attr];

  if (!result) {
    throw new Error(
      `Expected <${el.tagName}> to have a non-empty '${attr}' attribute!`
    );
  }

  return result;
}

function parseRadialGradient(el: cheerio.TagElement): SvgSymbolDef {
  const stops: SvgSymbolGradientStop[] = [];
  for (let child of el.children) {
    if (child.type === "tag") {
      if (child.tagName !== "stop") {
        throw new Error(
          `Expected an SVG gradient to only contain <stop> elements!`
        );
      }
      const style = getNonEmptyAttrib(child, "style");
      const color = style.match(/stop-color\:rgb\((\d+),(\d+),(\d+)\)/);
      if (!color) {
        throw new Error(`Expected "${style}" to contain a stop-color!`);
      }
      const rgb = Array.from(color)
        .slice(1)
        .map((value) => parseInt(value));
      stops.push({
        offset: getNonEmptyAttrib(child, "offset"),
        color: clampedBytesToRGBColor(rgb),
      });
    }
  }
  return {
    type: "radialGradient",
    id: getNonEmptyAttrib(el, "id"),
    cx: getNonEmptyAttrib(el, "cx"),
    cy: getNonEmptyAttrib(el, "cy"),
    r: getNonEmptyAttrib(el, "r"),
    stops,
  };
}

/**
 * Attempt to convert the given SVG element into a `SvgSymbolElement`
 * and/or a list of accompanying `SvgSymbolDef` objects.
 *
 * Note that the latter will be "returned" to the caller via the
 * `defsOutput` argument.
 */
function serializeSvgSymbolElement(
  $: cheerio.Root,
  el: cheerio.TagElement,
  defsOutput: SvgSymbolDef[]
): SvgSymbolElement | null {
  const { tagName } = el;
  if (tagName === "radialGradient") {
    defsOutput.push(parseRadialGradient(el));
    return null;
  }
  let children = withoutNulls(
    onlyTags(el.children).map((child) =>
      serializeSvgSymbolElement($, child, defsOutput)
    )
  );
  if (isSupportedSvgTag(tagName)) {
    return {
      tagName,
      props: attribsToProps(el) as any,
      children,
    };
  }
  throw new Error(`Unsupported SVG element: <${tagName}>`);
}

function removeEmptyGroups(s: SvgSymbolElement[]): SvgSymbolElement[] {
  return s
    .filter((child) => !(child.tagName === "g" && child.children.length === 0))
    .map((s) => ({
      ...s,
      children: removeEmptyGroups(s.children),
    }));
}

export function convertSvgMarkupToSymbolData(
  filename: string,
  svgMarkup: string
): SvgSymbolData {
  const name = path.basename(filename, SVG_EXT).toLowerCase();
  const $ = cheerio.load(svgMarkup);
  const svgEl = $("svg");
  const outputDefs: SvgSymbolDef[] = [];
  const rawLayers = removeEmptyGroups(
    withoutNulls(
      onlyTags(svgEl.children()).map((ch) =>
        serializeSvgSymbolElement($, ch, outputDefs)
      )
    )
  );
  const [specs, layers] = extractSpecs(rawLayers);
  const bbox = getSvgBoundingBox(layers);
  const defs = outputDefs.length ? outputDefs : undefined;

  const symbol: SvgSymbolData = {
    name,
    bbox,
    layers,
    specs,
    defs,
  };
  return symbol;
}

export function build() {
  const filenames = fs.readdirSync(SVG_SYMBOLS_DIR);
  const vocab: SvgSymbolData[] = [];
  for (let filename of filenames) {
    if (path.extname(filename) === SVG_EXT) {
      let filenames = filename;
      let metaToml: string | null = null;
      const metaFilename = `${path.basename(filename, SVG_EXT)}.toml`;
      const metaFilepath = path.join(SVG_SYMBOLS_DIR, metaFilename);
      if (fs.existsSync(metaFilepath)) {
        filenames += ` and ${metaFilename}`;
        metaToml = fs.readFileSync(metaFilepath, {
          encoding: "utf-8",
        });
      }
      console.log(`Adding ${filenames} to vocabulary.`);
      const svgMarkup = fs.readFileSync(path.join(SVG_SYMBOLS_DIR, filename), {
        encoding: "utf-8",
      });
      const symbol = convertSvgMarkupToSymbolData(filename, svgMarkup);
      if (metaToml) {
        const { metadata, unknownProperties } = validateSvgSymbolMetadata(
          toml.parse(metaToml)
        );
        symbol.meta = metadata;
        if (unknownProperties.length) {
          console.log(
            `WARNING: Found unknown metadata properties ${unknownProperties.join(
              ", "
            )}.`
          );
        }
      }
      vocab.push(symbol);
    }
  }

  console.log(`Writing ${VOCAB_JSON_PATH} (for debugging output).`);
  fs.writeFileSync(VOCAB_JSON_PATH, JSON.stringify(vocab, null, 2));

  // Ugh, we need to write out a TypeScript file instead of importing
  // the JSON directly because otherwise the TS compiler will spend
  // a huge amount of resources doing type inference, which massively
  // slows down type-checking (especially in IDEs and such).
  console.log(`Writing ${VOCAB_TS_PATH} (for importing into code).`);
  const stringified = JSON.stringify(vocab);
  fs.writeFileSync(
    VOCAB_TS_PATH,
    [
      "// This file is auto-generated, please do not modify it.",
      `import type { SvgSymbolData } from "./svg-symbol";`,
      `const _SvgVocabulary: SvgSymbolData[] = JSON.parse(${JSON.stringify(
        stringified
      )});`,
      `export default _SvgVocabulary;`,
    ].join("\n")
  );
}
