import fs from "fs";
import path from "path";
import cheerio from "cheerio";

export type SvgSymbolData = {
  name: string;
  width: number;
  height: number;
  svg: string;
};

const MY_DIR = __dirname;
const SVG_DIR = path.join(MY_DIR, "..", "svg");
const VOCAB_PATH = path.join(MY_DIR, "svg-vocabulary.json");
const SVG_EXT = ".svg";

function removeAttrIfNotNone(
  attr: string,
  $: cheerio.Root,
  g: cheerio.Cheerio
) {
  const items = g.find(`[${attr}]`);
  items.each(function (this: any, i, el) {
    if ($(this).attr(attr) !== "none") {
      $(this).removeAttr(attr);
    }
  });
}

function getSvgPixelDimension($: cheerio.Root, attr: string): number {
  const value = $("svg").attr(attr);
  if (!value) {
    throw new Error(`<svg> ${attr} attribute is empty or missing!`);
  }
  const match = value.match(/^(\d+)px$/);
  if (!match) {
    throw new Error(
      `unable to parse <svg> ${attr} attribute value '${value}'!`
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
      const g = $("svg > g");
      removeAttrIfNotNone("fill", $, g);
      removeAttrIfNotNone("stroke", $, g);
      const name = path.basename(filename, SVG_EXT);
      const svg = g.html();
      if (!svg) {
        throw new Error(`${filename} has no <g> with child elements!`);
      }
      const symbol: SvgSymbolData = {
        name,
        svg,
        width,
        height,
      };
      vocab.push(symbol);
    }
  }

  console.log(`Writing ${VOCAB_PATH}.`);
  fs.writeFileSync(VOCAB_PATH, JSON.stringify(vocab, null, 2));
}
