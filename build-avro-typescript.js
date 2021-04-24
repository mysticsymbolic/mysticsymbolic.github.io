const path = require("path");
const fs = require("fs");
const prettier = require("prettier");
const { avroToTypeScript } = require("avro-typescript");

/**
 * @param {string} avscPath
 */
function createTypescriptSync(avscPath) {
  const avsc = JSON.parse(fs.readFileSync(avscPath, { encoding: "utf-8" }));
  const dirname = path.dirname(avscPath);
  const basename = path.basename(avscPath, ".json");
  const filepath = path.join(dirname, `${basename}.ts`);
  const ts = prettier.format(
    [
      "// This file was auto-generated, please do not edit it.\n",
      avroToTypeScript(avsc),
    ].join("\n"),
    { filepath }
  );
  console.log(`Writing ${filepath}.`);
  fs.writeFileSync(filepath, ts, { encoding: "utf-8" });
}

const AVSC_FILES = ["./lib/pages/mandala-page/mandala-design.avsc.json"];

AVSC_FILES.forEach(createTypescriptSync);
