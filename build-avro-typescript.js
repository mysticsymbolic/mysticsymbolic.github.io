const path = require("path");
const fs = require("fs");
const prettier = require("prettier");
const { avroToTypeScript } = require("avro-typescript");

/**
 * These are all the Avro AVSC JSON files we want to have
 * TypeScript representations for.
 */
const AVSC_FILES = ["./lib/pages/mandala-page/mandala-design.avsc.json"];

/**
 * Convert the given Avro AVSC JSON file into its TypeScript representation,
 * writing out the file to the same path but with a `.ts` extension
 * instead of `.json`.
 *
 * @param {string} avscPath The path to the Avro AVSC JSON file.
 */
function createTypescriptSync(avscPath) {
  const avsc = JSON.parse(fs.readFileSync(avscPath, { encoding: "utf-8" }));
  const dirname = path.dirname(avscPath);
  const basename = path.basename(avscPath, ".json");
  const filepath = path.join(dirname, `${basename}.ts`);
  const ts = prettier.format(
    [
      `// This file was auto-generated from ${basename}.json, please do not edit it.`,
      "",
      avroToTypeScript(avsc),
    ].join("\n"),
    { filepath }
  );
  console.log(`Writing ${filepath}.`);
  fs.writeFileSync(filepath, ts, { encoding: "utf-8" });
}

AVSC_FILES.forEach(createTypescriptSync);
