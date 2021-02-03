import fs from "fs";
import path from "path";
import cheerio from "cheerio";

const MY_DIR = __dirname;
const SVG_DIR = path.join(MY_DIR, "..", "svg");

function removeAttr(attr: string, $: cheerio.Root, g: cheerio.Cheerio) {
  const items = g.find(`[${attr}]`);
  items.each(function (this: any, i, el) {
    $((this)).removeAttr(attr);
  });
}

export function build() {
  const filenames = fs.readdirSync(SVG_DIR);
  for (let filename of filenames) {
    if (path.extname(filename) === ".svg") {
      const svgMarkup = fs.readFileSync(path.join(SVG_DIR, filename), {
        encoding: "utf-8",
      });
      const $ = cheerio.load(svgMarkup);
      const g = $("svg > g");
      removeAttr('fill', $, g);
      removeAttr('stroke', $, g);
      console.log(filename, g.html());
    }
  }
}
