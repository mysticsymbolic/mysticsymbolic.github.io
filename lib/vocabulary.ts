import fs from "fs";
import path from "path";
import cheerio from "cheerio";

const MY_DIR = __dirname;
const SVG_DIR = path.join(MY_DIR, "..", "svg");

export function build() {
  const filenames = fs.readdirSync(SVG_DIR);
  for (let filename of filenames) {
    if (path.extname(filename) === ".svg") {
      const svg = fs.readFileSync(path.join(SVG_DIR, filename), {
        encoding: "utf-8",
      });
      console.log(filename, svg);
    }
  }
}
